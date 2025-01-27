import { useState, useEffect, useMemo, useCallback } from "react"
import { EditorToolbar } from "@/components/editor/EditorToolbar"
import { ModeSelector } from "@/components/editor/ModeSelector"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { FolderInput, Check, FolderIcon, ChevronDown, Bug, Maximize2, Save } from 'lucide-react'
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tag } from 'lucide-react'
import { useAuth } from "@/components/AuthProvider"
import { useProject } from "@/components/ProjectContext"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useEditor, EditorContent, Editor, ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import BubbleMenu from '@tiptap/extension-bubble-menu'
import BulletList from '@tiptap/extension-bullet-list'
import OrderedList from '@tiptap/extension-ordered-list'
import Highlight from '@tiptap/extension-highlight'
import CharacterCount from '@tiptap/extension-character-count'
import TextStyle from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import { Extension } from '@tiptap/core'
import { TextSelection } from '@tiptap/pm/state'
import { EditorBubbleMenu } from "@/components/editor/BubbleMenu"
import { LinkDialog } from "@/components/editor/LinkDialog"
import { Note } from "@/types/note"
import "@/components/editor/Editor.css"
import { Sidebar } from "@/components/Sidebar"
import { cn } from "@/lib/utils"
import { useSidebar } from "@/components/SidebarContext"
import CollaborationCursor from '@tiptap/extension-collaboration-cursor'
import { useCollaboration } from '@/hooks/use-collaboration'
import { TaskSidebar } from "@/components/TaskSidebar"
import type { TaskType, Stage, Priority } from "@/types/task"
import { TaskHighlight } from "@/components/editor/extensions/TaskHighlight"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useNavigate, useLocation } from "react-router-dom"
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"
import { ImageWithPreview } from '@/components/editor/extensions/ImageWithPreview'
import { EditorView } from 'prosemirror-view'
import { Slice } from 'prosemirror-model'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    imageWithPreview: {
      setImage: (options: { src: string }) => ReturnType;
      removeImage: (src: string) => ReturnType;
    }
  }
}

// Custom extension for handling empty list items
const ListKeyboardShortcuts = Extension.create({
  name: 'listKeyboardShortcuts',
  addKeyboardShortcuts() {
    return {
      Backspace: () => {
        const { empty, $anchor } = this.editor.state.selection
        const isAtStart = $anchor.pos === $anchor.start()
        
        // Check if we're in a list item and it's empty
        if (empty && (this.editor.isActive('bulletList') || this.editor.isActive('orderedList'))) {
          const node = $anchor.node()
          if (node.textContent === '' && isAtStart) {
            // If in a list and the item is empty, lift the list item
            return this.editor.commands.liftListItem('listItem')
          }
        }

        // Handle backspace at the start of a paragraph that follows a list
        if (empty && isAtStart && !this.editor.isActive('bulletList') && !this.editor.isActive('orderedList')) {
          const pos = $anchor.pos
          const resolvedPos = this.editor.state.doc.resolve(pos)
          const before = resolvedPos.nodeBefore
          
          // If there's a list before the current paragraph
          if (before && (before.type.name === 'bulletList' || before.type.name === 'orderedList')) {
            const listType = before.type.name === 'bulletList' ? 'bulletList' : 'orderedList'
            const command = listType === 'bulletList' ? 'toggleBulletList' : 'toggleOrderedList'
            return this.editor.commands[command]()
          }
        }
        
        return false
      },
    }
  },
})

// Add a type for collaborator
interface Collaborator {
  id: string;
  name: string | null;
  color: string;
  avatar?: string;
}

// Add a function to generate a random color for cursors
const getRandomColor = () => {
  const colors = [
    '#958DF1',
    '#F98181',
    '#FBBC88',
    '#FAF594',
    '#70CFF8',
    '#94FADB',
    '#B9F18D',
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

interface PresenceState {
  id: string;
  name: string | null;
  color: string;
  avatar?: string;
  presence_ref: string;
}

// Handles image deletion
const handleKeyDown = ({ editor }: { editor: Editor }) => {
  return (view: EditorView, event: KeyboardEvent) => {
    if ((event.key === 'Backspace' || event.key === 'Delete') && editor.isActive('imageWithPreview')) {
      const node = editor.state.selection.$anchor.parent;
      const imageUrl = node.attrs.src;
      
      if (imageUrl) {
        editor.commands.removeImage(imageUrl);
      }
    }
    return false;
  };
};

// Add getAvatarFallback helper function
const getAvatarFallback = (collaborator: Collaborator) => {
  // If we have a name, use its initials
  if (collaborator.name) {
    return collaborator.name
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase();
  }
  
  // If no name, show bug icon
  return <Bug className="h-4 w-4" />;
};

export default function Notes() {
  const navigate = useNavigate();
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [title, setTitle] = useState("");
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [selectedProjectForNote, setSelectedProjectForNote] = useState<{ id: string, name: string } | null>(null);
  const [isPrivate, setIsPrivate] = useState(false);
  const { user } = useAuth();
  const { currentProject } = useProject();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [isMovingDesktop, setIsMovingDesktop] = useState(false);
  const [isMovingMobile, setIsMovingMobile] = useState(false);
  const { expanded } = useSidebar();
  const [taskSidebarOpen, setTaskSidebarOpen] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const [selectedStage] = useState<Stage>("To Do");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [pendingProjectId, setPendingProjectId] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<'dashboard' | 'close' | 'signout' | null>(null);
  const [isManualDiscard, setIsManualDiscard] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskType | null>(null);
  const [selectedRange, setSelectedRange] = useState<{ from: number, to: number } | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [lastClickTime, setLastClickTime] = useState(0);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');

  // Create note mutation
  const createNote = useMutation({
    mutationFn: async (options?: { isAutoSave?: boolean; content?: string; noteTitle?: string }) => {
      if (!user) return;
      
      // Use provided content/title or get from editor if available
      const content = options?.content ?? (editor ? editor.getHTML() : '') ?? '';
      const noteTitle = options?.noteTitle ?? title ?? 'Untitled Note';
      
      if (currentNote?.id) {
        // Update existing note
        const { data, error } = await supabase
          .from('notes')
          .update({
            content,
            title: noteTitle,
            updated_at: new Date().toISOString(),
          })
          .eq('id', currentNote.id)
          .select()
          .single();
          
        if (error) throw error;
        return { data, isAutoSave: options?.isAutoSave };
      } else {
        // Create new note
        const { data, error } = await supabase
          .from('notes')
          .insert([
            {
              content,
              title: noteTitle,
              user_id: user.id,
              project_id: currentProject?.id,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ])
          .select()
          .single();
          
        if (error) throw error;
        return { data, isAutoSave: options?.isAutoSave, isNewNote: true };
      }
    },
    onSuccess: (result) => {
      if (!result) return;
      const { data, isAutoSave, isNewNote } = result;
      
      // Only show toast and invalidate queries for manual saves or new notes
      if (!isAutoSave || isNewNote) {
        toast({
          title: "Note saved successfully",
          variant: "default",
        });
        queryClient.invalidateQueries({ queryKey: ['notes'] });
      }
      
      // Update currentNote without changing editor content
      if (!currentNote?.id) {
        setCurrentNote(data);
        if (editor) {
          editor.commands.updateAttributes('note', { id: data.id });
        }
      }
      
      // Set save status to saved after a delay
      setTimeout(() => {
        setSaveStatus('saved');
      }, 500);
    },
    onError: (error) => {
      console.error('Error saving note:', error);
      toast({
        title: "Failed to save note",
        description: "Please try again",
        variant: "destructive",
      });
      setSaveStatus('saved');
    },
  });

  const handleImageUpload = async (file: File): Promise<boolean> => {
    if (!user || !currentNote) {
      toast({
        title: "Error uploading image",
        description: "Please select a note first",
        variant: "destructive",
      });
      return false;
    }

    try {
      setUploading(true);

      // Validate file
      if (!file || !file.size || !file.type) {
        throw new Error("Invalid file");
      }

      // Create a unique filename that includes note and user IDs for tracking
      const fileExt = file.name.split('.').pop();
      // Format: note-{noteId}-{userId}-{uuid}.{ext}
      const fileName = `note-${currentNote.id}-${user.id}-${crypto.randomUUID()}${fileExt ? `.${fileExt}` : ''}`;

      // Upload directly to bucket root
      const { error: uploadError } = await supabase.storage
        .from("notes-images")
        .upload(fileName, file, {
          metadata: {
            owner: user.id,        // Must match the trigger's expected format
            size: file.size.toString(),  // Must be a string
            contentType: file.type,
            note_id: currentNote.id
          }
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("notes-images")
        .getPublicUrl(fileName);

      editor?.commands.setImage({ src: publicUrl });

      toast({
        title: "Image uploaded",
        description: "Image has been added to your note",
      });
      return true;
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Error uploading image",
        description: "Please try again later",
        variant: "destructive",
      });
      return false;
    } finally {
      setUploading(false);
    }
  };

  const handlePaste = (view: EditorView, event: ClipboardEvent, slice: Slice) => {
    const items = Array.from(event.clipboardData?.items || []);
    const imageItem = items.find(item => item.type.startsWith('image'));

    if (!imageItem) return false;

    event.preventDefault();
    const file = imageItem.getAsFile();
    if (!file) return false;

    handleImageUpload(file);
    return true;
  };

  // Initialize editor first
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: false,
        orderedList: false,
      }),
      TextStyle,
      Color,
      Link.configure({
        openOnClick: true,
        HTMLAttributes: {
          target: '_blank',
          rel: 'noopener noreferrer',
          class: 'cursor-pointer'
        },
        validate: (href: string) => /^https?:\/\//.test(href),
      }),
      BulletList.configure({
        keepMarks: true,
        keepAttributes: false,
      }),
      OrderedList.configure({
        keepMarks: true,
        keepAttributes: false,
      }),
      Highlight.configure({
        multicolor: true,
        HTMLAttributes: {
          class: 'highlighted-text',
        },
      }),
      CharacterCount.configure({
        limit: null,
      }),
      BubbleMenu.configure({
        shouldShow: ({ editor, state }) => {
          const selection = state.selection;
          const isTextSelection = selection instanceof TextSelection;
          const hasSelection = !selection.empty;
          return isTextSelection && hasSelection && !editor.isActive('image') && !taskSidebarOpen;
        },
      }),
      ListKeyboardShortcuts,
      TaskHighlight.configure({}),
      ImageWithPreview,
    ],
    content: currentNote?.content || "",
    editable: true,
    autofocus: true,
    editorProps: {
      handlePaste,
      handleKeyDown: (view: EditorView, event: KeyboardEvent) => {
        if ((event.key === 'Backspace' || event.key === 'Delete') && editor?.isActive('imageWithPreview')) {
          const node = editor.state.selection.$anchor.parent;
          const imageUrl = node.attrs.src;
          
          if (imageUrl) {
            editor.commands.removeImage(imageUrl);
          }
        }
        return false;
      },
    },
  });

  // Initialize collaboration after editor is created
  const { channel, collaborators, userColor, broadcastContent } = useCollaboration(currentNote, editor, user);

  // Create the debounced save function
  const debouncedSave = useMemo(() => {
    let timeoutId: NodeJS.Timeout;
    let pendingPromise: Promise<any> | null = null;
    
    return async (content: string, noteTitle: string) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      setSaveStatus('saving');
      
      // Return existing promise if there's a save in progress
      if (pendingPromise) {
        return pendingPromise;
      }
      
      pendingPromise = new Promise((resolve) => {
        timeoutId = setTimeout(async () => {
          if (!user || !editor) {
            pendingPromise = null;
            resolve(null);
            return;
          }
          
          try {
            const result = await createNote.mutateAsync({ 
              isAutoSave: true,
              content,
              noteTitle,
            });
            
            // Only update editor content if we're still editing the same note
            const currentNoteId = editor.getAttributes('note')?.id;
            if (currentNoteId === result?.data?.id) {
              editor.commands.setContent(content);
            }
            
            setHasUnsavedChanges(false);
            pendingPromise = null;
            resolve(result);
          } catch (error) {
            console.error('Error auto-saving:', error);
            pendingPromise = null;
            resolve(null);
          }
        }, 2000);
      });
      
      return pendingPromise;
    };
  }, [user, editor, createNote]);

  // Add update handler to editor after debouncedSave is defined
  useEffect(() => {
    if (!editor) return;

    const handleUpdate = ({ editor }: { editor: Editor }) => {
      const content = editor.getHTML();
      
      // Broadcast changes immediately for real-time collaboration
      if (channel) {
        broadcastContent(content);
      }

      // Set status to unsaved when content changes
      if (content !== '<p></p>') {
        setHasUnsavedChanges(true);
        setSaveStatus('saving');
        debouncedSave(content, title);
      }
    };

    editor.on('update', handleUpdate);
    return () => {
      editor.off('update', handleUpdate);
    };
  }, [editor, channel, broadcastContent, debouncedSave, title, currentNote]);

  // Update editor extensions when channel changes
  useEffect(() => {
    if (!editor || !channel) return;

    editor.extensionManager.extensions = [
      ...editor.extensionManager.extensions,
      CollaborationCursor.configure({
        provider: channel,
        user: {
          name: user?.email || 'Anonymous',
          color: userColor,
          avatar: user?.user_metadata?.avatar_url,
        },
      }),
    ];
  }, [channel, editor, user, userColor]);

  // Load note content when a note is selected
  useEffect(() => {
    if (!currentNote || !editor) return;
    
    // Always update title and privacy setting
    setTitle(currentNote.title);
    setIsPrivate(currentNote.is_private || false);
    
    // Get the current note ID from editor attributes
    const currentNoteId = editor.getAttributes('note')?.id;
    
    // Always load content when switching to a different note
    if (currentNote.id !== currentNoteId) {
      editor.commands.setContent(currentNote.content || '');
      editor.commands.updateAttributes('note', { id: currentNote.id });
      setHasUnsavedChanges(false);
      setSaveStatus('saved');
    }
  }, [currentNote, editor]);

  const saveLastViewedNote = (noteId: string | null) => {
    if (noteId) {
      localStorage.setItem('lastViewedNoteId', noteId);
    } else {
      localStorage.removeItem('lastViewedNoteId');
    }
  };

  const handleNoteSelect = async (note: Note) => {
    try {
      if (hasUnsavedChanges) {
        // Save current note's changes first
        setSaveStatus('saving');
        const content = editor?.getHTML() || '';
        await debouncedSave(content, title);
      }
      
      // Fetch the latest version of the note from the database
      const { data: latestNote, error } = await supabase
        .from("notes")
        .select("*")
        .eq("id", note.id)
        .single();
        
      if (error) throw error;
      
      // After save completes (or if no unsaved changes), switch to new note
      setCurrentNote(latestNote);
      setSelectedProjectForNote(null);
      saveLastViewedNote(latestNote.id);
      setHasUnsavedChanges(false);
      setSaveStatus('saved');
      
      // Ensure editor content is updated with the latest note content
      if (editor && latestNote.content) {
        editor.commands.setContent(latestNote.content);
        editor.commands.updateAttributes('note', { id: latestNote.id });
      }
    } catch (error) {
      console.error('Error switching notes:', error);
      toast({
        title: "Error switching notes",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  // Move this effect after the notes query
  const { data: notes = [], isLoading } = useQuery({
    queryKey: ["notes", currentProject?.id],
    queryFn: async () => {
      console.log("Fetching notes for project:", currentProject?.id)
      if (!user || !currentProject?.id) return []

      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .eq("project_id", currentProject.id)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching notes:", error)
        throw error
      }

      return data
    },
    enabled: !!currentProject?.id && !!user?.id,
  });

  // Add effect to restore last viewed note
  useEffect(() => {
    if (!notes.length) return;

    const lastViewedNoteId = localStorage.getItem('lastViewedNoteId');
    if (lastViewedNoteId) {
      const lastNote = notes.find(note => note.id === lastViewedNoteId);
      if (lastNote) {
        setCurrentNote(lastNote);
      }
    }
  }, [notes]);

  const handleNewNote = async (projectId: string) => {
    if (hasUnsavedChanges) {
      setPendingProjectId(projectId);
      setShowUnsavedDialog(true);
      return;
    }

    await proceedWithNewNote(projectId);
  };

  const proceedWithNewNote = async (projectId: string) => {
    try {
      // Get project info
      const { data: projectInfo, error: projectError } = await supabase
        .from("projects")
        .select("id, name")
        .eq("id", projectId)
        .single();

      if (projectError) {
        console.error("Error fetching project:", projectError);
        return;
      }

      // Create new empty note in the database
      const { data: newNote, error: noteError } = await supabase
        .from("notes")
        .insert([
          {
            content: '',
            title: 'Untitled Note',
            user_id: user?.id,
            project_id: projectId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (noteError) throw noteError;

      // Update local state
      setSelectedProjectForNote(projectInfo);
      setCurrentNote(newNote);
      setTitle("Untitled Note");
      editor?.commands.setContent("");
      editor?.commands.updateAttributes('note', { id: newNote.id });
      setHasUnsavedChanges(false);
      setSaveStatus('saved');

      // Invalidate notes query to update ModeSelector
      queryClient.invalidateQueries({ queryKey: ['notes'] });

    } catch (error) {
      console.error("Error creating new note:", error);
      toast({
        title: "Error creating note",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleSaveAndContinue = async () => {
    await createNote.mutateAsync({});
    
    switch (pendingAction) {
      case 'dashboard':
        navigate('/dashboard');
        break;
      case 'signout':
        await supabase.auth.signOut();
        break;
      default:
        if (pendingProjectId) {
          proceedWithNewNote(pendingProjectId);
        }
    }
    
    setShowUnsavedDialog(false);
    setPendingProjectId(null);
    setPendingAction(null);
  };

  const handleDiscardChanges = () => {
    // Clear editor content and state before navigation
    editor?.commands.clearContent();
    setTitle("");
    setHasUnsavedChanges(false);
    setIsManualDiscard(true);
    
    switch (pendingAction) {
      case 'dashboard':
        navigate('/dashboard');
        break;
      case 'signout':
        supabase.auth.signOut();
        break;
      default:
        if (pendingProjectId) {
          proceedWithNewNote(pendingProjectId);
        }
    }
    
    setShowUnsavedDialog(false);
    setPendingProjectId(null);
    setPendingAction(null);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex">
        <div className={cn(
          "w-64 border-r transition-all duration-300 ease-in-out",
          expanded ? "translate-x-0" : "-translate-x-64"
        )}>
          <ModeSelector
            currentNote={currentNote}
            onNoteSelect={handleNoteSelect}
            onNewNote={handleNewNote}
            selectedProjectId={pendingProjectId}
          />
        </div>
        
        <div className="flex-1 flex flex-col min-w-0">
          <div className="border-b p-4">
            <Input
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setHasUnsavedChanges(true);
                debouncedSave(editor?.getHTML() || '', e.target.value);
              }}
              placeholder="Untitled Note"
              className="text-xl font-semibold border-none focus-visible:ring-0 px-0"
            />
          </div>
          
          <div className="p-4 border-b">
            <EditorToolbar
              editor={editor}
              onFormatClick={() => {}}
              modeSelector={
                <ModeSelector
                  currentNote={currentNote}
                  onNoteSelect={handleNoteSelect}
                  onNewNote={handleNewNote}
                  selectedProjectId={pendingProjectId}
                />
              }
              isPrivate={isPrivate}
              onVisibilityChange={setIsPrivate}
              isNoteOwner={true}
              saveStatus={saveStatus}
            />
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            <EditorContent editor={editor} />
          </div>
        </div>
      </div>

      <AlertDialog open={showUnsavedDialog} onOpenChange={setShowUnsavedDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Would you like to save them before continuing?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowUnsavedDialog(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDiscardChanges}>
              Discard Changes
            </AlertDialogAction>
            <AlertDialogAction onClick={handleSaveAndContinue}>
              Save & Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <LinkDialog
        open={showLinkDialog}
        onOpenChange={setShowLinkDialog}
        editor={editor}
      />

      <TaskSidebar
        open={taskSidebarOpen}
        onOpenChange={setTaskSidebarOpen}
        selectedText={selectedText}
        selectedTask={selectedTask}
        onTaskSelect={setSelectedTask}
        selectedRange={selectedRange}
        editor={editor}
      />
    </div>
  );
}
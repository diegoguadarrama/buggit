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
import { TaskSidebar } from "@/components/TaskSidebar";
import type { TaskType, Stage, Priority } from "@/types/task";
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
import { EditorView } from 'prosemirror-view';
import { Slice } from 'prosemirror-model';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    imageWithPreview: {
      setImage: (options: { src: string }) => ReturnType
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

export const ImageNodeView = ({ node, updateAttributes }: any) => {
  return (
    <NodeViewWrapper>
      <div className="relative inline-block group">
        <img
          src={node.attrs.src}
          className="rounded-md"
          style={{ width: '300px', height: 'auto' }}
        />
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => window.handleImagePreview?.(node.attrs.src)}
            className="p-1 bg-background/80 backdrop-blur-sm rounded-md hover:bg-background/90 transition-colors"
            type="button"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </NodeViewWrapper>
  );
};

export default function Notes() {
  const navigate = useNavigate();
  const [currentNote, setCurrentNote] = useState<Note | null>(null)
  const [title, setTitle] = useState("")
  const [showLinkDialog, setShowLinkDialog] = useState(false)
  const [selectedProjectForNote, setSelectedProjectForNote] = useState<{ id: string, name: string } | null>(null)
  const [isPrivate, setIsPrivate] = useState(false)
  const { user } = useAuth()
  const { currentProject } = useProject()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [uploading, setUploading] = useState(false)
  const [isMovingDesktop, setIsMovingDesktop] = useState(false)
  const [isMovingMobile, setIsMovingMobile] = useState(false)
  const { expanded } = useSidebar()
  const [taskSidebarOpen, setTaskSidebarOpen] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const [selectedStage] = useState<Stage>("To Do");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [pendingProjectId, setPendingProjectId] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<'dashboard' | 'close' | 'signout' | null>(null);
  const [isManualDiscard, setIsManualDiscard] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskType | null>(null);
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
        return { data, isAutoSave: options?.isAutoSave };
      }
    },
    onSuccess: (result) => {
      if (!result) return;
      const { data, isAutoSave } = result;
      
      // Only show toast and invalidate queries for manual saves
      if (!isAutoSave) {
        toast({
          title: "Note saved successfully",
          variant: "default",
        });
        queryClient.invalidateQueries({ queryKey: ['notes'] });
      }
      
      // For auto-saves, only update currentNote if it's a new note
      if (isAutoSave) {
        if (!currentNote?.id) {
          setCurrentNote(data);
        }
      } else {
        // For manual saves, always update currentNote
        setCurrentNote(data);
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
      const fileName = `${crypto.randomUUID()}-${file.name}`;
      const filePath = `${user.id}/notes/${currentNote.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("notes-images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("notes-images")
        .getPublicUrl(filePath);

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

  // Initialize editor
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
          const selection = state.selection
          const isTextSelection = selection instanceof TextSelection
          return isTextSelection && !editor.isActive('image')
        },
        tippyOptions: {
          duration: 100,
          appendTo: () => document.body,
          placement: 'top',
          onClickOutside: () => {
            editor?.commands.focus()
          },
        }
      }),
      ListKeyboardShortcuts,
      TaskHighlight.configure({}),
      ImageWithPreview,
    ],
    content: currentNote?.content || "",
    onUpdate: ({ editor }) => {
      const content = editor.getHTML();
      if (content !== '<p></p>') {
        setHasUnsavedChanges(true);
        debouncedSave(content, title);
      }
    },
    autofocus: true,
    editorProps: {
      handlePaste,
    },
  })

  // Create the debounced save function with a longer delay
  const debouncedSave = useMemo(() => {
    let timeoutId: NodeJS.Timeout;
    let isFirstSave = true;
    
    return (content: string, noteTitle: string) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      setSaveStatus('saving');
      
      timeoutId = setTimeout(async () => {
        if (!user || !editor) return;
        
        try {
          await createNote.mutateAsync({ 
            isAutoSave: true,
            content,
            noteTitle,
          });
          
          if (isFirstSave) {
            isFirstSave = false;
          }
          setHasUnsavedChanges(false); // Mark changes as saved after successful auto-save
        } catch (error) {
          console.error('Error auto-saving:', error);
          isFirstSave = true; // Reset first save flag on error
        }
      }, 2000);
    };
  }, [user, editor, createNote]);

  // Update editor onUpdate handler
  useEffect(() => {
    if (!editor) return;
    
    const handler = ({ editor }: { editor: Editor }) => {
      const currentContent = editor.getHTML();
      
      // Only trigger save if content is not empty
      if (currentContent !== '<p></p>') {
        setHasUnsavedChanges(true);
        // Pass the current content directly to avoid any race conditions
        const currentTitle = title;
        debouncedSave(currentContent, currentTitle);
      }
    }

    editor.on('update', handler);
    return () => {
      editor.off('update', handler);
    }
  }, [editor, title, debouncedSave]);

  // Initialize collaboration after editor is created
  const { channel, collaborators, userColor, broadcastContent } = useCollaboration(currentNote, editor, user)

  // Update editor extensions when channel changes
  useEffect(() => {
    if (!editor || !channel) return

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
    ]
  }, [channel, editor, user, userColor])

  // Add broadcast handler to editor updates
  useEffect(() => {
    if (!editor) return

    const handler = ({ editor }: { editor: Editor }) => {
      const content = editor.getHTML()
      broadcastContent(content)
    }

    editor.on('update', handler)

    return () => {
      editor.off('update', handler)
    }
  }, [editor, broadcastContent])

  // Load note content when a note is selected
  useEffect(() => {
    if (!currentNote || !editor) return;
    
    // Only update title and privacy setting
    setTitle(currentNote.title);
    setIsPrivate(currentNote.is_private || false);
    
    // Only set content if this is a different note and not an auto-save update
    const isDifferentNote = currentNote.id !== editor.getAttributes('note')?.id;
    const isAutoSaveUpdate = currentNote.content === editor.getHTML();
    
    if (isDifferentNote && !isAutoSaveUpdate) {
      editor.commands.setContent(currentNote.content);
      editor.commands.updateAttributes('note', { id: currentNote.id });
      setHasUnsavedChanges(false); // Reset unsaved changes when switching notes
    }
  }, [currentNote, editor]);

  const saveLastViewedNote = (noteId: string | null) => {
    if (noteId) {
      localStorage.setItem('lastViewedNoteId', noteId);
    } else {
      localStorage.removeItem('lastViewedNoteId');
    }
  };

  const handleNoteSelect = (note: Note) => {
    setCurrentNote(note);
    setSelectedProjectForNote(null);
    saveLastViewedNote(note.id);
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

  const handleNewNote = (projectId: string) => {
    if (hasUnsavedChanges) {
      setPendingProjectId(projectId);
      setShowUnsavedDialog(true);
      return;
    }

    proceedWithNewNote(projectId);
  };

  const proceedWithNewNote = (projectId: string) => {
    const getProjectInfo = async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("id, name")
        .eq("id", projectId)
        .single();

      if (error) {
        console.error("Error fetching project:", error);
        return;
      }

      setSelectedProjectForNote(data);
      setCurrentNote(null);
      setTitle("");
      editor?.commands.setContent("");
      setHasUnsavedChanges(false);
    };

    getProjectInfo();
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

  // Add visibility change handler
  const handleVisibilityChange = async (newIsPrivate: boolean) => {
    setIsPrivate(newIsPrivate)
    
    // Only update database if we have a current note
    if (currentNote?.id) {
      const { error } = await supabase
        .from("notes")
        .update({ 
          is_private: newIsPrivate,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentNote.id)

      if (error) {
        console.error("Error updating note privacy:", error)
        toast({
          title: "Error",
          description: "Failed to update note privacy",
          variant: "destructive",
        })
        // Revert the state if update failed
        setIsPrivate(!newIsPrivate)
        return
      }

      // After successful privacy update, save the note to sync all changes
      await createNote.mutateAsync({});
    }

    toast({
      title: newIsPrivate ? "Note set to private" : "Note set to project",
      description: newIsPrivate 
        ? "This note is now only visible to you" 
        : "This note is now visible to all project members",
      duration: 3000,
    })
  }

  const handleFormatClick = (format: string) => {
    if (!editor) return

    console.log('Format clicked:', format)

    switch (format) {
      case 'image':
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = 'image/*'
        input.onchange = async (e) => {
          const file = (e.target as HTMLInputElement).files?.[0]
          if (file) {
            await handleImageUpload(file)
          }
        }
        input.click()
        break
      case 'link':
        if (editor.isActive('link')) {
          editor.chain().focus().unsetLink().run()
        } else {
          const url = editor.getAttributes('link').href
          if (url) {
            // If there's a link in the selection, apply it to the entire selection
            editor.chain().focus().setLink({ href: url }).run()
          } else {
            setShowLinkDialog(true)
          }
        }
        break
      case 'paragraph':
        editor.chain().focus().setParagraph().run()
        break
      case 'bold':
        editor.chain().focus().toggleBold().run()
        break
      case 'italic':
        editor.chain().focus().toggleItalic().run()
        break
      case 'highlight':
        break
      case 'h1':
        editor.chain().focus().toggleHeading({ level: 1 }).run()
        break
      case 'h2':
        editor.chain().focus().toggleHeading({ level: 2 }).run()
        break
      case 'h3':
        editor.chain().focus().toggleHeading({ level: 3 }).run()
        break
      case 'bullet-list':
        console.log('Toggling bullet list')
        editor.chain().focus().toggleBulletList().run()
        break
      case 'ordered-list':
        console.log('Toggling ordered list')
        editor.chain().focus().toggleOrderedList().run()
        break
      case 'align-left':
        break
      case 'undo':
        editor.chain().focus().undo().run()
        break
      case 'redo':
        editor.chain().focus().redo().run()
        break
    }
    
    console.log('Format applied:', format)
  }

  // Fetch all projects for the dropdown
  const { data: allProjects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("name", { ascending: true })

      if (error) throw error
      return data
    },
  })

  const moveNote = useMutation({
    mutationFn: async (projectId: string) => {
      if (!currentNote) return

      const { error } = await supabase
        .from("notes")
        .update({ 
          project_id: projectId,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentNote.id)

      if (error) throw error

      // After successful move, save the note to sync all changes
      await createNote.mutateAsync({});
      
      return projectId
    },
    onSuccess: (projectId) => {
      if (!projectId) return

      queryClient.invalidateQueries({ queryKey: ["notes"] })
      setIsMovingDesktop(false)
      setIsMovingMobile(false)
      toast({
        title: "Note moved",
        description: "Note has been moved to the selected project",
      })
    },
    onError: (error) => {
      console.error("Error moving note:", error)
      toast({
        title: "Error",
        description: "Failed to move note",
        variant: "destructive",
      })
    },
  })

  const deleteNote = useMutation({
    mutationFn: async () => {
      if (!currentNote?.id || !user) return
      
      // Check if user owns the note
      if (currentNote.user_id !== user.id) {
        throw new Error("You can only delete notes that you own")
      }

      const { error } = await supabase
        .from("notes")
        .delete()
        .eq('id', currentNote.id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] })
      setCurrentNote(null)
      setTitle("")
      editor?.commands.setContent("")
      toast({
        title: "Success",
        description: "Note deleted successfully",
      })
    },
    onError: (error: Error) => {
      console.error("Error deleting note:", error)
      toast({
        title: "Cannot delete note",
        description: error.message || "Failed to delete note",
        variant: "destructive",
      })
    },
  })

  const handleConfirmDelete = () => {
    if (!currentNote) return;

    // Store the current project context before deletion
    const projectId = currentNote?.project_id || selectedProjectForNote?.id || currentProject?.id;
    const project = allProjects.find(p => p.id === projectId);
    
    // Set the project context before triggering the delete mutation
    if (project) {
      setSelectedProjectForNote({ id: project.id, name: project.name });
    }
    
    saveLastViewedNote(null);
    deleteNote.mutate();
    setShowDeleteDialog(false);
    setDeleteConfirmation("");
  };

  const handleDelete = () => {
    if (!currentNote) {
      // If it's a new note, just clear the editor
      setCurrentNote(null);
      setTitle("");
      editor?.commands.setContent("");
      saveLastViewedNote(null);
      return;
    }

    handleDeleteClick();
  };

  const handleDeleteClick = () => {
    setDeleteConfirmation("");
    setShowDeleteDialog(true);
  };

  // Get the current project ID (either from the note or selected project for new notes)
  const getCurrentProjectId = () => {
    if (currentNote) {
      return currentNote.project_id
    }
    return selectedProjectForNote?.id || currentProject?.id
  }

  const handleCreateTaskFromText = () => {
    if (editor) {
      const { from, to } = editor.state.selection;
      const selectedText = editor.state.doc.textBetween(from, to);
      
      // Store selection range for later use when task is created
      editor.storage.taskHighlight = { from, to };
      
      // Clear the selection to hide bubble menu
      editor.commands.setTextSelection(from);
      
      setSelectedText(selectedText);
      setTaskSidebarOpen(true);
    }
  };

  const handleTaskCreate = async (task: Partial<TaskType>): Promise<TaskType | null> => {
    if (!currentProject?.id || !user?.id) return null;
    
    const { data, error } = await supabase
      .from("tasks")
      .insert({
        title: task.title || "Untitled Task",
        description: task.description || "",
        priority: (task.priority || "low") as Priority,
        stage: (task.stage || "To Do") as Stage,
        assignee: task.assignee || user.id,
        attachments: task.attachments || [],
        due_date: task.due_date || null,
        archived: false,
        project_id: currentProject.id,
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      toast({
        title: "Error creating task",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }

    // Only apply the highlight if task creation was successful
    if (editor && editor.storage.taskHighlight) {
      const { from, to } = editor.storage.taskHighlight;
      editor
        .chain()
        .focus()
        .setTextSelection({ from, to })
        .toggleMark('taskHighlight', { taskId: data.id })
        .run();
      
      // Clear the stored selection
      delete editor.storage.taskHighlight;
    }

    toast({
      title: "Task created",
      description: "Task has been created successfully.",
    });

    return data as TaskType;
  };

  // Update the TaskSidebar onOpenChange handler
  const handleTaskSidebarOpenChange = (open: boolean) => {
    setTaskSidebarOpen(open);
    if (!open) {
      // Clear selected task and text when closing
      setSelectedTask(null);
      setSelectedText("");
    }
  };

  // Add effect to handle clicks on task highlights
  useEffect(() => {
    if (!editor) return;

    const handleClick = async (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (target.classList.contains('task-highlight')) {
        const taskId = target.getAttribute('data-task-id');
        if (taskId) {
          try {
            const { data, error } = await supabase
              .from("tasks")
              .select("*")
              .eq("id", taskId)
              .single();

            if (error) {
              console.error("Error fetching task:", error);
              return;
            }

            if (data) {
              setSelectedTask(data as TaskType);
              setTaskSidebarOpen(true);
            }
          } catch (error) {
            console.error("Error handling task click:", error);
          }
        }
      }
    };

    const editorElement = editor.view.dom;
    editorElement.addEventListener('click', handleClick);

    return () => {
      editorElement.removeEventListener('click', handleClick);
    };
  }, [editor]);

  const handleTaskUpdate = async (task: TaskType): Promise<void> => {
    if (!currentProject?.id) return;

    const { error } = await supabase
      .from("tasks")
      .update({
        title: task.title,
        description: task.description,
        priority: task.priority,
        stage: task.stage,
        assignee: task.assignee,
        attachments: task.attachments,
        due_date: task.due_date,
        archived: task.archived,
        updated_at: new Date().toISOString(),
      })
      .eq("id", task.id)
      .eq("project_id", currentProject.id);

    if (error) {
      toast({
        title: "Error updating task",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Task updated",
        description: "Task has been updated successfully.",
      });
      // Refresh the task data after update
      const { data: updatedTask } = await supabase
        .from("tasks")
        .select("*")
        .eq("id", task.id)
        .single();
        
      if (updatedTask) {
        setSelectedTask(updatedTask as TaskType);
      }
    }
  };

  const handleTaskArchive = async (taskId: string): Promise<void> => {
    if (!currentProject?.id) return;
    const { error } = await supabase
      .from("tasks")
      .update({
        archived: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", taskId)
      .eq("project_id", currentProject.id);

    if (error) {
      toast({
        title: "Error archiving task",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Task archived",
        description: "Task has been archived successfully.",
      });
    }
  };

  // Add effect to track content changes
  useEffect(() => {
    if (!editor) return;
    
    const handler = ({ editor }: { editor: Editor }) => {
      // Compare current content with original content
      const currentContent = editor.getHTML();
      const originalContent = currentNote?.content || '';
      const currentTitle = title;
      const originalTitle = currentNote?.title || '';
      
      setHasUnsavedChanges(
        currentContent !== originalContent || 
        currentTitle !== originalTitle
      );
    }

    editor.on('update', handler);
    return () => {
      editor.off('update', handler);
    }
  }, [editor, currentNote, title]);

  const handleDashboardNavigation = () => {
    if (hasUnsavedChanges) {
      setPendingAction('dashboard');
      setShowUnsavedDialog(true);
      return false;
    }
    return true;
  };

  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    if (hasUnsavedChanges && !isManualDiscard) {
      e.preventDefault();
      e.returnValue = '';
    }
  };

  const handleSignOut = () => {
    if (hasUnsavedChanges) {
      setPendingAction('signout');
      setShowUnsavedDialog(true);
      return false;
    }
    return true;
  };

  // Add effect for beforeunload event
  useEffect(() => {
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  // Update the AlertDialog description to be dynamic
  const getDialogDescription = () => {
    switch (pendingAction) {
      case 'dashboard':
        return "You have unsaved changes in your current note. Would you like to save them before going to the dashboard?";
      case 'signout':
        return "You have unsaved changes in your current note. Would you like to save them before signing out?";
      default:
        return "You have unsaved changes in your current note. Would you like to save them before creating a new note?";
    }
  };

  // Add window handler for image preview
  useEffect(() => {
    window.handleImagePreview = (src: string) => {
      setPreviewImage(src);
    };

    return () => {
      delete window.handleImagePreview;
    };
  }, []);

  // Handle manual save
  const handleManualSave = async () => {
    await createNote.mutateAsync({});
    setHasUnsavedChanges(false);
  };

  return (
    <>
      <Sidebar 
        onDashboardClick={handleDashboardNavigation}
        onSignOut={handleSignOut}
      />
      <div className={cn(
        "min-h-screen bg-background",
        "md:ml-14",
        expanded ? "md:ml-52" : "md:ml-14"
      )}>
        <div className="container mx-auto p-2 sm:p-4">
          {/* Only show collaborators if there are others besides the current user */}
          {collaborators.length > 0 && collaborators.some(c => c.id !== user?.id) && (
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm text-muted-foreground">Collaborating with:</span>
              <div className="flex -space-x-2">
                {collaborators
                  .filter(collaborator => collaborator.id !== user?.id)
                  .map((collaborator) => (
                    <div
                      key={collaborator.id}
                      className="relative"
                      title={collaborator.name || 'Anonymous'}
                    >
                      <Avatar className="h-6 w-6 border-2 border-background">
                        <AvatarImage 
                          src={collaborator.avatar} 
                          alt={collaborator.name || 'Anonymous'} 
                        />
                        <AvatarFallback 
                          className="bg-[#123524] text-white text-xs dark:bg-[#00ff80] dark:text-black"
                          style={{ backgroundColor: collaborator.color }}
                        >
                          {collaborator.name ? (
                            collaborator.name
                              .split(' ')
                              .map(name => name[0])
                              .join('')
                              .toUpperCase()
                          ) : (
                            <Bug className="h-4 w-4" />
                          )}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  ))}
              </div>
            </div>
          )}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 mb-4">
            <div className="w-full sm:flex-1 flex items-center gap-2 bg-background rounded-md border">
              <Input
                type="text"
                placeholder="Note Title"
                className="text-xl font-semibold border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <DropdownMenu open={isMovingDesktop} onOpenChange={setIsMovingDesktop}>
                <DropdownMenuTrigger asChild>
                  <div className="hidden sm:flex items-center gap-1 pr-3 hover:text-foreground cursor-pointer">
                    <ChevronDown className="h-3 w-3 text-muted-foreground" />
                    <FolderIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                      {currentNote 
                        ? allProjects.find(p => p.id === currentNote.project_id)?.name 
                        : selectedProjectForNote?.name || currentProject?.name || 'No Project Selected'}
                    </span>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {allProjects.map(project => {
                    const isCurrentProject = project.id === getCurrentProjectId()
                    return (
                      <DropdownMenuItem
                        key={project.id}
                        className={`flex items-center justify-between ${isCurrentProject ? 'bg-muted' : ''}`}
                        onClick={() => moveNote.mutate(project.id)}
                      >
                        {project.name}
                        {isCurrentProject && <Check className="h-4 w-4" />}
                      </DropdownMenuItem>
                    )
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex gap-2 w-full sm:w-auto items-center justify-between sm:justify-end">
              <div className="flex sm:hidden items-center gap-1 text-muted-foreground">
                <DropdownMenu open={isMovingMobile} onOpenChange={setIsMovingMobile}>
                  <DropdownMenuTrigger asChild>
                    <div className="flex items-center gap-1 hover:text-foreground cursor-pointer">
                      <ChevronDown className="h-3 w-3" />
                      <FolderIcon className="h-4 w-4" />
                      <span className="text-sm whitespace-nowrap">
                        {currentNote 
                          ? allProjects.find(p => p.id === currentNote.project_id)?.name 
                          : selectedProjectForNote?.name || currentProject?.name || 'No Project Selected'}
                      </span>
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    {allProjects.map(project => {
                      const isCurrentProject = project.id === getCurrentProjectId()
                      return (
                        <DropdownMenuItem
                          key={project.id}
                          className={`flex items-center justify-between ${isCurrentProject ? 'bg-muted' : ''}`}
                          onClick={() => moveNote.mutate(project.id)}
                        >
                          {project.name}
                          {isCurrentProject && <Check className="h-4 w-4" />}
                        </DropdownMenuItem>
                      )
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <Button onClick={() => createNote.mutate({})}>
                {currentNote ? "Update Note" : "Save Note"}
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4">
            <div className="hidden lg:block">
              <ModeSelector
                currentNote={currentNote}
                onNoteSelect={handleNoteSelect}
                onNewNote={handleNewNote}
                selectedProjectId={currentNote?.project_id || selectedProjectForNote?.id || currentProject?.id}
              />
            </div>
            <div className="space-y-4">
              <EditorToolbar 
                onFormatClick={handleFormatClick} 
                editor={editor}
                modeSelector={
                  <ModeSelector
                    currentNote={currentNote}
                    onNoteSelect={handleNoteSelect}
                    onNewNote={handleNewNote}
                    selectedProjectId={currentNote?.project_id || selectedProjectForNote?.id || currentProject?.id}
                  />
                }
                isPrivate={isPrivate}
                onVisibilityChange={handleVisibilityChange}
                isNoteOwner={currentNote ? currentNote.user_id === user?.id : true}
                saveStatus={saveStatus}
              />
              <div className="min-h-[500px] p-2 sm:p-4 border rounded-lg relative">
                <div className="editor-container relative">
                  {editor && <EditorBubbleMenu 
                    editor={editor} 
                    onLinkAdd={() => setShowLinkDialog(true)}
                    onCreateTask={handleCreateTaskFromText}
                  />}
                  {editor && showLinkDialog && (
                    <LinkDialog
                      editor={editor}
                      onClose={() => setShowLinkDialog(false)}
                    />
                  )}
                  <div className="absolute top-1 right-2 text-xs text-muted-foreground">
                    {editor?.storage.characterCount.characters()} characters
                  </div>
                  <EditorContent editor={editor} />
                </div>
                <div className="mt-4 flex justify-end gap-2">
                  <Button 
                    variant="ghost" 
                    className="text-muted-foreground"
                    onClick={handleDelete}
                  >
                    Delete
                  </Button>
                  <Button onClick={handleManualSave}>
                    {currentNote ? "Update Note" : "Save Note"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <TaskSidebar
        open={taskSidebarOpen}
        onOpenChange={handleTaskSidebarOpenChange}
        onTaskCreate={handleTaskCreate}
        onTaskUpdate={handleTaskUpdate}
        onTaskArchive={handleTaskArchive}
        defaultStage={selectedStage}
        task={selectedTask}
        initialTitle={selectedText}
      />
      <AlertDialog open={showUnsavedDialog} onOpenChange={setShowUnsavedDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              {getDialogDescription()}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDiscardChanges}>
              Discard Changes
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleSaveAndContinue}>
              Save & Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Note</AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              <p>
                This action cannot be undone. The note and all its contents will be permanently deleted.
              </p>
              <p className="font-medium">
                Please type "{currentNote?.title || 'Untitled Note'}" to confirm deletion:
              </p>
              <Input
                placeholder="Type note title here..."
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                className="mt-2"
              />
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteConfirmation("")}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteConfirmation !== (currentNote?.title || 'Untitled Note') || deleteNote.isPending}
            >
              {deleteNote.isPending ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Deleting...
                </div>
              ) : (
                'Delete Note'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="max-w-screen-lg">
          <img 
            src={previewImage || ''} 
            alt="Preview" 
            className="w-full h-auto"
          />
        </DialogContent>
      </Dialog>
    </>
  )
}

import { useState, useEffect, useMemo, useCallback } from "react"
import { EditorToolbar } from "@/components/editor/EditorToolbar"
import { ModeSelector } from "@/components/editor/ModeSelector"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { FolderInput, Check, FolderIcon, ChevronDown, Bug, Maximize2 } from 'lucide-react'
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/components/AuthProvider"
import { useProject } from "@/components/ProjectContext"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import BubbleMenu from '@tiptap/extension-bubble-menu'
import { Note } from "@/types/note"
import "@/components/editor/Editor.css"
import { Sidebar } from "@/components/Sidebar"
import { cn } from "@/lib/utils"
import { useSidebar } from "@/components/SidebarContext"
import { TaskSidebar } from "@/components/TaskSidebar";
import type { TaskType, Stage, Priority } from "@/types/task";
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
import { useNavigate } from "react-router-dom"
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"

export default function Notes() {
  const navigate = useNavigate();
  const [currentNote, setCurrentNote] = useState<Note | null>(null)
  const [title, setTitle] = useState("")
  const [showLinkDialog, setShowLinkDialog] = useState(false)
  const [isPrivate, setIsPrivate] = useState(false)
  const { user } = useAuth()
  const { currentProject } = useProject()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [uploading, setUploading] = useState(false)
  const [taskSidebarOpen, setTaskSidebarOpen] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const [selectedStage] = useState<Stage>("To Do");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [pendingProjectId, setPendingProjectId] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<'dashboard' | 'close' | 'signout' | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');

  // Create note mutation
  const createNote = useMutation({
    mutationFn: async (options?: { isAutoSave?: boolean; content?: string; noteTitle?: string }) => {
      if (!user) return;
      
      const content = options?.content ?? '';
      const noteTitle = options?.noteTitle ?? title ?? 'Untitled Note';
      
      if (currentNote?.id) {
        // Update existing note
        const { error } = await supabase
          .from('notes')
          .update({
            content,
            title: noteTitle,
            updated_at: new Date().toISOString(),
          })
          .eq('id', currentNote.id);

        if (error) throw error;
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
        setCurrentNote(data);
      }
    },
    onSuccess: () => {
      toast({
        title: "Note saved successfully",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      setHasUnsavedChanges(false);
      setSaveStatus('saved');
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

  const handleVisibilityChange = async (newIsPrivate: boolean) => {
    setIsPrivate(newIsPrivate)
    
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
        setIsPrivate(!newIsPrivate)
        return
      }

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

  const handleDelete = () => {
    if (!currentNote) {
      setCurrentNote(null);
      setTitle("");
      return;
    }

    handleDeleteClick();
  };

  const handleDeleteClick = () => {
    setDeleteConfirmation("");
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!currentNote) return;

    const { error } = await supabase
      .from("notes")
      .delete()
      .eq('id', currentNote.id);

    if (error) {
      console.error("Error deleting note:", error);
      toast({
        title: "Cannot delete note",
        description: error.message || "Failed to delete note",
        variant: "destructive",
      });
    } else {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      setCurrentNote(null);
      setTitle("");
      toast({
        title: "Success",
        description: "Note deleted successfully",
      });
    }
    setShowDeleteDialog(false);
    setDeleteConfirmation("");
  };

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: true,
        HTMLAttributes: {
          target: '_blank',
          rel: 'noopener noreferrer',
          class: 'cursor-pointer'
        },
        validate: (href: string) => /^https?:\/\//.test(href),
      }),
      BubbleMenu,
    ],
    content: currentNote?.content || "",
    editable: true,
    autofocus: true,
  });

  useEffect(() => {
    if (!currentNote || !editor) return;
    
    setTitle(currentNote.title);
    if (currentNote.id !== editor.getAttributes('note')?.id) {
      editor.commands.setContent(currentNote.content || '');
      editor.commands.updateAttributes('note', { id: currentNote.id });
    }
  }, [currentNote, editor]);

  return (
    <>
      <Sidebar />
      <div className={cn("min-h-screen bg-background", "md:ml-14")}>
        <div className="container mx-auto p-2 sm:p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 mb-4">
            <div className="w-full sm:flex-1 flex items-center gap-2 bg-background rounded-md border">
              <Input
                type="text"
                placeholder="Untitled Note"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-lg font-semibold bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center gap-1 hover:text-foreground cursor-pointer">
                    <ChevronDown className="h-3 w-3" />
                    <FolderIcon className="h-4 w-4" />
                    <span className="text-sm whitespace-nowrap">
                      {currentNote ? "Current Project" : "No Project Selected"}
                    </span>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {/* Project options would go here */}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex gap-2 w-full sm:w-auto items-center justify-between sm:justify-end">
              <Button onClick={() => createNote.mutate({})}>
                {currentNote ? "Update Note" : "Save Note"}
              </Button>
            </div>
          </div>
          <div className="space-y-4">
            <EditorToolbar 
              onFormatClick={() => {}} 
              editor={editor}
            />
            <div className="min-h-[500px] p-2 sm:p-4 border rounded-lg relative">
              <EditorContent editor={editor} />
              <div className="mt-4 flex justify-end gap-2">
                <Button 
                  variant="ghost" 
                  className="text-muted-foreground"
                  onClick={handleDelete}
                >
                  Delete
                </Button>
                <Button onClick={() => createNote.mutate({})}>
                  {currentNote ? "Update Note" : "Save Note"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <AlertDialog open={showUnsavedDialog} onOpenChange={setShowUnsavedDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes in your current note. Would you like to save them before creating a new note?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowUnsavedDialog(false)}>
              Discard Changes
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>
              Save & Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Dialog open={!!deleteConfirmation} onOpenChange={() => setDeleteConfirmation("")}>
        <DialogContent>
          <p>This action cannot be undone. The note will be permanently deleted.</p>
          <p className="font-medium">Please type "{currentNote?.title || 'Untitled Note'}" to confirm deletion:</p>
          <Input
            placeholder="Type note title here..."
            value={deleteConfirmation}
            onChange={(e) => setDeleteConfirmation(e.target.value)}
            className="mt-2"
          />
          <Button onClick={handleConfirmDelete}>
            Delete Note
          </Button>
        </DialogContent>
      </Dialog>
    </>
  )
}

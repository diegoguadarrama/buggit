import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TaskMemberSelect } from "../TaskMemberSelect";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { X } from "lucide-react";
import type { TaskType, Stage } from "@/types/task";

interface UpdateTaskFormProps {
  task: TaskType;
  onSubmit: (task: Partial<TaskType>) => Promise<void>;
  onCancel: () => void;
}

export const UpdateTaskForm = ({ task, onSubmit, onCancel }: UpdateTaskFormProps) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      title: task.title,
      description: task.description || "",
      priority: task.priority,
      stage: task.stage,
      assignee: task.assignee,
      due_date: task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : "",
    }
  });

  const [attachments, setAttachments] = useState<string[]>(task.attachments || []);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const fileExt = file.name.split('.').pop();
    const filePath = `${task.id}/${Math.random()}.${fileExt}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from('task-attachments')
        .upload(filePath, file);

      if (uploadError) {
        toast({
          variant: "destructive",
          title: "Error uploading file",
          description: uploadError.message,
        });
        return;
      }

      const { data } = supabase.storage
        .from('task-attachments')
        .getPublicUrl(filePath);

      const newAttachments = [...attachments, data.publicUrl];
      setAttachments(newAttachments);
      
      // Update the task with new attachments
      await onSubmit({ attachments: newAttachments });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error uploading file",
        description: "Something went wrong while uploading the file.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveAttachment = async (attachmentUrl: string) => {
    const newAttachments = attachments.filter(url => url !== attachmentUrl);
    setAttachments(newAttachments);
    await onSubmit({ attachments: newAttachments });
  };

  const handleFormSubmit = async (data: any) => {
    await onSubmit({
      ...data,
      attachments,
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6 p-6">
      <div className="space-y-2">
        <label htmlFor="title" className="text-sm font-medium">
          Title
        </label>
        <Input
          id="title"
          {...register("title", { required: true })}
          placeholder="Task title"
          className="w-full"
        />
        {errors.title && (
          <span className="text-red-500 text-sm">Title is required</span>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium">
          Description
        </label>
        <Textarea
          id="description"
          {...register("description")}
          placeholder="Task description"
          className="w-full min-h-[100px]"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">
          Assignee
        </label>
        <TaskMemberSelect
          projectId={task.project_id}
          value={task.assignee}
          onValueChange={(value) => onSubmit({ assignee: value })}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="priority" className="text-sm font-medium">
          Priority
        </label>
        <select
          id="priority"
          {...register("priority")}
          className="w-full p-2 border rounded"
        >
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
      </div>

      <div className="space-y-2">
        <label htmlFor="due_date" className="text-sm font-medium">
          Due Date
        </label>
        <Input
          id="due_date"
          type="date"
          {...register("due_date")}
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">
          Attachments
        </label>
        <div>
          <input
            type="file"
            onChange={handleFileUpload}
            disabled={isUploading}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="cursor-pointer bg-primary text-primary-foreground px-4 py-2 rounded-md inline-block"
          >
            {isUploading ? "Uploading..." : "Add Attachment"}
          </label>
        </div>

        {attachments.length > 0 && (
          <div className="space-y-2 mt-4">
            <div className="space-y-2">
              {attachments.map((url, index) => (
                <div key={index} className="flex items-center justify-between bg-muted p-2 rounded-md">
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-500 hover:underline truncate max-w-[200px]"
                  >
                    {url.split('/').pop()}
                  </a>
                  <button
                    type="button"
                    onClick={() => handleRemoveAttachment(url)}
                    className="text-destructive hover:text-destructive/90"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          Save Changes
        </Button>
      </div>
    </form>
  );
};
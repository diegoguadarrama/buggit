import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import type { TaskType } from "@/types/task";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useProject } from "./ProjectContext";
import { User } from "lucide-react";

interface TaskSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskCreate: (task: TaskType) => void;
  defaultStage: string;
}

interface ProjectMember {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
}

export const TaskSidebar = ({ open, onOpenChange, onTaskCreate, defaultStage }: TaskSidebarProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("low");
  const [stage, setStage] = useState<string>(defaultStage);
  const [responsible, setResponsible] = useState("");
  const [attachments, setAttachments] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState("");
  const { currentProject } = useProject();

  const { data: projectMembers = [], isLoading: isLoadingMembers } = useQuery({
    queryKey: ['project-members', currentProject?.id],
    queryFn: async () => {
      if (!currentProject?.id) return [];

      console.log('Fetching project members for project:', currentProject.id);
      
      const { data: memberships, error: membershipsError } = await supabase
        .from('profiles_projects')
        .select('profile_id, email')
        .eq('project_id', currentProject.id);

      if (membershipsError) {
        console.error('Error fetching memberships:', membershipsError);
        throw membershipsError;
      }

      // Get profiles for members
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, full_name, avatar_url')
        .in('id', memberships.map(m => m.profile_id).filter(Boolean));

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        throw profilesError;
      }

      console.log('Fetched project members:', profiles);
      return profiles as ProjectMember[];
    },
    enabled: !!currentProject?.id,
  });

  useEffect(() => {
    if (!open) {
      setTitle("");
      setDescription("");
      setPriority("low");
      setStage(defaultStage);
      setResponsible("");
      setAttachments([]);
      setDueDate("");
    } else {
      setStage(defaultStage);
    }
  }, [open, defaultStage]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newTask: TaskType = {
      id: crypto.randomUUID(),
      title,
      description,
      priority,
      stage,
      assignee: responsible,
      attachments,
      created_at: new Date().toISOString(),
      due_date: dueDate || undefined
    };

    onTaskCreate(newTask);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[400px] flex flex-col h-full p-0">
        <SheetHeader className="p-6 border-b">
          <SheetTitle>Create New Task</SheetTitle>
        </SheetHeader>
        
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="space-y-4 pb-20">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter task title"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter task description"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Priority</label>
                <Select value={priority} onValueChange={(value: "low" | "medium" | "high") => setPriority(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Stage</label>
                <Select value={stage} onValueChange={setStage}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select stage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="To Do">To Do</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Done">Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Due Date</label>
                <Input
                  type="datetime-local"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Responsible</label>
                <Select value={responsible} onValueChange={setResponsible}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select responsible person">
                      {responsible && projectMembers.find(m => m.email === responsible) && (
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage 
                              src={projectMembers.find(m => m.email === responsible)?.avatar_url || ''} 
                              alt={projectMembers.find(m => m.email === responsible)?.full_name || responsible} 
                            />
                            <AvatarFallback>
                              <User className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                          <span>
                            {projectMembers.find(m => m.email === responsible)?.full_name || responsible}
                          </span>
                        </div>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {projectMembers.map((member) => (
                      <SelectItem key={member.id} value={member.email}>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={member.avatar_url || ''} alt={member.full_name || member.email} />
                            <AvatarFallback>
                              <User className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                          <span>{member.full_name || member.email}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="sticky bottom-0 border-t bg-background p-6">
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-[#0F3626] hover:bg-[#0F3626]/90">Add Task</Button>
            </div>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
};
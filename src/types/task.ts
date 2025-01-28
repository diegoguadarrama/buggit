// src/types/task.ts

export type Priority = 'low' | 'medium' | 'high';
export type Stage = 'To Do' | 'In Progress' | 'Done';

export interface TaskType {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  stage: Stage;
  assignee: string | null;
  recipient_id: string | null;
  attachments?: string[];
  created_at: string;
  updated_at: string;
  due_date?: string;
  archived: boolean;
  project_id: string;
  user_id: string;
  position: number; // Added this field
}

export interface Member {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
}

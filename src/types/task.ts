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

export interface Notification {
  id: string;
  recipient_id: string;
  task_id: string;
  created_at: string;
  // Add other notification-specific fields
  type?: string;
  message?: string;
  read?: boolean;
}

export type Priority = 'low' | 'medium' | 'high';
export type Stage = 'To Do' | 'In Progress' | 'Done';

export interface TaskType {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  stage: Stage;
  assignee?: string;
  attachments?: string[];
  created_at: string;
  updated_at: string;
  due_date?: string;
  project_id?: string;
  user_id?: string;
  archived?: boolean;
}
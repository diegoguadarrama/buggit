export type Priority = 'low' | 'medium' | 'high';

export interface TaskType {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  stage: string;
  assignee?: string;
  attachments?: string[];
  created_at: string;
  due_date?: string;
}

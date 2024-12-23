export type Priority = 'low' | 'medium' | 'high';

export interface TaskType {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  stage: string;
  assignee: string;
  attachments: string[];
  created_at: string;
}
export type ProjectRole = 'owner' | 'member';

export interface Project {
  id: string;
  name: string;
  description: string | null;
  role?: ProjectRole;
}
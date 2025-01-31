export interface BlogPost {
  id: string;
  title: string;
  content: string | null;
  slug: string;
  excerpt: string | null;
  published: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
  cover_image: string | null;
  tags: string[] | null;
}
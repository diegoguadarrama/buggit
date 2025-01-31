import { Link } from "react-router-dom";
import { format } from "date-fns";
import { Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { BlogPost } from "@/types/blog";

interface BlogPostCardProps {
  post: BlogPost;
}

export function BlogPostCard({ post }: BlogPostCardProps) {
  return (
    <Link to={`/blog/${post.slug}`}>
      <div className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
        {post.cover_image && (
          <img
            src={post.cover_image}
            alt={post.title}
            className="w-full h-48 object-cover"
          />
        )}
        <div className="p-4">
          <h3 className="font-bold text-xl mb-2">{post.title}</h3>
          {post.excerpt && (
            <p className="text-muted-foreground line-clamp-2 mb-4">
              {post.excerpt}
            </p>
          )}
          <div className="flex items-center justify-between">
            <div className="flex gap-2 flex-wrap">
              {post.tags?.map((tag) => (
                <Badge key={tag} variant="secondary">
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                </Badge>
              ))}
            </div>
            <time className="text-sm text-muted-foreground">
              {format(new Date(post.created_at), 'MMM d, yyyy')}
            </time>
          </div>
        </div>
      </div>
    </Link>
  );
}

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BlogPost } from "@/types/blog";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Tag } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Helmet } from 'react-helmet';

export default function BlogPostPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: post, isLoading } = useQuery({
    queryKey: ["blog-post", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", slug)
        .single();

      if (error) throw error;
      return data as BlogPost;
    },
  });

  const togglePublish = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("blog_posts")
        .update({ published: !post?.published })
        .eq("id", post?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog-post", slug] });
      toast.success(post?.published ? "Post unpublished" : "Post published");
    },
    onError: () => {
      toast.error("Failed to update post status");
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Helmet>
          <title>Loading... | Buggit Blog</title>
        </Helmet>
        Loading...
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <Helmet>
          <title>Post Not Found | Buggit Blog</title>
          <meta name="description" content="The requested blog post could not be found." />
        </Helmet>
        <h1 className="text-2xl font-bold mb-4">Post not found</h1>
        <Button onClick={() => navigate("/blog")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Blog
        </Button>
      </div>
    );
  }

  const isAuthor = user?.id === post.user_id;
  const metaDescription = post.excerpt || post.content.replace(/<[^>]*>/g, '').slice(0, 160);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Helmet prioritizeSeoTags={true}>
        <title>{`${post.title} | Buggit Blog`}</title>
        <meta name="description" content={metaDescription} />
        
        {/* Open Graph meta tags for social sharing */}
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={metaDescription} />
        {post.cover_image && <meta property="og:image" content={post.cover_image} />}
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`${window.location.origin}/blog/${post.slug}`} />
        
        {/* Twitter Card meta tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.title} />
        <meta name="twitter:description" content={metaDescription} />
        {post.cover_image && <meta name="twitter:image" content={post.cover_image} />}

        {/* Article specific meta tags */}
        {post.tags && <meta name="keywords" content={post.tags.join(', ')} />}
        <meta property="article:published_time" content={post.created_at} />
        {post.updated_at && <meta property="article:modified_time" content={post.updated_at} />}
      </Helmet>
      
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/blog")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Blog
        </Button>
        
        {post.cover_image && (
          <img
            src={post.cover_image}
            alt={post.title}
            className="w-full h-64 object-cover rounded-lg mb-6"
          />
        )}
        
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold">{post.title}</h1>
          {isAuthor && (
            <div className="flex gap-2">
              <Button onClick={() => togglePublish.mutate()}>
                {post.published ? "Unpublish" : "Publish"}
              </Button>
              <Button onClick={() => navigate(`/blog/${slug}/edit`)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Post
              </Button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 text-muted-foreground mb-8">
          <time dateTime={post.created_at}>
            {format(new Date(post.created_at), "MMMM d, yyyy")}
          </time>
          {!post.published && (
            <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
              Draft
            </Badge>
          )}
          {post.tags && post.tags.length > 0 && (
            <div className="flex gap-2">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {post.excerpt && (
          <p className="text-lg text-muted-foreground mb-8 italic">
            {post.excerpt}
          </p>
        )}

        <div 
          className="prose dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </div>
    </div>
  );
}

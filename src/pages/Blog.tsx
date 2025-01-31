import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BlogPost } from "@/types/blog";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PlusCircle, Tag } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export default function Blog() {
  const { user } = useAuth();

  const { data: posts, isLoading } = useQuery({
    queryKey: ["blog-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as BlogPost[];
    },
  });

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  // Get the first published post as featured
  const featuredPost = posts?.find(post => post.published);
  // Get remaining posts
  const remainingPosts = posts?.filter(post => post !== featuredPost);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Blog Posts</h1>
        {user && (
          <Link to="/blog/new">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Post
            </Button>
          </Link>
        )}
      </div>

      {/* Featured Post Section */}
      {featuredPost && (
        <div className="mb-16">
          <h2 className="text-2xl font-semibold mb-6">Featured Post</h2>
          <Link to={`/blog/${featuredPost.slug}`} className="group">
            <div className="grid md:grid-cols-2 gap-8 bg-card rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
              {featuredPost.cover_image && (
                <div className="aspect-[16/9] overflow-hidden">
                  <img
                    src={featuredPost.cover_image}
                    alt={featuredPost.title}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
              <div className="p-6 flex flex-col justify-center">
                <h3 className="text-3xl font-bold mb-4 group-hover:text-primary transition-colors">
                  {featuredPost.title}
                </h3>
                {featuredPost.excerpt && (
                  <p className="text-muted-foreground mb-4 line-clamp-3">
                    {featuredPost.excerpt}
                  </p>
                )}
                <div className="flex flex-wrap gap-2 mb-4">
                  {featuredPost.tags?.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="flex justify-between items-center text-sm text-muted-foreground">
                  <time dateTime={featuredPost.created_at}>
                    {format(new Date(featuredPost.created_at), "MMMM d, yyyy")}
                  </time>
                  {!featuredPost.published && (
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                      Draft
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* Recent Posts Section */}
      <div>
        <h2 className="text-2xl font-semibold mb-6">Recent Posts</h2>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {remainingPosts?.map((post) => (
            <Link
              key={post.id}
              to={`/blog/${post.slug}`}
              className="group block"
            >
              <article className="bg-card rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                {post.cover_image && (
                  <div className="aspect-[16/9] overflow-hidden">
                    <img
                      src={post.cover_image}
                      alt={post.title}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-xl font-semibold group-hover:text-primary transition-colors mb-2">
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p className="text-muted-foreground mb-4 line-clamp-2">
                      {post.excerpt}
                    </p>
                  )}
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          <Tag className="h-3 w-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <time dateTime={post.created_at}>
                      {format(new Date(post.created_at), "MMM d, yyyy")}
                    </time>
                    {!post.published && (
                      <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                        Draft
                      </Badge>
                    )}
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>

        {posts?.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-xl font-medium text-muted-foreground">
              No blog posts yet
            </h3>
            {user && (
              <Link to="/blog/new" className="mt-4 inline-block">
                <Button>Create your first post</Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BlogPost } from "@/types/blog";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PlusCircle, Tag } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { BlogPostCard } from "@/components/BlogPostCard";
import Header from '@/components/landing/Header';
import Footer from '@/components/landing/Footer';

export default function Blog() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const { data: featuredPost, isLoading: isLoadingFeatured } = useQuery({
    queryKey: ["featured-blog-post"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("featured", true)
        .eq("published", true)
        .single();

      if (error) return null;
      return data;
    },
  });

  const { data: posts, isLoading: isLoadingPosts } = useQuery({
    queryKey: ["blog-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("published", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
  
  if (isLoadingFeatured || isLoadingPosts) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <div className="flex justify-center p-8">Loading...</div>
        </main>
        <Footer />
      </div>
    );
  }

 return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header className="w-full" />
      {/* Featured Post Section */}
      {featuredPost && (
        <div className="px-8 py-4 mb-12">
          <div className="relative rounded-lg overflow-hidden">
            {featuredPost.cover_image && (
              <img
                src={featuredPost.cover_image}
                alt={featuredPost.title}
                className="w-full h-96 object-cover"
              />
            )}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6">
              <h3 className="text-3xl font-bold text-white mb-2">
                {featuredPost.title}
              </h3>
              {featuredPost.excerpt && (
                <p className="text-gray-200 line-clamp-2">
                  {featuredPost.excerpt}
                </p>
              )}
              <Button
                variant="secondary"
                className="mt-4"
                onClick={() => navigate(`/blog/${featuredPost.slug}`)}
              >
                Read More
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Regular Posts Grid */}
      <div className="px-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts?.map((post) => (
          // Only show non-featured posts in the grid
          !post.featured && (
            <BlogPostCard key={post.id} post={post} />
          )
        ))}
      </div>
     <Footer className="w-full" />
    </div>
  );
}

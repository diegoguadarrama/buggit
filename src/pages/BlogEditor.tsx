import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Tags } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Editor } from "@tiptap/react";
import { EditorToolbar } from "@/components/editor/EditorToolbar";
import { BubbleMenu } from "@/components/editor/BubbleMenu";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import { ImageNodeView } from "@/components/editor/ImageNodeView";
import { CharacterCount } from "@/components/editor/CharacterCount";
import CharacterCount_ from "@tiptap/extension-character-count";

export default function BlogEditor() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [showLinkDialog, setShowLinkDialog] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.extend({
        nodeView: ImageNodeView,
      }),
      Link.configure({
        openOnClick: false,
      }),
      CharacterCount_.configure({
        limit: 10000,
      }),
    ],
    content: "",
  });

  // Fetch existing post if editing
  const { data: post, isLoading: isLoadingPost } = useQuery({
    queryKey: ["blog-post", slug],
    queryFn: async () => {
      if (!slug) return null;
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", slug)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  // Set initial values when editing
  useEffect(() => {
    if (post) {
      setTitle(post.title);
      setExcerpt(post.excerpt || "");
      setCoverImage(post.cover_image || "");
      setTags(post.tags || []);
      if (editor && post.content) {
        editor.commands.setContent(post.content);
      }
    }
  }, [post, editor]);

  // Generate slug from title
  const generateSlug = async (title: string) => {
    const { data, error } = await supabase.rpc("generate_unique_slug", {
      title_input: title,
    });
    if (error) throw error;
    return data;
  };

  // Save post mutation
  const saveMutation = useMutation({
    mutationFn: async (published: boolean = false) => {
      if (!user || !editor) return;

      const content = editor.getHTML();
      const postSlug = slug || await generateSlug(title);

      const postData = {
        title,
        content,
        excerpt,
        cover_image: coverImage,
        tags,
        published,
        user_id: user.id,
        slug: postSlug,
      };

      const { error } = slug
        ? await supabase
            .from("blog_posts")
            .update(postData)
            .eq("slug", slug)
        : await supabase.from("blog_posts").insert(postData);

      if (error) throw error;
      return postSlug;
    },
    onSuccess: (savedSlug) => {
      queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
      queryClient.invalidateQueries({ queryKey: ["blog-post", savedSlug] });
      toast.success("Post saved successfully");
      navigate(`/blog/${savedSlug}`);
    },
    onError: (error) => {
      console.error("Error saving post:", error);
      toast.error("Failed to save post");
    },
  });

  // Handle image upload
  const handleImageUpload = async (file: File) => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage
      .from("notes-images")
      .upload(fileName, file);

    if (uploadError) {
      toast.error("Failed to upload image");
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from("notes-images")
      .getPublicUrl(fileName);

    return publicUrl;
  };

  // Handle tag input
  const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  if (isLoadingPost) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Button
        variant="ghost"
        onClick={() => navigate("/blog")}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Blog
      </Button>

      <div className="space-y-6">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter post title"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="excerpt">Excerpt</Label>
          <Textarea
            id="excerpt"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="Brief description of your post"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="cover">Cover Image URL</Label>
          <Input
            id="cover"
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
            placeholder="Enter cover image URL"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="tags">Tags</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="cursor-pointer"
                onClick={() => removeTag(tag)}
              >
                <Tags className="h-3 w-3 mr-1" />
                {tag}
              </Badge>
            ))}
          </div>
          <Input
            id="tags"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagInput}
            placeholder="Add tags (press Enter)"
            className="mt-2"
          />
        </div>

        <div className="space-y-4">
          <Label>Content</Label>
          {editor && (
            <>
              <EditorToolbar
                editor={editor}
                onFormatClick={(format) => {
                  switch (format) {
                    case "bold":
                      editor.chain().focus().toggleBold().run();
                      break;
                    case "italic":
                      editor.chain().focus().toggleItalic().run();
                      break;
                    case "link":
                      setShowLinkDialog(true);
                      break;
                    case "image":
                      const input = document.createElement("input");
                      input.type = "file";
                      input.accept = "image/*";
                      input.onchange = async () => {
                        const file = input.files?.[0];
                        if (file) {
                          const url = await handleImageUpload(file);
                          if (url) {
                            editor.chain().focus().setImage({ src: url }).run();
                          }
                        }
                      };
                      input.click();
                      break;
                    // ... handle other formats
                  }
                }}
              />
              {editor && <BubbleMenu editor={editor} />}
              <div className="min-h-[400px] border rounded-lg p-4">
                <EditorContent editor={editor} />
              </div>
              <CharacterCount editor={editor} />
            </>
          )}
        </div>

        <div className="flex justify-end gap-4">
          <Button
            variant="outline"
            onClick={() => saveMutation.mutate(false)}
            disabled={saveMutation.isPending}
          >
            Save as Draft
          </Button>
          <Button
            onClick={() => saveMutation.mutate(true)}
            disabled={saveMutation.isPending}
          >
            {saveMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Publish"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
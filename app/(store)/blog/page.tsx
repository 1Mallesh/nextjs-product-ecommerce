"use client";

import { BookOpen } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { contentService } from "@/services/content.service";
import { Skeleton } from "@/components/ui/skeleton";

export default function BlogPage() {
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["blog-posts"],
    queryFn: async () => {
      const { data } = await contentService.getBlogPosts();
      return data.data ?? [];
    },
  });

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-10">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">TOKOMORT Blog</h1>
        <p className="text-muted-foreground">Tips, news and stories from our marketplace</p>
      </div>

      <div className="grid gap-6">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-36 rounded-xl" />)
          : posts.map((post) => (
              <div key={post.id} className="bg-card border rounded-xl p-6 hover:border-brand/40 transition-colors">
                <span className="text-xs font-medium text-brand bg-brand/10 px-2 py-0.5 rounded-full">{post.tag}</span>
                <h2 className="text-lg font-bold mt-3 mb-2">{post.title}</h2>
                <p className="text-sm text-muted-foreground">{post.excerpt}</p>
                <p className="text-xs text-muted-foreground mt-3">{post.date}</p>
              </div>
            ))}
      </div>

      {!isLoading && !posts.length && (
        <div className="text-center py-12 text-muted-foreground">
          <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No articles yet. Check back soon.</p>
        </div>
      )}
    </div>
  );
}

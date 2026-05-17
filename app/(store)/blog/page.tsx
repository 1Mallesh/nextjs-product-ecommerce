import { BookOpen } from "lucide-react";

export const metadata = { title: "Blog – TOKOMORT", description: "Tips, guides and updates from TOKOMORT" };

const POSTS = [
  { title: "How to Start Selling on TOKOMORT", date: "May 10, 2026", tag: "Vendors", excerpt: "A step-by-step guide to setting up your vendor account and listing your first product." },
  { title: "Top 10 Shopping Tips to Save More", date: "May 5, 2026", tag: "Shopping", excerpt: "Smart ways to use coupons, cashback, and deals to get the best price every time." },
  { title: "Understanding Our Delivery Network", date: "Apr 28, 2026", tag: "Logistics", excerpt: "How we use local and Shiprocket delivery to get your orders to you faster." },
  { title: "Secure Payments with Razorpay", date: "Apr 20, 2026", tag: "Payments", excerpt: "Everything you need to know about how TOKOMORT keeps your payments safe." },
];

export default function BlogPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-2">TOKOMORT Blog</h1>
        <p className="text-muted-foreground">Tips, news and stories from our marketplace</p>
      </div>

      <div className="grid gap-6">
        {POSTS.map((post) => (
          <div key={post.title} className="bg-card border rounded-xl p-6 hover:border-brand/40 transition-colors">
            <span className="text-xs font-medium text-brand bg-brand/10 px-2 py-0.5 rounded-full">{post.tag}</span>
            <h2 className="text-lg font-bold mt-3 mb-2">{post.title}</h2>
            <p className="text-sm text-muted-foreground">{post.excerpt}</p>
            <p className="text-xs text-muted-foreground mt-3">{post.date}</p>
          </div>
        ))}
      </div>

      <div className="text-center py-12 text-muted-foreground">
        <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-30" />
        <p className="text-sm">More articles coming soon</p>
      </div>
    </div>
  );
}

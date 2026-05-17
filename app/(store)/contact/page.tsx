"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";

export default function ContactPage() {
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1000));
    toast.success("Message sent! We'll get back to you within 24 hours.");
    setForm({ name: "", email: "", subject: "", message: "" });
    setSubmitting(false);
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-2">Contact Us</h1>
        <p className="text-muted-foreground">We&apos;re here to help. Reach out anytime!</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <h2 className="text-xl font-bold mb-6">Get in Touch</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" required />
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email address" required />
            <Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Subject" required />
            <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="Your message..."
              rows={5}
              required
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
            <Button type="submit" variant="brand" className="w-full" loading={submitting}>
              <Send className="h-4 w-4" />
              Send Message
            </Button>
          </form>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-bold">Contact Information</h2>
          {[
            { icon: Mail, label: "Email", value: "support@tokomort.com" },
            { icon: Phone, label: "Phone", value: "+91 80000 00000" },
            { icon: MapPin, label: "Address", value: "Mumbai, Maharashtra, India" },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-xl bg-brand/10 flex items-center justify-center shrink-0">
                <Icon className="h-5 w-5 text-brand" />
              </div>
              <div>
                <p className="font-medium">{label}</p>
                <p className="text-muted-foreground text-sm">{value}</p>
              </div>
            </div>
          ))}

          <div className="bg-muted/50 rounded-xl p-4">
            <p className="font-medium">Support Hours</p>
            <p className="text-sm text-muted-foreground mt-1">Monday – Saturday: 9 AM – 9 PM</p>
            <p className="text-sm text-muted-foreground">Sunday: 10 AM – 6 PM</p>
          </div>
        </div>
      </div>
    </div>
  );
}

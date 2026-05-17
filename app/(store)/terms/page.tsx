import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl prose dark:prose-invert">
      <h1>Terms of Service</h1>
      <p className="text-muted-foreground">Last updated: January 2025</p>
      <h2>Acceptance of Terms</h2>
      <p>By using TOKOMORT, you agree to these terms. Please read them carefully before using our platform.</p>
      <h2>User Accounts</h2>
      <ul>
        <li>You must provide accurate information when creating an account</li>
        <li>You are responsible for maintaining account security</li>
        <li>TOKOMORT reserves the right to suspend accounts that violate these terms</li>
      </ul>
      <h2>Purchases and Payments</h2>
      <ul>
        <li>All prices are in Indian Rupees (INR)</li>
        <li>Payments are processed securely via Razorpay</li>
        <li>COD is subject to availability in your area</li>
      </ul>
      <h2>Vendor Terms</h2>
      <p>Vendors must maintain accurate product information, honor prices, and fulfill orders on time. Fraudulent activity will result in immediate account suspension.</p>
      <h2>Returns and Refunds</h2>
      <p>Returns are accepted within 7 days of delivery for eligible products. Refunds are processed within 5-7 business days.</p>
      <h2>Contact</h2>
      <p>For queries: legal@tokomort.com</p>
    </div>
  );
}

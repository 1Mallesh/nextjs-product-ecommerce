import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl prose dark:prose-invert">
      <h1>Privacy Policy</h1>
      <p className="text-muted-foreground">Last updated: January 2025</p>
      <p>At TOKOMORT, we take your privacy seriously. This policy explains how we collect, use, and protect your personal information.</p>
      <h2>Information We Collect</h2>
      <ul>
        <li>Personal information (name, email, mobile number)</li>
        <li>Delivery addresses</li>
        <li>Payment information (processed securely via Razorpay)</li>
        <li>Device and browser information</li>
        <li>Order history and preferences</li>
      </ul>
      <h2>How We Use Your Information</h2>
      <ul>
        <li>Processing and delivering your orders</li>
        <li>Sending order updates and notifications</li>
        <li>Personalizing your shopping experience</li>
        <li>Improving our services</li>
        <li>Complying with legal requirements</li>
      </ul>
      <h2>Data Security</h2>
      <p>We use industry-standard encryption and security measures to protect your data. Payment information is handled by Razorpay and is never stored on our servers.</p>
      <h2>Contact Us</h2>
      <p>For privacy concerns, email us at privacy@tokomort.com</p>
    </div>
  );
}

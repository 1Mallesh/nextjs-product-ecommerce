import api from "./axios";
import type { ApiResponse } from "@/types";

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  cta: string;
  href: string;
  bg: string;
  image: string;
}

export interface OfferItem {
  id: string;
  title: string;
  desc: string;
  bg: string;
  emoji: string;
  href: string;
}

export interface TrustBadge {
  id: string;
  title: string;
  desc: string;
  icon: string;
}

export interface FaqItem {
  id: string;
  q: string;
  a: string;
}

export interface BlogPost {
  id: string;
  title: string;
  date: string;
  tag: string;
  excerpt: string;
  slug?: string;
}

export interface AboutStat {
  label: string;
  value: string;
}

export interface JobOpening {
  id: string;
  title: string;
  dept: string;
  location: string;
  type: string;
}

export interface SiteSetting {
  topBarMessage: string;
}

export const contentService = {
  getBanners: () => api.get<ApiResponse<Banner[]>>("/content/banners"),
  getOffers: () => api.get<ApiResponse<OfferItem[]>>("/content/offers"),
  getTrustBadges: () => api.get<ApiResponse<TrustBadge[]>>("/content/trust-badges"),
  getFaqs: () => api.get<ApiResponse<FaqItem[]>>("/faqs"),
  getBlogPosts: () => api.get<ApiResponse<BlogPost[]>>("/blogs"),
  getAboutStats: () => api.get<ApiResponse<AboutStat[]>>("/content/about-stats"),
  getJobOpenings: () => api.get<ApiResponse<JobOpening[]>>("/careers"),
  getSiteSettings: () => api.get<ApiResponse<SiteSetting>>("/content/settings"),
};

"use client";

import { Briefcase, MapPin, Clock } from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { contentService } from "@/services/content.service";
import { Skeleton } from "@/components/ui/skeleton";

export default function CareersPage() {
  const { data: openings = [], isLoading } = useQuery({
    queryKey: ["job-openings"],
    queryFn: async () => {
      const { data } = await contentService.getJobOpenings();
      return data.data ?? [];
    },
  });

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-12">
        <h1 className="text-2xl sm:text-4xl font-bold mb-4">Join Our Team</h1>
        <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto">
          Help us build India&apos;s most loved multi-vendor marketplace. We&apos;re looking for passionate people.
        </p>
      </div>

      <div className="grid gap-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)
          : openings.map((job) => (
              <div key={job.id} className="bg-card border rounded-xl p-5 hover:border-brand/40 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-base">{job.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{job.dept}</p>
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{job.location}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{job.type}</span>
                    </div>
                  </div>
                  <Link
                    href="/contact"
                    className="self-start shrink-0 text-sm font-medium text-brand border border-brand rounded-lg px-4 py-2 hover:bg-brand hover:text-white transition-colors"
                  >
                    Apply
                  </Link>
                </div>
              </div>
            ))}

        {!isLoading && !openings.length && (
          <div className="text-center py-10 text-muted-foreground">
            <Briefcase className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p>No openings at the moment. Check back soon.</p>
          </div>
        )}
      </div>

      <div className="mt-12 bg-brand/5 border border-brand/20 rounded-2xl p-8 text-center">
        <Briefcase className="h-10 w-10 mx-auto mb-4 text-brand" />
        <h2 className="text-xl font-bold mb-2">Don&apos;t see your role?</h2>
        <p className="text-muted-foreground text-sm mb-4">
          Send us your resume and we&apos;ll reach out when a suitable position opens.
        </p>
        <Link href="/contact" className="inline-flex items-center gap-2 bg-brand text-white px-6 py-2.5 rounded-xl font-medium text-sm hover:bg-brand/90 transition-colors">
          Contact Us
        </Link>
      </div>
    </div>
  );
}

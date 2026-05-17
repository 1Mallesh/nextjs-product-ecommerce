import { Briefcase, MapPin, Clock } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Careers – TOKOMORT", description: "Join the TOKOMORT team" };

const OPENINGS = [
  { title: "Senior Frontend Engineer", dept: "Engineering", location: "Mumbai / Remote", type: "Full-time" },
  { title: "Backend Engineer (NestJS)", dept: "Engineering", location: "Bengaluru / Remote", type: "Full-time" },
  { title: "Product Manager", dept: "Product", location: "Mumbai", type: "Full-time" },
  { title: "UI/UX Designer", dept: "Design", location: "Remote", type: "Full-time" },
  { title: "Digital Marketing Manager", dept: "Marketing", location: "Delhi", type: "Full-time" },
  { title: "Customer Support Executive", dept: "Support", location: "Mumbai", type: "Full-time" },
];

export default function CareersPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Join Our Team</h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          Help us build India&apos;s most loved multi-vendor marketplace. We&apos;re looking for passionate people.
        </p>
      </div>

      <div className="grid gap-4">
        {OPENINGS.map((job) => (
          <div key={job.title} className="bg-card border rounded-xl p-5 hover:border-brand/40 transition-colors">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-semibold text-base">{job.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{job.dept}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{job.location}</span>
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{job.type}</span>
                </div>
              </div>
              <Link
                href="/contact"
                className="shrink-0 text-sm font-medium text-brand border border-brand rounded-lg px-4 py-2 hover:bg-brand hover:text-white transition-colors"
              >
                Apply
              </Link>
            </div>
          </div>
        ))}
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

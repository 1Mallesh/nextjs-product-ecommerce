import Link from "next/link";
import { ShieldX } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <div className="text-center space-y-5 max-w-sm">
        <div className="h-20 w-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
          <ShieldX className="h-10 w-10 text-destructive" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="text-muted-foreground text-sm mt-2">
            You don't have permission to access this page. Please login with the correct account.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-xl bg-brand text-white px-6 py-2.5 text-sm font-medium hover:bg-brand/90 transition-colors"
          >
            Go to Home
          </Link>
          <Link
            href="/auth/login"
            className="inline-flex items-center justify-center rounded-xl border px-6 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
          >
            Login with different account
          </Link>
        </div>
      </div>
    </div>
  );
}

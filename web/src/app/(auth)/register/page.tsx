import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Connect HRDotNet | HRDotNet Performance",
};

export default function RegisterPage() {
  return (
    <div className="grid justify-items-center gap-4 text-center">
      <h1 className="text-pms-page-title">Connect your HRDotNet account</h1>
      <p className="text-pms-body text-muted-foreground">
        Employee-code registration is currently unavailable.
      </p>
      <Link
        href="/login"
        className="w-fit text-pms-table underline underline-offset-4"
      >
        Back to log in
      </Link>
    </div>
  );
}

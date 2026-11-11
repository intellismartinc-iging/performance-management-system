import type { Metadata } from "next";
import Link from "next/link";
import { CredentialsForm } from "@/features/auth/components/credentials-form";

export const metadata: Metadata = { title: "Sign up | HRDotNet Performance" };

export default function SignUpPage() {
  return (
    <>
      <div className="grid gap-2 text-center">
        <h1 className="text-pms-page-title">Create an account</h1>
        <p className="text-pms-body text-muted-foreground">
          Use your employee code to set up your HRDotNet Performance login.
        </p>
      </div>
      <CredentialsForm mode="sign-up" />
      <div className="grid justify-items-center text-center text-pms-table">
        <Link href="/login" className="w-fit underline underline-offset-4">
          Back to log in
        </Link>
      </div>
    </>
  );
}

import type { Metadata } from "next";
import { PageHeader } from "@/components/molecules/page-header";

export const metadata: Metadata = { title: "Dashboard" };

export default function DashboardPage() {
  return (
    <div className="w-full min-w-0 px-3 py-6">
      <PageHeader
        title="Dashboard"
        description="HRDotNet Performance Management"
      />
    </div>
  );
}

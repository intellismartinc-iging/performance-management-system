import type { Metadata } from "next";

import { ListingPageTemplate } from "@/components/templates/listing-page-template";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export const metadata: Metadata = { title: "Review Cycles" };

export default function ReviewCyclesPage() {
  return (
    <ListingPageTemplate
      title="Review Cycles"
      description="Plan, launch, and monitor employee performance review cycles."
    >
      <Alert>
        <AlertTitle>Review cycle data is unavailable</AlertTitle>
        <AlertDescription>
          The Review Cycles service is not connected.
        </AlertDescription>
      </Alert>
    </ListingPageTemplate>
  );
}

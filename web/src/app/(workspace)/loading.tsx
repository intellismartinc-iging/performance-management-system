import { ListingPageSkeleton } from "@/components/templates/listing-page-template";

/**
 * Default loading state for every workspace route: most pages are listings.
 * Add a `loading.tsx` next to a page that has a different layout (dashboard,
 * detail, or form) and use the matching skeleton from its template.
 */
export default function WorkspaceLoading() {
  return <ListingPageSkeleton />;
}

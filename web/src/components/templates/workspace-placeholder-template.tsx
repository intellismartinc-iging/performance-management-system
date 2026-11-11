import { ListingPageTemplate } from "@/components/templates/listing-page-template";

export function WorkspacePlaceholderTemplate({ title }: { title: string }) {
  return (
    <ListingPageTemplate title={title}>
      <p className="text-pms-body text-muted-foreground">
        This page is under development.
      </p>
    </ListingPageTemplate>
  );
}

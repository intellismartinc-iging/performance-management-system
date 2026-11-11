import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NotFoundStateProps {
  title?: string;
  description?: string;
  actionHref: string;
  actionLabel: string;
}

/**
 * 404 illustration with a way back. The SVG animates by itself, so it is shown
 * through an image element (not inlined) and left unoptimized to keep its
 * built-in animation and colors untouched.
 */
export function NotFoundState({
  title = "Page not found",
  description = "The page you are looking for does not exist or was moved.",
  actionHref,
  actionLabel,
}: NotFoundStateProps) {
  return (
    <div className="grid min-h-0 w-full flex-1 place-items-center px-3 py-8">
      <div className="grid max-w-pms-copy justify-items-center gap-4 text-center">
        <Image
          src="/assets/404.svg"
          alt="A broken robot next to a 404 error message"
          width={500}
          height={500}
          unoptimized
          priority
          className="h-auto w-full max-w-md"
        />
        <h1 className="text-pms-page-title text-balance">{title}</h1>
        <p className="text-pms-body text-muted-foreground">{description}</p>
        <Link
          href={actionHref}
          className={cn(
            buttonVariants(),
            "min-h-pms-touch rounded-pms-control",
          )}
        >
          {actionLabel}
        </Link>
      </div>
    </div>
  );
}

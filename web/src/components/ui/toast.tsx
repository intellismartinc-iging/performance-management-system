"use client";

import * as React from "react";
import { Toast as ToastPrimitive } from "@base-ui/react/toast";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
  XIcon,
  CircleCheckIcon,
  InfoIcon,
  TriangleAlertIcon,
  OctagonXIcon,
  Loader2Icon,
} from "lucide-react";

const baseToastManager = ToastPrimitive.createToastManager();

// Milliseconds before a toast closes by itself. 0 means it stays until dismissed.
const DEFAULT_TIMEOUTS: Record<string, number> = {
  success: 4000,
  info: 4000,
  warning: 7000,
  error: 0,
  loading: 0,
};

type BaseToastAddOptions = Parameters<typeof baseToastManager.add>[0];
type ToastShortcutOptions = Omit<BaseToastAddOptions, "title" | "type">;

const toast = {
  ...baseToastManager,
  add(options: BaseToastAddOptions) {
    const type = options.type || "info";
    const timeout = options.timeout ?? DEFAULT_TIMEOUTS[type] ?? 4000;

    return baseToastManager.add({ ...options, type, timeout });
  },
  success(title: React.ReactNode, options?: ToastShortcutOptions) {
    return this.add({ title, ...options, type: "success" });
  },
  info(title: React.ReactNode, options?: ToastShortcutOptions) {
    return this.add({ title, ...options, type: "info" });
  },
  warning(title: React.ReactNode, options?: ToastShortcutOptions) {
    return this.add({ title, ...options, type: "warning" });
  },
  error(title: React.ReactNode, options?: ToastShortcutOptions) {
    return this.add({ title, ...options, type: "error" });
  },
};

function ToastProvider({ ...props }: ToastPrimitive.Provider.Props) {
  return <ToastPrimitive.Provider {...props} />;
}

function ToastPortal({ ...props }: ToastPrimitive.Portal.Props) {
  return <ToastPrimitive.Portal data-slot="toast-portal" {...props} />;
}

// Position by width: top center on mobile, top right from 768px, bottom right from 1024px up.
function ToastViewport({ className, ...props }: ToastPrimitive.Viewport.Props) {
  return (
    <ToastPrimitive.Viewport
      data-slot="toast-viewport"
      className={cn(
        "pointer-events-none fixed inset-x-4 top-4 z-50 mx-auto flex max-w-sm flex-col gap-2 outline-none",
        "md:right-4 md:left-auto md:mx-0 md:w-full",
        "lg:top-auto lg:bottom-4",
        className,
      )}
      {...props}
    />
  );
}

function Toast({
  className,
  toast: toastItem,
  ...props
}: ToastPrimitive.Root.Props) {
  const type = toastItem?.type;

  return (
    <ToastPrimitive.Root
      data-slot="toast"
      toast={toastItem}
      role={type === "error" ? "alert" : "status"}
      className={cn(
        "group/toast pointer-events-auto relative flex w-full overflow-hidden rounded-pms-card border bg-popover text-popover-foreground shadow-pms-float outline-none select-none focus-visible:ring-2 focus-visible:ring-ring",
        "transition-[transform,opacity] duration-(--pms-motion-disclosure) ease-pms-enter",
        // Slides in from the edge it sits on: the top below 1024px, the bottom above it.
        "data-starting-style:-translate-y-4 data-starting-style:opacity-0 lg:data-starting-style:translate-y-4",
        "data-ending-style:-translate-y-4 data-ending-style:opacity-0 lg:data-ending-style:translate-y-4",
        "data-limited:hidden",
        type === "success" &&
          "border-l-4 border-l-(color:--pms-feedback-success)",
        type === "info" && "border-l-4 border-l-(color:--pms-feedback-info)",
        type === "warning" &&
          "border-l-4 border-l-(color:--pms-feedback-warning)",
        type === "error" && "border-l-4 border-l-(color:--pms-feedback-error)",
        className,
      )}
      {...props}
    />
  );
}

function ToastContent({ className, ...props }: ToastPrimitive.Content.Props) {
  return (
    <ToastPrimitive.Content
      data-slot="toast-content"
      className={cn(
        "flex w-full items-start justify-between gap-3 p-4 text-pms-label",
        className,
      )}
      {...props}
    />
  );
}

function ToastTitle({ className, ...props }: ToastPrimitive.Title.Props) {
  return (
    <ToastPrimitive.Title
      data-slot="toast-title"
      className={cn("text-pms-label font-semibold", className)}
      {...props}
    />
  );
}

function ToastDescription({
  className,
  ...props
}: ToastPrimitive.Description.Props) {
  return (
    <ToastPrimitive.Description
      data-slot="toast-description"
      className={cn(
        "text-pms-label font-normal text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

function ToastAction({
  className,
  render = <Button variant="outline" size="sm" />,
  ...props
}: ToastPrimitive.Action.Props) {
  return (
    <ToastPrimitive.Action
      data-slot="toast-action"
      render={render}
      className={cn("shrink-0", className)}
      {...props}
    />
  );
}

function ToastClose({
  className,
  children,
  render = <Button variant="ghost" size="icon-sm" />,
  ...props
}: ToastPrimitive.Close.Props) {
  return (
    <ToastPrimitive.Close
      data-slot="toast-close"
      aria-label="Close toast"
      render={render}
      className={cn(
        "relative -mt-1 -mr-1 shrink-0 cursor-pointer self-start text-muted-foreground after:absolute after:-inset-2 after:content-[''] hover:text-foreground",
        className,
      )}
      {...props}
    >
      {children ?? <XIcon aria-hidden="true" />}
    </ToastPrimitive.Close>
  );
}

function ToastIcon({ type }: { type: string | undefined }) {
  let icon: React.ReactNode = null;

  if (type === "success") {
    icon = (
      <CircleCheckIcon
        className="text-(color:--pms-feedback-success)"
        aria-hidden="true"
      />
    );
  }

  if (type === "info") {
    icon = (
      <InfoIcon
        className="text-(color:--pms-feedback-info)"
        aria-hidden="true"
      />
    );
  }

  if (type === "warning") {
    icon = (
      <TriangleAlertIcon
        className="text-(color:--pms-feedback-warning)"
        aria-hidden="true"
      />
    );
  }

  if (type === "error") {
    icon = (
      <OctagonXIcon
        className="text-(color:--pms-feedback-error)"
        aria-hidden="true"
      />
    );
  }

  if (type === "loading") {
    icon = (
      <Loader2Icon
        className="animate-spin text-muted-foreground"
        aria-hidden="true"
      />
    );
  }

  if (!icon) {
    return null;
  }

  return (
    <span
      data-slot="toast-icon"
      className="mt-0.5 shrink-0 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-5"
    >
      {icon}
    </span>
  );
}

function ToastList() {
  const { toasts } = ToastPrimitive.useToastManager();

  return toasts.map((toastItem) => (
    <Toast key={toastItem.id} toast={toastItem}>
      <ToastContent>
        <ToastIcon type={toastItem.type} />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <ToastTitle />
          <ToastDescription />
        </div>
        {toastItem.actionProps && <ToastAction />}
        <ToastClose />
      </ToastContent>
    </Toast>
  ));
}

function Toaster({
  children,
  toastManager = toast,
  ...props
}: ToastPrimitive.Provider.Props) {
  return (
    <ToastProvider toastManager={toastManager} {...props}>
      {children}
      <ToastPortal>
        <ToastViewport>
          <ToastList />
        </ToastViewport>
      </ToastPortal>
    </ToastProvider>
  );
}

const createToastManager = ToastPrimitive.createToastManager;
const useToastManager = ToastPrimitive.useToastManager;

export {
  Toaster,
  Toast,
  ToastAction,
  ToastClose,
  ToastContent,
  ToastDescription,
  ToastPortal,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  createToastManager,
  toast,
  useToastManager,
};

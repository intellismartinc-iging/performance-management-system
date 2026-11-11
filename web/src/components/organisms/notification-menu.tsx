"use client";

import Link from "next/link";
import { BellIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface NotificationItem {
  id: string;
  title: string;
  /** Preformatted time, for example "2 hours ago". */
  time: string;
  read: boolean;
  href?: string;
}

interface NotificationMenuProps {
  notifications: readonly NotificationItem[];
  onMarkAllRead?: () => void;
}

export function NotificationMenu({
  notifications,
  onMarkAllRead,
}: NotificationMenuProps) {
  const unread = notifications.filter((item) => !item.read).length;

  return (
    <Popover>
      <PopoverTrigger
        aria-label={
          unread > 0 ? `Notifications, ${unread} unread` : "Notifications"
        }
        render={
          <Button
            variant="ghost"
            size="icon"
            className="relative min-h-pms-touch min-w-pms-touch rounded-pms-control"
          />
        }
      >
        <BellIcon aria-hidden="true" />
        {unread > 0 && (
          <span
            aria-hidden="true"
            className="absolute top-1.5 right-1.5 size-2 rounded-full bg-(--base-error)"
          />
        )}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 max-w-[calc(100vw-2rem)]">
        <div className="flex items-center justify-between gap-2">
          <PopoverTitle className="text-pms-body">Notifications</PopoverTitle>
          {onMarkAllRead && unread > 0 && (
            <Button
              type="button"
              variant="ghost"
              className="min-h-pms-touch rounded-pms-control text-pms-label"
              onClick={onMarkAllRead}
            >
              Mark all as read
            </Button>
          )}
        </div>
        {notifications.length === 0 ? (
          <p className="py-4 text-center text-pms-table text-muted-foreground">
            You are all caught up.
          </p>
        ) : (
          <ul className="grid max-h-80 gap-1 overflow-auto">
            {notifications.map((item) => {
              const content = (
                <>
                  <span className="flex items-start gap-2">
                    {!item.read && (
                      <span
                        aria-hidden="true"
                        className="mt-1.5 size-2 shrink-0 rounded-full bg-(--pms-review-active-accent)"
                      />
                    )}
                    <span className="text-pms-table wrap-break-word">
                      {!item.read && <span className="sr-only">Unread: </span>}
                      {item.title}
                    </span>
                  </span>
                  <span className="text-pms-label text-muted-foreground">
                    {item.time}
                  </span>
                </>
              );
              const className =
                "grid gap-1 rounded-pms-control px-2 py-2 text-start hover:bg-muted";
              return (
                <li key={item.id}>
                  {item.href ? (
                    <Link href={item.href} className={className}>
                      {content}
                    </Link>
                  ) : (
                    <div className={className}>{content}</div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  );
}

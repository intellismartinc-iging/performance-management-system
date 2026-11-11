"use client";

import { Menu } from "@base-ui/react/menu";
import { Check, ChevronDown, LogOut, Settings, UserRound } from "lucide-react";
import { ThemeToggle } from "@/components/molecules/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { WORKSPACE_ROLE_LABELS } from "@/constants/workspace-navigation";
import type { WorkspaceRole } from "@/types/role";

const PREVIEW_ROLES: readonly WorkspaceRole[] = ["employee", "manager", "hr"];

interface WorkspaceAccountMenuProps {
  name: string;
  firstName: string;
  role: WorkspaceRole;
  onPreviewRoleChange: (role: WorkspaceRole) => void;
  placement?: "header" | "sidebar";
  avatarSrc?: string;
  onProfile?: () => void;
  onAccountSettings?: () => void;
  onLogout?: () => void;
}

const itemClass =
  "flex min-h-pms-touch items-center gap-2 rounded-pms-control px-2 text-pms-label outline-none data-highlighted:bg-accent data-highlighted:text-accent-foreground data-disabled:cursor-not-allowed data-disabled:text-muted-foreground";

export function WorkspaceAccountMenu({
  name,
  firstName,
  role,
  onPreviewRoleChange,
  placement = "header",
  avatarSrc,
  onProfile,
  onAccountSettings,
  onLogout,
}: WorkspaceAccountMenuProps) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
  const avatar = (
    <Avatar aria-hidden="true">
      {avatarSrc && <AvatarImage src={avatarSrc} alt={`Photo of ${name}`} />}
      <AvatarFallback className="text-pms-label">{initials}</AvatarFallback>
    </Avatar>
  );
  const identity = (
    <span className="grid min-w-0 text-start">
      <span className="truncate text-pms-label font-semibold">{name}</span>
      <span className="truncate text-pms-label text-muted-foreground">
        {WORKSPACE_ROLE_LABELS[role]}
      </span>
    </span>
  );

  return (
    <Menu.Root>
      <Menu.Trigger
        aria-label={`Account menu for ${name}`}
        render={
          <Button
            type="button"
            variant="plain"
            className={
              placement === "sidebar"
                ? "group/account min-h-pms-touch w-full justify-start gap-2 rounded-pms-control px-2 [&>svg:last-child]:ms-auto"
                : "group/account min-h-pms-touch gap-2 rounded-pms-control px-2"
            }
          />
        }
      >
        {avatar}
        <span className="text-pms-label">Hello, {firstName}!</span>
        <ChevronDown
          aria-hidden="true"
          className="size-pms-icon-inline motion-safe:transition-transform group-aria-expanded/account:rotate-180"
        />
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner
          side={placement === "sidebar" ? "top" : "bottom"}
          align="end"
          sideOffset={8}
          className="z-50"
        >
          <Menu.Popup
            aria-label="Account actions"
            className="w-56 max-w-(--available-width) rounded-pms-overlay border border-border bg-popover p-1 text-popover-foreground shadow-pms-float"
          >
            <div className="flex min-w-0 items-center gap-2 px-2 py-2">
              {avatar}
              {identity}
            </div>
            <Menu.Separator className="my-1 border-t border-border" />
            <p className="px-2 py-1 text-pms-label text-muted-foreground">
              Preview as user type
            </p>
            <Menu.RadioGroup value={role} aria-label="Preview as user type">
              {PREVIEW_ROLES.map((previewRole) => (
                <Menu.RadioItem
                  key={previewRole}
                  value={previewRole}
                  closeOnClick
                  className={itemClass + " justify-between"}
                  onClick={() => onPreviewRoleChange(previewRole)}
                >
                  {WORKSPACE_ROLE_LABELS[previewRole]}
                  <Menu.RadioItemIndicator>
                    <Check
                      aria-hidden="true"
                      className="size-pms-icon-inline"
                    />
                  </Menu.RadioItemIndicator>
                </Menu.RadioItem>
              ))}
            </Menu.RadioGroup>
            <Menu.Separator className="my-1 border-t border-border" />
            <div className="flex min-h-pms-touch items-center justify-between gap-2 px-2 text-pms-label">
              Theme
              <ThemeToggle />
            </div>
            <Menu.Separator className="my-1 border-t border-border" />
            <Menu.Item
              className={itemClass}
              disabled={!onProfile}
              onClick={onProfile}
            >
              <UserRound aria-hidden="true" className="size-pms-icon-inline" />
              Profile
            </Menu.Item>
            <Menu.Item
              className={itemClass}
              disabled={!onAccountSettings}
              onClick={onAccountSettings}
            >
              <Settings aria-hidden="true" className="size-pms-icon-inline" />
              Account settings
            </Menu.Item>
            <Menu.Separator className="my-1 border-t border-border" />
            <Menu.Item
              className={itemClass}
              disabled={!onLogout}
              onClick={onLogout}
            >
              <LogOut aria-hidden="true" className="size-pms-icon-inline" />
              Log out
            </Menu.Item>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}

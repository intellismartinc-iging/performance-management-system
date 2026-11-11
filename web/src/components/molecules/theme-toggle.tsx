"use client";

import { Switch } from "@base-ui/react/switch";
import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";

/**
 * Pill switch with the current theme written beside it ("Light" or "Dark"), so
 * the state is never left to color and knob position alone. The knob slides and
 * the icons cross-fade with Tailwind transitions.
 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const themeName = isDark ? "Dark" : "Light";

  return (
    <div className="flex items-center gap-2">
      <span
        aria-hidden="true"
        className="w-10 text-end text-pms-label text-muted-foreground"
      >
        {themeName}
      </span>
      <Switch.Root
        aria-label={`Theme: ${themeName}`}
        checked={isDark}
        onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
        className="group relative inline-flex h-[30px] w-14 shrink-0 cursor-pointer items-center rounded-full bg-(--pms-switch-track) p-[3px] transition-colors outline-none after:absolute after:-inset-2 focus-visible:ring-3 focus-visible:ring-ring/50 data-checked:bg-(--pms-switch-track-on)"
      >
        <Switch.Thumb className="relative flex size-6 items-center justify-center rounded-full bg-(--pms-switch-knob) shadow-md transition-transform duration-400 ease-out data-checked:translate-x-6 data-checked:bg-(--pms-switch-knob-on)">
          <SunIcon
            aria-hidden="true"
            className="size-3.5 text-(color:--pms-switch-sun) transition-opacity group-data-checked:opacity-0"
          />
          <MoonIcon
            aria-hidden="true"
            className="absolute size-3.5 text-(color:--pms-switch-moon) opacity-0 transition-opacity group-data-checked:opacity-100"
          />
        </Switch.Thumb>
      </Switch.Root>
    </div>
  );
}

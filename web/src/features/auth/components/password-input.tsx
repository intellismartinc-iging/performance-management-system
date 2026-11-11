"use client";

import { Eye, EyeOff } from "lucide-react";
import type { ComponentProps } from "react";
import { useState } from "react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";

type PasswordInputProps = Omit<
  ComponentProps<typeof InputGroupInput>,
  "type"
> & {
  visibilityLabel: string;
};

export function PasswordInput({
  visibilityLabel,
  ...props
}: PasswordInputProps) {
  const [isVisible, setIsVisible] = useState(false);
  const VisibilityIcon = isVisible ? EyeOff : Eye;

  return (
    <InputGroup className="min-h-pms-touch">
      <InputGroupInput {...props} type={isVisible ? "text" : "password"} />
      <InputGroupAddon align="inline-end" className="py-0">
        <InputGroupButton
          size="icon-sm"
          variant="plain"
          aria-label={
            isVisible ? `Hide ${visibilityLabel}` : `Show ${visibilityLabel}`
          }
          aria-controls={props.id}
          disabled={props.disabled}
          className="min-h-pms-touch min-w-pms-touch"
          onClick={() => setIsVisible((visible) => !visible)}
        >
          <VisibilityIcon aria-hidden="true" />
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  );
}

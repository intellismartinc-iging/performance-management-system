"use client";

import type { FocusEvent } from "react";
import { useId, useState } from "react";
import type { RegisterOptions } from "react-hook-form";
import { useForm } from "react-hook-form";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/features/auth/components/password-input";
import {
  MAX_PASSWORD_LENGTH,
  MIN_PASSWORD_LENGTH,
} from "@/features/auth/services/auth-credentials";
import type { AuthMode } from "@/features/auth/services/auth-credentials";
import { submitCredentials } from "@/features/auth/services/submit-credentials";

interface CredentialsFields {
  identifier: string;
  employeeCode: string;
  username: string;
  password: string;
  confirmPassword: string;
}

const REQUIRED_TEXT = (message: string) => ({
  required: message,
  validate: (value: string) => value.trim() !== "" || message,
});

export function CredentialsForm({ mode }: { mode: AuthMode }) {
  const id = useId();
  const isSignUp = mode === "sign-up";
  const [doneMessage, setDoneMessage] = useState("");
  const {
    register,
    getFieldState,
    handleSubmit,
    setError,
    trigger,
    formState: { errors, isSubmitted, isSubmitting },
  } = useForm<CredentialsFields>({ mode: "onTouched" });

  function registerCredentialField(
    name: keyof CredentialsFields,
    options: RegisterOptions<CredentialsFields, keyof CredentialsFields>,
  ) {
    const field = register(name, options);
    return {
      ...field,
      onBlur(event: FocusEvent<HTMLInputElement>) {
        if (
          event.currentTarget.value !== "" ||
          getFieldState(name).isTouched ||
          isSubmitted
        ) {
          return field.onBlur(event);
        }
      },
    };
  }

  const submit = handleSubmit(async (fields) => {
    const result = await submitCredentials(
      mode,
      isSignUp
        ? {
            employeeCode: fields.employeeCode,
            username: fields.username,
            password: fields.password,
            confirmPassword: fields.confirmPassword,
          }
        : { identifier: fields.identifier, password: fields.password },
    );
    if (result.isSuccess) {
      setDoneMessage(result.message);
      return;
    }
    setError("root", { message: result.message });
  });

  if (doneMessage) {
    return (
      <Alert>
        <AlertDescription>{doneMessage}</AlertDescription>
      </Alert>
    );
  }

  return (
    <form method="post" noValidate onSubmit={submit} className="grid gap-6">
      <FieldGroup className="gap-5">
        {isSignUp ? (
          <>
            <Field data-invalid={Boolean(errors.employeeCode)}>
              <FieldLabel htmlFor={`${id}-employee-code`}>
                Employee code
              </FieldLabel>
              <Input
                {...registerCredentialField(
                  "employeeCode",
                  REQUIRED_TEXT("Enter your employee code."),
                )}
                id={`${id}-employee-code`}
                autoComplete="off"
                required
                readOnly={isSubmitting}
                aria-invalid={Boolean(errors.employeeCode)}
                aria-describedby={
                  errors.employeeCode ? `${id}-employee-code-error` : undefined
                }
                className="min-h-pms-touch"
              />
              <FieldError
                id={`${id}-employee-code-error`}
                errors={[errors.employeeCode]}
              />
            </Field>
            <Field data-invalid={Boolean(errors.username)}>
              <FieldLabel htmlFor={`${id}-username`}>Username</FieldLabel>
              <Input
                {...registerCredentialField(
                  "username",
                  REQUIRED_TEXT("Choose a username."),
                )}
                id={`${id}-username`}
                autoComplete="username"
                required
                readOnly={isSubmitting}
                aria-invalid={Boolean(errors.username)}
                aria-describedby={
                  errors.username ? `${id}-username-error` : undefined
                }
                className="min-h-pms-touch"
              />
              <FieldError
                id={`${id}-username-error`}
                errors={[errors.username]}
              />
            </Field>
          </>
        ) : (
          <Field data-invalid={Boolean(errors.identifier)}>
            <FieldLabel htmlFor={`${id}-identifier`}>
              Email or username
            </FieldLabel>
            <Input
              {...registerCredentialField(
                "identifier",
                REQUIRED_TEXT("Enter your email or username."),
              )}
              id={`${id}-identifier`}
              autoComplete="username"
              required
              readOnly={isSubmitting}
              aria-invalid={Boolean(errors.identifier)}
              aria-describedby={
                errors.identifier ? `${id}-identifier-error` : undefined
              }
              className="min-h-pms-touch"
            />
            <FieldError
              id={`${id}-identifier-error`}
              errors={[errors.identifier]}
            />
          </Field>
        )}
        <Field data-invalid={Boolean(errors.password)}>
          <FieldLabel htmlFor={`${id}-password`}>Password</FieldLabel>
          <PasswordInput
            visibilityLabel="password"
            {...registerCredentialField("password", {
              required: "Enter your password.",
              minLength: {
                value: MIN_PASSWORD_LENGTH,
                message: `Enter at least ${MIN_PASSWORD_LENGTH} characters.`,
              },
              maxLength: {
                value: MAX_PASSWORD_LENGTH,
                message: `Enter no more than ${MAX_PASSWORD_LENGTH} characters.`,
              },
              onChange: () => {
                if (
                  isSignUp &&
                  (getFieldState("confirmPassword").isTouched || isSubmitted)
                ) {
                  void trigger("confirmPassword");
                }
              },
            })}
            id={`${id}-password`}
            autoComplete={isSignUp ? "new-password" : "current-password"}
            required
            readOnly={isSubmitting}
            aria-invalid={Boolean(errors.password)}
            aria-describedby={
              errors.password
                ? `${id}-password-error`
                : isSignUp
                  ? `${id}-password-hint`
                  : undefined
            }
          />
          {isSignUp && !errors.password && (
            <p
              id={`${id}-password-hint`}
              className="text-pms-label text-muted-foreground"
            >
              Use {MIN_PASSWORD_LENGTH} to {MAX_PASSWORD_LENGTH} characters.
            </p>
          )}
          <FieldError id={`${id}-password-error`} errors={[errors.password]} />
        </Field>
        {isSignUp && (
          <Field data-invalid={Boolean(errors.confirmPassword)}>
            <FieldLabel htmlFor={`${id}-confirm`}>Confirm password</FieldLabel>
            <PasswordInput
              visibilityLabel="confirmation password"
              {...registerCredentialField("confirmPassword", {
                required: "Confirm your password.",
                validate: (value, values) =>
                  value === values.password || "Passwords must match.",
              })}
              id={`${id}-confirm`}
              autoComplete="new-password"
              required
              readOnly={isSubmitting}
              aria-invalid={Boolean(errors.confirmPassword)}
              aria-describedby={
                errors.confirmPassword ? `${id}-confirm-error` : undefined
              }
            />
            <FieldError
              id={`${id}-confirm-error`}
              errors={[errors.confirmPassword]}
            />
          </Field>
        )}
      </FieldGroup>
      {errors.root?.message && (
        <Alert>
          <AlertDescription>{errors.root.message}</AlertDescription>
        </Alert>
      )}
      <Button
        type="submit"
        disabled={isSubmitting}
        className="min-h-pms-touch w-full"
      >
        {isSubmitting ? "Please wait…" : isSignUp ? "Create account" : "Log in"}
      </Button>
    </form>
  );
}

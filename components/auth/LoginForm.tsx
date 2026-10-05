"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { EyeIcon, EyeOffIcon } from "@/components/ui/icons";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { normalizeCenterId, signIn, validate } from "@/lib/auth";
import { DEMO_CENTER_ID, ROLES } from "@/lib/constants";
import {
  rememberedStore,
  sessionStore,
  type RememberedCredentials,
} from "@/lib/stores/session";
import type { LoginCredentials } from "@/types/auth";

const ROLE_OPTIONS = ROLES.map((role) => ({
  value: role.id,
  label: role.label,
}));

export function LoginForm() {
  const snapshot = useSyncExternalStore(
    rememberedStore.subscribe,
    rememberedStore.getSnapshot,
    rememberedStore.getServerSnapshot,
  );

  // Remounting on the key lets the fields seed themselves from storage without
  // an effect — and the pre-hydration render stays identical to the server's.
  return (
    <LoginFields
      key={snapshot.ready ? "remembered" : "pending"}
      remembered={snapshot.ready ? snapshot.value : null}
    />
  );
}

function LoginFields({
  remembered,
}: {
  remembered: RememberedCredentials | null;
}) {
  const router = useRouter();

  const [form, setForm] = useState<LoginCredentials>(() => ({
    centerId: remembered?.centerId ?? "",
    role: "",
    username: remembered?.username ?? "",
    password: "",
    remember: Boolean(remembered?.username),
  }));
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const selectedRole = ROLES.find((role) => role.id === form.role);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const problem = validate(form);
    if (problem) {
      setError(problem);
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      await signIn(form);
      // The stores cache their last read; without this the dashboard's auth
      // gate would still see the pre-login session and bounce straight back.
      sessionStore.refresh();
      rememberedStore.refresh();
      router.replace("/dashboard");
    } catch {
      setError("We couldn't sign you in. Try again.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <Input
        label="Center ID"
        name="centerId"
        autoComplete="organization"
        spellCheck={false}
        autoCapitalize="characters"
        placeholder={DEMO_CENTER_ID}
        hint="The identifier issued to your clinic."
        value={form.centerId}
        invalid={Boolean(error) && normalizeCenterId(form.centerId).length < 4}
        onChange={(event) => setForm({ ...form, centerId: event.target.value })}
        // Displayed uppercase; the raw value is normalised on submit so the
        // caret never jumps mid-typing.
        className="font-mono uppercase tracking-[0.06em] placeholder:tracking-normal"
      />

      <div className="space-y-1.5">
        <Select
          label="Role"
          name="role"
          options={ROLE_OPTIONS}
          placeholder="Select your role"
          value={form.role}
          invalid={Boolean(error) && !form.role}
          onChange={(event) =>
            setForm({
              ...form,
              role: event.target.value as LoginCredentials["role"],
            })
          }
        />
        {selectedRole && (
          <p className="text-xs text-ink-muted">{selectedRole.blurb}</p>
        )}
      </div>

      <Input
        label="Username"
        name="username"
        autoComplete="username"
        placeholder="jane.doe"
        value={form.username}
        invalid={Boolean(error) && !form.username.trim()}
        onChange={(event) => setForm({ ...form, username: event.target.value })}
      />

      <Input
        label="Password"
        name="password"
        type={showPassword ? "text" : "password"}
        autoComplete="current-password"
        placeholder="••••••••"
        value={form.password}
        onChange={(event) => setForm({ ...form, password: event.target.value })}
        trailing={
          <button
            type="button"
            onClick={() => setShowPassword((visible) => !visible)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink-soft"
          >
            {showPassword ? (
              <EyeOffIcon className="h-[18px] w-[18px]" />
            ) : (
              <EyeIcon className="h-[18px] w-[18px]" />
            )}
          </button>
        }
      />

      <div className="flex items-center justify-between pt-0.5">
        <Checkbox
          label="Keep me signed in"
          name="remember"
          checked={form.remember}
          onChange={(event) =>
            setForm({ ...form, remember: event.target.checked })
          }
        />
        <Link
          href="/forgot-password"
          className="text-[0.8125rem] font-medium text-brand-600 underline-offset-4 hover:underline"
        >
          Forgot password?
        </Link>
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-xl border border-critical/25 bg-critical/5 px-3.5 py-2.5 text-[0.8125rem] text-critical"
        >
          {error}
        </p>
      )}

      <Button type="submit" size="lg" loading={submitting} className="w-full">
        {submitting ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}

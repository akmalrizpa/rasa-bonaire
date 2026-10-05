"use client";

import { useActionState, useRef, useState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { loginAction, registerAction, updateProfileAction } from "@/actions/auth";
import { IconCheck, IconInfo, IconSpinner } from "@/components/Icons";
import { btnPrimary, card, field, label } from "@/components/ui";
import type { PublicUser } from "@/lib/types";

function SubmitButton({
  label: text,
  pendingLabel,
  className = btnPrimary,
}: {
  label: string;
  pendingLabel: string;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={className}>
      {pending ? (
        <>
          <IconSpinner size={16} />
          {pendingLabel}
        </>
      ) : (
        text
      )}
    </button>
  );
}

function ErrorBox({ message }: { message: string }) {
  return (
    <p className="flex items-start gap-2 rounded-card bg-warn-soft px-3.5 py-3 text-sm text-warn">
      <IconInfo size={16} className="mt-0.5 shrink-0" />
      <span>{message}</span>
    </p>
  );
}

function Hint({ children }: { children: ReactNode }) {
  return <p className="mt-1.5 text-xs text-muted">{children}</p>;
}

export function LoginForm({ next }: { next?: string }) {
  const [state, formAction] = useActionState(loginAction, { error: undefined });
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const passwordRef = useRef<HTMLInputElement>(null);

  function fill(user: string) {
    setUsername(user);
    setPassword(user);
    passwordRef.current?.focus();
  }

  return (
    <form action={formAction} className={`${card} p-6 sm:p-7`}>
      <h1 className="font-display text-2xl">Sign in</h1>
      <p className="mt-1.5 text-sm text-muted">
        Your preorders, invoices and saved contact details live behind this door.
      </p>

      {state.error ? (
        <div className="mt-5">
          <ErrorBox message={state.error} />
        </div>
      ) : null}

      <div className="mt-5 space-y-4">
        <div>
          <label className={label} htmlFor="login-username">
            Username
          </label>
          <input
            id="login-username"
            name="username"
            autoComplete="username"
            autoCapitalize="none"
            required
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            className={`${field} mt-2`}
            placeholder="your username"
          />
        </div>

        <div>
          <label className={label} htmlFor="login-password">
            Password
          </label>
          <input
            ref={passwordRef}
            id="login-password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className={`${field} mt-2`}
            placeholder="your password"
          />
        </div>
      </div>

      {next ? <input type="hidden" name="next" value={next} /> : null}

      <SubmitButton label="Sign in" pendingLabel="Checking the kitchen" />

      <div className="mt-6 border-t border-line pt-5">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Demo accounts</p>
        <div className="mt-3 space-y-2.5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-ink-soft">
              <span className="font-semibold">admin / admin</span> — kitchen dashboard and order
              queue
            </p>
            <button
              type="button"
              onClick={() => fill("admin")}
              className="shrink-0 rounded-card border border-line bg-shell px-3 py-1.5 text-xs font-semibold text-ink transition hover:bg-sand"
            >
              Use admin
            </button>
          </div>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-ink-soft">
              <span className="font-semibold">user / user</span> — customer account
            </p>
            <button
              type="button"
              onClick={() => fill("user")}
              className="shrink-0 rounded-card border border-line bg-shell px-3 py-1.5 text-xs font-semibold text-ink transition hover:bg-sand"
            >
              Use user
            </button>
          </div>
        </div>
        <p className="mt-3 text-xs text-muted">
          These two accounts only exist in the demo dataset. Remove them before the kitchen takes
          real orders.
        </p>
      </div>
    </form>
  );
}

export function RegisterForm() {
  const [state, formAction] = useActionState(registerAction, { error: undefined });

  return (
    <form action={formAction} className={`${card} p-6 sm:p-7`}>
      <h1 className="font-display text-2xl">Create an account</h1>
      <p className="mt-1.5 text-sm text-muted">
        One account covers the preorders, the pickup calls and the receipts.
      </p>

      {state.error ? (
        <div className="mt-5">
          <ErrorBox message={state.error} />
        </div>
      ) : null}

      <div className="mt-5 space-y-4">
        <div>
          <label className={label} htmlFor="register-username">
            Username
          </label>
          <input
            id="register-username"
            name="username"
            autoComplete="username"
            autoCapitalize="none"
            required
            className={`${field} mt-2`}
            placeholder="sanne_b"
          />
          <Hint>3 to 20 characters. Letters, numbers or underscore. Used to sign in.</Hint>
        </div>

        <div>
          <label className={label} htmlFor="register-name">
            Full name
          </label>
          <input
            id="register-name"
            name="name"
            autoComplete="name"
            required
            className={`${field} mt-2`}
            placeholder="Sanne Bakker"
          />
          <Hint>This is the name the kitchen calls out with your order.</Hint>
        </div>

        <div>
          <label className={label} htmlFor="register-email">
            Email
          </label>
          <input
            id="register-email"
            name="email"
            type="email"
            autoComplete="email"
            className={`${field} mt-2`}
            placeholder="sanne@example.com"
          />
          <Hint>Optional. Invoices and receipts go here.</Hint>
        </div>

        <div>
          <label className={label} htmlFor="register-phone">
            Phone
          </label>
          <input
            id="register-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            required
            className={`${field} mt-2`}
            placeholder="+599 780 1188"
          />
          <Hint>We call or WhatsApp this number about pickups.</Hint>
        </div>

        <div>
          <label className={label} htmlFor="register-password">
            Password
          </label>
          <input
            id="register-password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={6}
            className={`${field} mt-2`}
            placeholder="at least six characters"
          />
          <Hint>Six characters or more. Nothing else is enforced.</Hint>
        </div>
      </div>

      <div className="mt-6">
        <SubmitButton label="Create account" pendingLabel="Setting up the account" />
      </div>

      <p className="mt-4 text-xs text-muted">
        The phone number is how the kitchen reaches you about pickups — if a slot runs late, that
        is the number we call.
      </p>
    </form>
  );
}

export function ProfileForm({ user }: { user: PublicUser }) {
  const [state, formAction] = useActionState(updateProfileAction, { error: undefined });

  return (
    <form action={formAction} className={`${card} p-6 sm:p-7`}>
      <h2 className="font-display text-xl">Contact details</h2>
      <p className="mt-1.5 text-sm text-muted">
        Prefilled on every new preorder, so you only type them once.
      </p>

      {state.error ? (
        <div className="mt-5">
          <ErrorBox message={state.error} />
        </div>
      ) : null}

      {state.notice ? (
        <p className="mt-5 flex items-start gap-2 rounded-card bg-ok-soft px-3.5 py-3 text-sm text-ok">
          <IconCheck size={16} className="mt-0.5 shrink-0" />
          <span>{state.notice}</span>
        </p>
      ) : null}

      <div className="mt-5 space-y-4">
        <div>
          <label className={label} htmlFor="profile-name">
            Full name
          </label>
          <input
            id="profile-name"
            name="name"
            defaultValue={user.name}
            autoComplete="name"
            required
            className={`${field} mt-2`}
          />
        </div>

        <div>
          <label className={label} htmlFor="profile-email">
            Email
          </label>
          <input
            id="profile-email"
            name="email"
            type="email"
            defaultValue={user.email}
            autoComplete="email"
            className={`${field} mt-2`}
          />
        </div>

        <div>
          <label className={label} htmlFor="profile-phone">
            Phone
          </label>
          <input
            id="profile-phone"
            name="phone"
            type="tel"
            defaultValue={user.phone}
            autoComplete="tel"
            className={`${field} mt-2`}
          />
          <Hint>Used for pickup calls and WhatsApp messages.</Hint>
        </div>
      </div>

      <div className="mt-6">
        <SubmitButton label="Save details" pendingLabel="Saving" />
      </div>
    </form>
  );
}

"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: LoginState = {};

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <div className="-mt-16 flex min-h-screen items-center justify-center bg-(--brand-cream) px-5 pt-16">
      <form
        action={formAction}
        className="w-full max-w-sm space-y-4 border border-black/10 bg-white px-8 py-10 shadow-xl"
      >
        <h1 className="text-center text-xl font-semibold tracking-wide uppercase">
          Admin login
        </h1>

        <div className="space-y-1.5">
          <Label htmlFor="username">Username</Label>
          <Input id="username" name="username" autoComplete="username" required />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </div>

        {state?.error && <p className="text-sm text-destructive">{state.error}</p>}

        <Button type="submit" className="h-11 w-full text-sm" disabled={pending}>
          {pending ? "Signing in..." : "Sign in"}
        </Button>
      </form>
    </div>
  );
}

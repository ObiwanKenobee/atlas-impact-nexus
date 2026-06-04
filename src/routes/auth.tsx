import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PageShell, PageHeader } from "@/components/PageShell";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Atlas Sanctum" },
      { name: "description", content: "Sign in or create an Atlas Sanctum account to fund projects and upload field evidence." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate({ to: "/dashboard" });
  }, [loading, user, navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: { display_name: displayName || email.split("@")[0] },
          },
        });
        if (error) throw error;
        toast.success("Check your email to confirm your account.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back.");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    try {
      const res = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin + "/dashboard",
      });
      if (res.error) throw res.error;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Google sign-in failed");
    }
  }

  return (
    <PageShell>
      <PageHeader
        eyebrow={mode === "signup" ? "Create account" : "Sign in"}
        title={mode === "signup" ? "Join the ledger." : "Welcome back to the ledger."}
        description="Sign in to upload field evidence, fund projects, and receive donor receipts."
      />
      <section className="px-6 py-12">
        <div className="mx-auto max-w-md rounded-2xl bg-card p-8 ring-1 ring-ink/5">
          <button
            type="button"
            onClick={google}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-ink/10 bg-sand py-2.5 text-sm font-medium text-ink hover:bg-sand-deep"
          >
            Continue with Google
          </button>
          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-ink/10" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-ink/40">or</span>
            <div className="h-px flex-1 bg-ink/10" />
          </div>
          <form onSubmit={submit} className="space-y-3">
            {mode === "signup" && (
              <input
                type="text"
                placeholder="Display name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full rounded-xl bg-sand-deep px-4 py-2.5 text-sm ring-1 ring-ink/5 focus:outline-none focus:ring-moss"
              />
            )}
            <input
              type="email"
              required
              placeholder="Email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl bg-sand-deep px-4 py-2.5 text-sm ring-1 ring-ink/5 focus:outline-none focus:ring-moss"
            />
            <input
              type="password"
              required
              minLength={6}
              placeholder="Password"
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl bg-sand-deep px-4 py-2.5 text-sm ring-1 ring-ink/5 focus:outline-none focus:ring-moss"
            />
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-full bg-ink py-3 text-sm font-medium text-sand hover:bg-moss disabled:opacity-60"
            >
              {busy ? "Working…" : mode === "signup" ? "Create account" : "Sign in"}
            </button>
          </form>
          <p className="mt-5 text-center text-xs text-ink/55">
            {mode === "signup" ? "Already have an account?" : "New to Atlas?"}{" "}
            <button
              type="button"
              onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
              className="font-medium text-moss hover:underline"
            >
              {mode === "signup" ? "Sign in" : "Create one"}
            </button>
          </p>
          <p className="mt-4 text-center">
            <Link to="/" className="text-xs text-ink/45 hover:text-ink">
              ← Back to home
            </Link>
          </p>
        </div>
      </section>
    </PageShell>
  );
}

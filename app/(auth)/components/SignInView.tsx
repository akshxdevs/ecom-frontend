"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { loginUser } from "@/app/lib/auth/login";
import { signIn } from "next-auth/react";
import toast from "react-hot-toast";
import {
  BadgeCheck,
  Chrome,
  Loader2,
  Lock,
  Mail,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

const featureHighlights = [
  "Passwordless-ready architecture",
  "FIDO2 compliant security",
  "Session mirroring across devices",
];

export default function SignInView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/createproduct";
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ctaLabel = useMemo(() => {
    if (loading) return "Signing you in...";
    return "Continue";
  }, [loading]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!form.email || !form.password) {
      setError("Enter your credentials to continue.");
      return;
    }

    setLoading(true);

    try {
      const result = await loginUser({
        email: form.email,
        password: form.password,
        callbackUrl,
      });

      if (!result || !result.ok) {
        const message = result?.error ?? "Invalid email or password.";
        setError(message);
        toast.error(message);
        return;
      }

      toast.success("Welcome back!");
      router.push(result.url ?? callbackUrl);
    } catch (err: any) {
      const message =
        err?.message ?? "Something went wrong while signing you in.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError(null);

    try {
      await signIn("google", { callbackUrl });
    } catch (err: any) {
      const message =
        err?.message ?? "Unable to connect with Google right now.";
      setError(message);
      toast.error(message);
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050505] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.35),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(236,72,153,0.35),_transparent_55%)]" />
      <div className="relative z-10 flex min-h-screen flex-col lg:flex-row">
        <section className="flex flex-1 flex-col justify-between border-b border-white/5 p-8 lg:border-b-0 lg:border-r">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium uppercase tracking-widest text-white/80">
              <Sparkles className="h-3 w-3 text-pink-400" /> Ecom Auth
            </span>
            <div className="mt-10 space-y-6">
              <h1 className="text-4xl font-semibold leading-tight tracking-tight text-white md:text-5xl">
                Welcome back to{" "}
                <span className="from-violet-400 via-sky-400 to-emerald-300 bg-gradient-to-r bg-clip-text text-transparent">
                  Cursor Commerce
                </span>
              </h1>
              <p className="max-w-xl text-lg text-white/70">
                Sign in to orchestrate drops, manage your storefront, and keep
                your Solana commerce stack in sync. Feel right at home with a
                flow inspired by Cursor’s own authentication surface.
              </p>
            </div>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {featureHighlights.map((feature) => (
              <div
                key={feature}
                className="rounded-2xl border border-white/5 bg-white/[0.03] p-4 backdrop-blur"
              >
                <BadgeCheck className="h-5 w-5 text-emerald-300" />
                <p className="mt-3 text-sm text-white/70">{feature}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="flex flex-1 items-center justify-center px-6 py-12">
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-black/40 p-8 shadow-2xl backdrop-blur">
            <div className="absolute -top-12 right-12 h-24 w-24 rounded-full bg-gradient-to-br from-violet-500/50 to-cyan-400/50 blur-3xl" />
            <div className="relative space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold text-white">
                  Sign in to continue
                </h2>
                <p className="text-sm text-white/60">
                  Use your workspace credentials or jump in with Google.
                </p>
              </div>

              {error ? (
                <div className="flex items-center gap-3 rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  <ShieldCheck className="h-4 w-4" />
                  {error}
                </div>
              ) : null}

              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-white/60">
                    Work email
                  </label>
                  <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 focus-within:border-violet-400/60">
                    <Mail className="h-4 w-4 text-white/40" />
                    <input
                      className="w-full bg-transparent text-sm text-white placeholder:text-white/30 focus:outline-none"
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      required
                      placeholder="hi@cursor.dev"
                      value={form.email}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          email: event.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-white/60">
                    Password
                  </label>
                  <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 focus-within:border-violet-400/60">
                    <Lock className="h-4 w-4 text-white/40" />
                    <input
                      className="w-full bg-transparent text-sm text-white placeholder:text-white/30 focus:outline-none"
                      type="password"
                      autoComplete="current-password"
                      required
                      placeholder="••••••••"
                      value={form.password}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          password: event.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-white/50">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="accent-violet-400"
                      defaultChecked
                    />
                    Remember me
                  </label>
                  <button
                    type="button"
                    className="text-violet-200 hover:text-white"
                  >
                    Reset access
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white/90 py-3 text-sm font-medium text-black transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {ctaLabel}
                    </>
                  ) : (
                    <>
                      Continue
                      <Sparkles className="h-4 w-4 text-black/70" />
                    </>
                  )}
                </button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="h-px w-full bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                </div>
                <p className="relative mx-auto w-max bg-transparent px-4 text-xs uppercase tracking-[0.3em] text-white/40">
                  Or
                </p>
              </div>

              <button
                onClick={handleGoogleSignIn}
                disabled={googleLoading}
                className="flex w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5 py-3 text-sm font-medium text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {googleLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Connecting to Google
                  </>
                ) : (
                  <>
                    <Chrome className="h-4 w-4 text-white/70" />
                    Continue with Google
                  </>
                )}
              </button>

              <p className="text-center text-sm text-white/60">
                Need an account?{" "}
                <Link
                  href="/signup"
                  className="text-white underline-offset-4 hover:underline"
                >
                  Create one
                </Link>
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}


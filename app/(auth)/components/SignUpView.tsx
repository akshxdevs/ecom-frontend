"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Loader2, Mail, Shield, Sparkles, User, Lock, Check } from "lucide-react";
import { signupUser, SignupResponse } from "@/app/lib/auth/signup";

const roleOptions = [
  { label: "Customer", description: "Shop & collect drops.", value: "Customer" },
  { label: "Seller", description: "Launch your storefront.", value: "Seller" },
  { label: "Delivery", description: "Manage fulfilment.", value: "Delivery" },
];

const passwordChecklist = [
  { label: "At least 8 characters", test: (value: string) => value.length >= 8 },
  { label: "Includes a number", test: (value: string) => /\d/.test(value) },
  { label: "Has a symbol", test: (value: string) => /[\W_]/.test(value) },
];

export default function SignUpView() {
  const router = useRouter();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "Customer",
  });
  const [loading, setLoading] = useState(false);
  const [createdUser, setCreatedUser] = useState<SignupResponse["user"] | null>(null);

  const passwordScore = useMemo(() => {
    return passwordChecklist.reduce(
      (score, rule) => (rule.test(form.password) ? score + 1 : score),
      0
    );
  }, [form.password]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    try {
      const payload = await signupUser(
        form.username.trim(),
        form.email.trim(),
        form.password,
        form.role
      );

      setCreatedUser(payload.user);
      toast.success("Account created. You can sign in now.");

      setTimeout(() => router.push("/signin"), 800);
    } catch (err: any) {
      const message = err?.response?.data ?? "Unable to create your account.";
      toast.error(typeof message === "string" ? message : "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#040305] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.35),_transparent_45%),radial-gradient(circle_at_bottom,_rgba(147,51,234,0.25),_transparent_45%)]" />
      <div className="relative z-10 flex min-h-screen flex-col lg:flex-row">
        <section className="flex flex-1 flex-col justify-between border-b border-white/5 p-8 lg:border-b-0 lg:border-r">
          <div>
            <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-white/50">
              <Shield className="h-4 w-4 text-cyan-300" />
              Verified workspace access
            </p>
            <div className="mt-10 space-y-6">
              <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
                Create your{" "}
                <span className="from-cyan-300 via-blue-400 to-purple-400 bg-gradient-to-r bg-clip-text text-transparent">
                  Cursor-style
                </span>{" "}
                commerce identity.
              </h1>
              <p className="max-w-xl text-lg text-white/70">
                Join the Solana commerce OS, manage multi-role storefronts and
                ship with the exact polish you expect from Cursor’s own auth
                experience.
              </p>
            </div>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {roleOptions.map((role) => (
              <div
                key={role.value}
                className="rounded-3xl border border-white/5 bg-white/[0.03] p-4 backdrop-blur"
              >
                <p className="text-sm font-medium text-white">{role.label}</p>
                <p className="mt-2 text-xs text-white/60">{role.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="flex flex-1 items-center justify-center px-6 py-12">
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-black/40 p-8 shadow-2xl backdrop-blur">
            <div className="absolute -left-16 top-0 h-28 w-28 rounded-full bg-gradient-to-tr from-cyan-400/50 to-blue-500/40 blur-3xl" />
            <div className="absolute -right-8 bottom-8 h-32 w-32 rounded-full bg-gradient-to-br from-violet-500/40 to-fuchsia-500/40 blur-3xl" />

            <div className="relative space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold text-white">
                  Build your workspace identity
                </h2>
                <p className="text-sm text-white/60">
                  We&apos;ll use this profile across dashboards and operations.
                </p>
              </div>

              {createdUser ? (
                <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                  <p className="font-medium">All set!</p>
                  <p className="text-emerald-100/80">
                    {createdUser.email} can now sign in.
                  </p>
                </div>
              ) : null}

              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-white/60">
                    Username
                  </label>
                  <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 focus-within:border-cyan-400/60">
                    <User className="h-4 w-4 text-white/40" />
                    <input
                      className="w-full bg-transparent text-sm text-white placeholder:text-white/30 focus:outline-none"
                      placeholder="solana.studio"
                      value={form.username}
                      autoComplete="username"
                      required
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, username: event.target.value }))
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-white/60">
                    Work email
                  </label>
                  <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 focus-within:border-cyan-400/60">
                    <Mail className="h-4 w-4 text-white/40" />
                    <input
                      className="w-full bg-transparent text-sm text-white placeholder:text-white/30 focus:outline-none"
                      placeholder="you@workspace.dev"
                      type="email"
                      autoComplete="email"
                      required
                      value={form.email}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, email: event.target.value }))
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-white/60">
                    Password
                  </label>
                  <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 focus-within:border-cyan-400/60">
                    <Lock className="h-4 w-4 text-white/40" />
                    <input
                      className="w-full bg-transparent text-sm text-white placeholder:text-white/30 focus:outline-none"
                      type="password"
                      autoComplete="new-password"
                      required
                      value={form.password}
                      placeholder="••••••••"
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, password: event.target.value }))
                      }
                    />
                  </div>
                  <div className="flex gap-1">
                    {[0, 1, 2].map((index) => (
                      <span
                        key={index}
                        className={`h-1 flex-1 rounded-full ${
                          passwordScore > index ? "bg-cyan-400" : "bg-white/10"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="space-y-1">
                    {passwordChecklist.map((rule) => (
                      <p
                        key={rule.label}
                        className={`flex items-center gap-2 text-xs ${
                          rule.test(form.password)
                            ? "text-emerald-300"
                            : "text-white/40"
                        }`}
                      >
                        <Check className="h-3 w-3" />
                        {rule.label}
                      </p>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-xs uppercase tracking-widest text-white/60">
                    Workspace role
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    {roleOptions.map((role) => (
                      <button
                        type="button"
                        key={role.value}
                        onClick={() =>
                          setForm((prev) => ({ ...prev, role: role.value }))
                        }
                        className={`rounded-2xl border px-3 py-3 text-left text-xs transition ${
                          form.role === role.value
                            ? "border-cyan-400/70 bg-cyan-400/10 text-white"
                            : "border-white/10 bg-white/5 text-white/60 hover:border-white/30"
                        }`}
                      >
                        <p className="font-medium">{role.label}</p>
                        <p className="mt-1 text-[0.65rem] text-white/50">
                          {role.description}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white/90 py-3 text-sm font-medium text-black transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating your workspace...
                    </>
                  ) : (
                    <>
                      Launch workspace
                      <Sparkles className="h-4 w-4 text-black/70" />
                    </>
                  )}
                </button>
              </form>

              <p className="text-center text-sm text-white/60">
                Already have access?{" "}
                <Link
                  href="/signin"
                  className="text-white underline-offset-4 hover:underline"
                >
                  Sign in instead
                </Link>
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}


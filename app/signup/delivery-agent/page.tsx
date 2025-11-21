"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signupUser } from "@/app/lib/auth/signup";

export default function SignupDeliveryAgent() {
  const router = useRouter();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);

    try {
      await signupUser(
        form.username,
        form.email,
        form.password,
        "Delivery"
      );

      router.push("/signin");
    } catch (e) {
      console.error(e);
      alert("Signup failed");
    }

    setLoading(false);
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Delivery Agent Signup</h1>

      <input
        className="border p-2 w-full mb-2"
        placeholder="Username"
        value={form.username}
        onChange={e => setForm({ ...form, username: e.target.value })}
      />

      <input
        className="border p-2 w-full mb-2"
        placeholder="Email"
        type="email"
        value={form.email}
        onChange={e => setForm({ ...form, email: e.target.value })}
      />

      <input
        className="border p-2 w-full mb-4"
        placeholder="Password"
        type="password"
        value={form.password}
        onChange={e => setForm({ ...form, password: e.target.value })}
      />

      <button
        onClick={submit}
        disabled={loading}
        className="bg-green-600 text-white py-2 w-full rounded"
      >
        {loading ? "Creating..." : "Sign Up"}
      </button>
    </div>
  );
}

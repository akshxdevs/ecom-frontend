"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "@/app/lib/auth/login";

export default function DeliveryAgentSignin() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);

    const res = await loginUser(form.email, form.password, "delivery-agent");

    if (res?.ok) {
      router.push("/delivery-agent/dashboard");
    } else {
      alert("Invalid credentials for delivery agent");
    }

    setLoading(false);
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Delivery Agent Login</h1>

      <input
        className="border p-2 w-full mb-2"
        type="email"
        placeholder="Email"
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />

      <input
        className="border p-2 w-full mb-4"
        type="password"
        placeholder="Password"
        onChange={(e) => setForm({ ...form, password: e.target.value })}
      />

      <button
        onClick={submit}
        disabled={loading}
        className="bg-green-600 text-white py-2 w-full rounded"
      >
        {loading ? "Signing in..." : "Login"}
      </button>
    </div>
  );
}

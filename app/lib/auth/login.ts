"use client";

import { signIn } from "next-auth/react";

type LoginUserOptions = {
  email: string;
  password: string;
  role?: string;
  callbackUrl?: string;
};

const buildOptions = (
  emailOrOptions: string | LoginUserOptions,
  password?: string,
  role?: string
): LoginUserOptions => {
  if (typeof emailOrOptions === "string") {
    if (!password) {
      throw new Error("Password is required when using positional arguments.");
    }

    return {
      email: emailOrOptions,
      password,
      role,
    };
  }

  return emailOrOptions;
};

export async function loginUser(
  emailOrOptions: string | LoginUserOptions,
  password?: string,
  role?: string
) {
  const options = buildOptions(emailOrOptions, password, role);

  const result = await signIn("credentials", {
    email: options.email,
    password: options.password,
    role: options.role ?? "Customer",
    redirect: false,
    callbackUrl: options.callbackUrl ?? "/",
  });

  return result;
}

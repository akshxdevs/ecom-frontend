import axios from "axios";
import { RUST_API } from "@/app/config";

const api = axios.create({
  baseURL: RUST_API,
  headers: { "Content-Type": "application/json" },
});

const roleMap: Record<string, "Customer" | "Seller" | "Delivery"> = {
  customer: "Customer",
  user: "Customer",
  buyer: "Customer",
  seller: "Seller",
  merchant: "Seller",
  "delivery-agent": "Delivery",
  delivery: "Delivery",
};

const normalizeRole = (role?: string) => {
  if (!role) return "Customer";
  return roleMap[role.toLowerCase()] ?? "Customer";
};

export interface SignupResponse {
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
    role: string;
  };
}

export async function signupUser(
  username: string,
  email: string,
  password: string,
  role?: string
) {
  const payload = {
    username,
    email,
    password,
    role: normalizeRole(role),
  };

  const { data } = await api.post<SignupResponse>("/signup", payload);

  return data;
}

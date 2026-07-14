import type { Metadata } from "next";
import { UpdatePasswordForm } from "@/components/UpdatePasswordForm";

export const metadata: Metadata = { title: "New password" };

export default function UpdatePasswordPage() {
  return <UpdatePasswordForm />;
}

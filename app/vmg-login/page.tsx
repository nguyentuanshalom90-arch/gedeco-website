import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/app/dashboard/LoginForm";
import { getDashboardSession } from "@/lib/dashboard/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Đăng nhập quản trị",
  robots: { index: false, follow: false },
};

export default async function DashboardLoginPage() {
  if (await getDashboardSession()) redirect("/dashboard");
  return <LoginForm />;
}

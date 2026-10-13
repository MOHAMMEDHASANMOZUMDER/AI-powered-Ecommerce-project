import { redirect } from "next/navigation";
import { verifyAdmin } from "@/app/api/auth/admin-helper";
import AdminDashboard from "./AdminDashboard";

export default async function AdminPage() {
  if (!(await verifyAdmin())) redirect("/admin/login");
  return <AdminDashboard />;
}

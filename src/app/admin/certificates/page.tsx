import { redirect } from "next/navigation";

export default function AdminCertListPage() {
  redirect("/admin/dashboard?tab=certificates");
}

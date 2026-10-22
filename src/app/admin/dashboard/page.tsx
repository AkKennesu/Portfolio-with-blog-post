import { getSession } from "@/actions/admin";
import { redirect } from "next/navigation";
import { AdminRepository } from "@/repositories/admin.repo";
import UnifiedAdminConsole, { type AdminTab } from "@/components/admin/UnifiedAdminConsole";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ tab?: string }>;
}) {
  const session = await getSession();
  if (!session) {
    redirect("/admin/login");
  }

  const resolvedParams = searchParams ? await searchParams : {};
  const validTabs: AdminTab[] = ["overview", "settings", "blog", "certificates", "messages"];
  const currentTab: AdminTab = validTabs.includes(resolvedParams.tab as AdminTab)
    ? (resolvedParams.tab as AdminTab)
    : "overview";

  // Single ultra-fast round-trip for entire admin dashboard suite
  const data = await AdminRepository.getUnifiedData();

  return <UnifiedAdminConsole initialData={data} initialTab={currentTab} />;
}

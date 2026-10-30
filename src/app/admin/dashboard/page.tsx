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
  // Execute session check, searchParams resolution, and unified data fetch concurrently
  const [session, resolvedParams, data] = await Promise.all([
    getSession(),
    searchParams ? searchParams : Promise.resolve({} as { tab?: string }),
    AdminRepository.getUnifiedData(),
  ]);

  if (!session) {
    redirect("/admin/login");
  }

  const validTabs: AdminTab[] = ["overview", "settings", "blog", "certificates", "messages"];
  const currentTab: AdminTab = validTabs.includes(resolvedParams.tab as AdminTab)
    ? (resolvedParams.tab as AdminTab)
    : "overview";

  return <UnifiedAdminConsole initialData={data} initialTab={currentTab} />;
}

import { unstable_noStore as noStore } from "next/cache"
import { getCertificates } from "@/lib/certificates"
import { getSession } from "@/actions/admin"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Plus, Edit, Image as ImageIcon, Database } from "lucide-react"
import { deleteCertificate } from "@/actions/certificates"
import { checkTablesExist } from "@/lib/db"
import CertListClient from "@/components/admin/CertListClient"

export default async function AdminCertListPage() {
    noStore()
    const session = await getSession()
    if (!session) redirect("/admin/login")

    const tablesExist = await checkTablesExist()

    if (!tablesExist) {
        return (
            <div className="p-8 max-w-2xl mx-auto text-center mt-12">
                <div className="bg-amber-500/10 p-12 rounded-2xl border border-amber-500/20 flex flex-col items-center gap-6">
                    <Database className="h-12 w-12 text-amber-500" />
                    <h2 className="text-2xl font-bold">Database Not Initialized</h2>
                    <p className="text-muted-foreground">
                        Your database tables haven&apos;t been created yet. Please go to the dashboard to initialize your database.
                    </p>
                    <Link
                        href="/admin/dashboard"
                        className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium hover:bg-primary/90 transition-all"
                    >
                        Go to Dashboard
                    </Link>
                </div>
            </div>
        )
    }

    const certs = await getCertificates()

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight">Certificates</h1>
                    <p className="text-sm text-muted-foreground">Manage your credentials and professional honors.</p>
                </div>
                <Link
                    href="/admin/certificates/new"
                    className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                >
                    <Plus className="h-4 w-4" />
                    Add Certificate
                </Link>
            </div>

            <CertListClient certs={certs} />
        </div>
    )
}

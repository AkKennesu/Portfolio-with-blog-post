import { getSession } from "@/actions/admin"
import { redirect } from "next/navigation"
import { CertificateForm } from "@/components/admin/CertificateForm"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function NewCertPage() {
    const session = await getSession()
    if (!session) redirect("/admin/login")

    return (
        <div className="p-8">
            <div className="mb-8">
                <Link
                    href="/admin/dashboard?tab=certificates"
                    className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors mb-4"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to List
                </Link>
                <h1 className="text-3xl font-bold">Add New Certificate</h1>
            </div>

            <div className="bg-card rounded-xl border border-border p-8 shadow-sm">
                <CertificateForm />
            </div>
        </div>
    )
}

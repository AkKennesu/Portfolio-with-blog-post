import { getCertificate } from "@/lib/certificates"
import { getSession } from "@/actions/admin"
import { redirect, notFound } from "next/navigation"
import { CertificateForm } from "@/components/admin/CertificateForm"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function EditCertPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const session = await getSession()
    if (!session) redirect("/admin/login")

    const { id } = await params
    const cert = await getCertificate(parseInt(id))

    if (!cert) {
        notFound()
    }

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
                <h1 className="text-3xl font-bold">Edit Certificate</h1>
                <p className="text-muted-foreground mt-1">Editing: {cert.title}</p>
            </div>

            <div className="bg-card rounded-xl border border-border p-8 shadow-sm">
                <CertificateForm certificate={cert} />
            </div>
        </div>
    )
}

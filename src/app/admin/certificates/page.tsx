import { getCertificates } from "@/lib/certificates"
import { getSession } from "@/actions/admin"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Plus, Edit, Trash2, Image as ImageIcon, Database } from "lucide-react"
import { deleteCertificate } from "@/actions/certificates"
import { checkTablesExist } from "@/lib/db"
import DeleteButton from "@/components/admin/DeleteButton"

export default async function AdminCertListPage() {
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
                <h1 className="text-3xl font-bold">Manage Certificates</h1>
                <Link
                    href="/admin/certificates/new"
                    className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                >
                    <Plus className="h-4 w-4" />
                    Add Certificate
                </Link>
            </div>

            <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-muted/50 border-b border-border">
                            <th className="px-6 py-4 font-semibold text-sm w-20">Preview</th>
                            <th className="px-6 py-4 font-semibold text-sm">Title</th>
                            <th className="px-6 py-4 font-semibold text-sm">Year</th>
                            <th className="px-6 py-4 font-semibold text-sm">Subtitle</th>
                            <th className="px-6 py-4 font-semibold text-sm text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {certs.map((cert) => (
                            <tr key={cert.id || cert.title} className="hover:bg-muted/30 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="h-10 w-10 rounded-md bg-muted overflow-hidden">
                                        {cert.image ? (
                                            <img src={cert.image} alt={cert.title} className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center">
                                                <ImageIcon className="h-4 w-4 text-muted-foreground" />
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm font-medium">{cert.title}</td>
                                <td className="px-6 py-4 text-sm text-muted-foreground">{cert.year}</td>
                                <td className="px-6 py-4 text-sm text-muted-foreground">{cert.subtitle}</td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <Link
                                            href={`/admin/certificates/edit/${cert.id}`}
                                            className="p-2 text-muted-foreground hover:text-primary transition-colors"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Link>
                                        <DeleteButton
                                            action={deleteCertificate}
                                            id={cert.id!}
                                            confirmMessage={`Are you sure you want to delete the certificate "${cert.title}"?`}
                                        />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

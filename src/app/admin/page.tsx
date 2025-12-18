import { getSession } from "@/actions/admin"
import { redirect } from "next/navigation"

export default async function AdminPage() {
    const session = await getSession()
    if (!session) {
        redirect("/admin/login")
    } else {
        redirect("/admin/dashboard")
    }
}

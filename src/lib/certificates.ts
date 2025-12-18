import { sql } from "./db"
import { achievementItems as fallbackCertificates } from "./data"

export type Certificate = {
    id?: number;
    year: string;
    title: string;
    subtitle: string;
    description: string;
    image: string;
};

export async function getCertificates(): Promise<Certificate[]> {
    try {
        if (!process.env.POSTGRES_URL) {
            return fallbackCertificates as Certificate[];
        }
        const { rows } = await sql`SELECT * FROM certificates ORDER BY year DESC, created_at DESC`
        if (rows.length > 0) return rows as unknown as Certificate[]
    } catch (error) {
        console.error("Failed to fetch certificates from DB, using fallback data", error)
    }
    return fallbackCertificates as Certificate[];
}

export async function getCertificate(id: number): Promise<Certificate | undefined> {
    try {
        if (!process.env.POSTGRES_URL) {
            return undefined;
        }
        const { rows } = await sql`SELECT * FROM certificates WHERE id = ${id}`
        if (rows.length > 0) return rows[0] as unknown as Certificate
    } catch (error) {
        console.error(`Failed to fetch certificate ${id} from DB`, error)
    }
    return undefined;
}

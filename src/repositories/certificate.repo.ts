import { dbQuery } from "@/lib/db";
import { achievementItems as fallbackCertificates } from "@/lib/data";

export interface CertificateItem {
  id: number;
  year: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
}

export class CertificateRepository {
  static async findAll(): Promise<CertificateItem[]> {
    if (!process.env.POSTGRES_URL) {
      return fallbackCertificates as CertificateItem[];
    }

    try {
      const { rows } = await dbQuery`
        SELECT id, year::text, title, subtitle, description, image
        FROM certificates
        ORDER BY year DESC, created_at DESC
      `;
      return rows as unknown as CertificateItem[];
    } catch (error) {
      console.error("Database query failed in CertificateRepository.findAll:", error);
      return fallbackCertificates as CertificateItem[];
    }
  }

  static async findById(id: number): Promise<CertificateItem | undefined> {
    if (!process.env.POSTGRES_URL) return undefined;
    try {
      const { rows } = await dbQuery`
        SELECT id, year::text, title, subtitle, description, image
        FROM certificates
        WHERE id = ${id}
        LIMIT 1
      `;
      if (rows.length > 0) return rows[0] as unknown as CertificateItem;
    } catch (error) {
      console.error(`Database query failed in CertificateRepository.findById (${id}):`, error);
    }
    return undefined;
  }

  static async create(data: {
    year: number | string;
    title: string;
    subtitle: string;
    description: string;
    image: string;
  }): Promise<{ id: number }> {
    const yearNum = typeof data.year === "string" ? parseInt(data.year, 10) : data.year;
    const { rows } = await dbQuery`
      INSERT INTO certificates (year, title, subtitle, description, image)
      VALUES (${yearNum}, ${data.title}, ${data.subtitle}, ${data.description}, ${data.image})
      RETURNING id
    `;
    return { id: Number(rows[0].id) };
  }

  static async update(
    id: number,
    data: {
      year: number | string;
      title: string;
      subtitle: string;
      description: string;
      image: string;
    }
  ): Promise<void> {
    const yearNum = typeof data.year === "string" ? parseInt(data.year, 10) : data.year;
    await dbQuery`
      UPDATE certificates
      SET 
        year = ${yearNum},
        title = ${data.title},
        subtitle = ${data.subtitle},
        description = ${data.description},
        image = ${data.image}
      WHERE id = ${id}
    `;
  }

  static async delete(id: number): Promise<void> {
    await dbQuery`DELETE FROM certificates WHERE id = ${id}`;
  }

  /**
   * Batch deletion using ANY(${ids})
   */
  static async deleteMany(ids: number[]): Promise<void> {
    if (!ids || ids.length === 0) return;
    await dbQuery`DELETE FROM certificates WHERE id = ANY(${ids}::bigint[])`;
  }

  /**
   * Atomic batch sync for certificates using ON CONFLICT (title, year) DO NOTHING
   */
  static async syncStaticCertificates(
    items: Array<{ year: string; title: string; subtitle: string; description: string; image: string }>
  ): Promise<void> {
    for (const item of items) {
      const yearNum = parseInt(item.year, 10) || new Date().getFullYear();
      await dbQuery`
        INSERT INTO certificates (year, title, subtitle, description, image)
        VALUES (${yearNum}, ${item.title}, ${item.subtitle}, ${item.description}, ${item.image})
        ON CONFLICT (title, year) DO NOTHING
      `;
    }
  }
}

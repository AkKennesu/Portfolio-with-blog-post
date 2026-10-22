import { dbQuery } from "@/lib/db";

export interface MessageItem {
  id: number;
  name: string;
  email: string;
  message: string;
  is_read: boolean;
  is_important: boolean;
  created_at: string;
}

export class MessageRepository {
  static async findAll(): Promise<MessageItem[]> {
    if (!process.env.POSTGRES_URL) return [];
    try {
      const { rows } = await dbQuery`
        SELECT 
          id, 
          name, 
          email, 
          message, 
          is_read, 
          is_important, 
          to_char(created_at, 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as created_at
        FROM messages 
        ORDER BY created_at DESC
      `;
      return rows as unknown as MessageItem[];
    } catch (error) {
      console.error("Database query failed in MessageRepository.findAll:", error);
      return [];
    }
  }

  /**
   * Fast count leveraging partial index: CREATE INDEX idx_messages_unread ON messages ... WHERE is_read = false
   */
  static async countUnread(): Promise<number> {
    if (!process.env.POSTGRES_URL) return 0;
    try {
      const { rows } = await dbQuery`
        SELECT count(*) as count 
        FROM messages 
        WHERE is_read = false
      `;
      return Number(rows[0]?.count || 0);
    } catch {
      return 0;
    }
  }

  static async create(data: { name: string; email: string; message: string }): Promise<{ id: number }> {
    const { rows } = await dbQuery`
      INSERT INTO messages (name, email, message)
      VALUES (${data.name}, ${data.email}, ${data.message})
      RETURNING id
    `;
    return { id: Number(rows[0].id) };
  }

  static async toggleRead(id: number, status: boolean): Promise<void> {
    await dbQuery`
      UPDATE messages 
      SET is_read = ${status} 
      WHERE id = ${id}
    `;
  }

  static async toggleImportant(id: number, status: boolean): Promise<void> {
    await dbQuery`
      UPDATE messages 
      SET is_important = ${status} 
      WHERE id = ${id}
    `;
  }

  static async delete(id: number): Promise<void> {
    await dbQuery`DELETE FROM messages WHERE id = ${id}`;
  }

  /**
   * Single round-trip batch delete using ANY()
   */
  static async deleteMany(ids: number[]): Promise<void> {
    if (!ids || ids.length === 0) return;
    await dbQuery`DELETE FROM messages WHERE id = ANY(${ids}::bigint[])`;
  }
}

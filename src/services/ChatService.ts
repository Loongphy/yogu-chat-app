import Database from '@tauri-apps/plugin-sql';
import camelize from '../utils/camelize';

export interface Chat {
  id: string;
  title: string;
  modelIdentifier: string;
  createdAt?: string;
  updatedAt?: string;
}

export class ChatService {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  async createChat(chat: Chat): Promise<string> {
    await this.db.execute(
      'INSERT INTO chats (id, title, model_identifier) VALUES ($1, $2, $3)',
      [chat.id, chat.title, chat.modelIdentifier]
    );
    return chat.id;
  }

  async getChat(id: string): Promise<Chat | null> {
    const chats = await this.db.select<Record<string, any>[]>('SELECT * FROM chats WHERE id = $1', [id]);
    return chats.length > 0 ? camelize<Chat>(chats[0]) : null;
  }

  async getAllChats(): Promise<Chat[]> {
    const chats = await this.db.select<Record<string, any>[]>('SELECT * FROM chats ORDER BY updated_at DESC');
    return camelize<Chat[]>(chats);
  }

  async updateChat(id: string, chat: Partial<Chat>): Promise<void> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (chat.title !== undefined) {
      updates.push(`title = $${paramIndex}`);
      values.push(chat.title);
      paramIndex++;
    }

    if (chat.modelIdentifier !== undefined) {
      updates.push(`model_identifier = $${paramIndex}`);
      values.push(chat.modelIdentifier);
      paramIndex++;
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    await this.db.execute(
      `UPDATE chats SET ${updates.join(', ')} WHERE id = $${paramIndex}`,
      values
    );
  }

  async deleteChat(id: string): Promise<void> {
    await this.db.execute('DELETE FROM chats WHERE id = $1', [id]);
  }
}

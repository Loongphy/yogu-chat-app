import Database from '@tauri-apps/plugin-sql';
import camelize from '../utils/camelize';

export interface MessageFile {
  id: string;
  path: string;
}

export interface Message {
  id?: string;
  chatId: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  files?: MessageFile[];
  createdAt?: string;
  updatedAt?: string;
}

export class MessageService {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  // 将 Message 对象转换为数据库存储格式
  private toDbMessage(message: Message): any {
    return {
      id: message.id,
      chat_id: message.chatId,
      role: message.role,
      content: message.content,
      files: message.files ? JSON.stringify(message.files) : null,
      created_at: message.createdAt,
      updated_at: message.updatedAt
    };
  }

  // 将数据库记录转换为 Message 对象
  private fromDbMessage(record: Record<string, any>): Message {
    const message = camelize<Message>(record);
    
    // 解析 files 字段
    if (message.files && typeof message.files === 'string') {
      try {
        message.files = JSON.parse(message.files) as MessageFile[];
      } catch (e) {
        console.error('解析消息文件失败:', e);
        message.files = undefined;
      }
    }
    
    return message;
  }

  async createMessage(message: Message): Promise<string> {
    const dbMessage = this.toDbMessage(message);
    await this.db.execute(
      'INSERT INTO messages (id, chat_id, role, content, files, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, datetime("now"), datetime("now")) RETURNING id',
      [dbMessage.id, dbMessage.chat_id, dbMessage.role, dbMessage.content, dbMessage.files]
    );
    return message.id ?? '';
  }

  async getMessagesByChat(chatId: string): Promise<Message[]> {
    const messages = await this.db.select<Record<string, any>[]>(
      'SELECT id, chat_id, role, content, files, created_at, updated_at FROM messages WHERE chat_id = $1 ORDER BY created_at ASC',
      [chatId]
    );
    return messages.map(record => this.fromDbMessage(record));
  }

  async getMessage(id: string): Promise<Message | null> {
    const messages = await this.db.select<Record<string, any>[]>(
      'SELECT * FROM messages WHERE id = $1',
      [id]
    );
    return messages.length > 0 ? this.fromDbMessage(messages[0]) : null;
  }

  async deleteMessage(id: string): Promise<void> {
    await this.db.execute('DELETE FROM messages WHERE id = $1', [id]);
  }

  async deleteMessagesByChatId(chatId: string): Promise<void> {
    await this.db.execute('DELETE FROM messages WHERE chat_id = $1', [chatId]);
  }
}

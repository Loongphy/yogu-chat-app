import Database from '@tauri-apps/plugin-sql';
import camelize from '../utils/camelize';
import { UnifiedSearchResult } from '../composables/useSearch';
import { nanoid } from 'nanoid/non-secure';

export interface WebSearchResult {
  id?: string;
  messageId: string;
  title?: string;
  url?: string;
  publishedDate?: string;
  author?: string;
  score?: number;
  image?: string;
  favicon?: string;
  text?: string;
  createdAt?: string;
  updatedAt?: string;
}

export class WebSearchResultService {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  async createWebSearchResult(webSearchResult: { id: string, messageId: string, content: WebSearchResult[] }): Promise<string[]> {
    const resultIds: string[] = [];
    
    // 为每个搜索结果创建一条记录
    for (const result of webSearchResult.content) {
      const resultId = nanoid();
      await this.db.execute(
        'INSERT INTO web_search_results (id, message_id, title, url, published_date, author, score, image, favicon, text, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, datetime("now"), datetime("now"))',
        [
          resultId,
          webSearchResult.messageId,
          result.title || null,
          result.url || null,
          result.publishedDate || null,
          result.author || null,
          result.score || null,
          result.image || null,
          result.favicon || null,
          result.text || null
        ]
      );
      resultIds.push(resultId);
    }
    
    return resultIds;
  }

  async getWebSearchResultByMessageId(messageId: string): Promise<UnifiedSearchResult[]> {
    const results = await this.db.select<Record<string, any>[]>(
      'SELECT id, message_id, title, url, published_date, author, score, image, favicon, text, created_at, updated_at FROM web_search_results WHERE message_id = $1',
      [messageId]
    );
    
    if (results.length === 0) return [];
    
    return results.map(result => {
      const camelizedResult = camelize<any>(result);
      return {
        title: camelizedResult.title,
        url: camelizedResult.url,
        publishedDate: camelizedResult.publishedDate,
        author: camelizedResult.author,
        score: camelizedResult.score,
        image: camelizedResult.image,
        favicon: camelizedResult.favicon,
        text: camelizedResult.text
      } as UnifiedSearchResult;
    });
  }
    
  async mapWebSearchResultsByMessageIds(messageIds: string[]): Promise<{ [key: string]: WebSearchResult[] }> {
    if (messageIds.length === 0) return {};
    
    // 修复SQL IN子句的语法
    const placeholders = messageIds.map((_, index) => `$${index + 1}`).join(',');
    const results = await this.db.select<Record<string, any>[]>(
      `SELECT id, message_id, title, url, published_date, author, score, image, favicon, text, created_at, updated_at FROM web_search_results WHERE message_id IN (${placeholders})`,
      messageIds
    );
    console.log(results);
    // 按消息 ID 分组结果
    const groupedResults: { [key: string]: WebSearchResult[] } = {};
    
    results.forEach(result => {
      const camelizedResult = camelize<any>(result);
      const messageId = camelizedResult.messageId;
      
      if (!groupedResults[messageId]) {
        groupedResults[messageId] = [];
      }
      
      groupedResults[messageId].push({
        id: camelizedResult.id,
        messageId: camelizedResult.messageId,
        title: camelizedResult.title,
        url: camelizedResult.url,
        publishedDate: camelizedResult.publishedDate,
        author: camelizedResult.author,
        score: camelizedResult.score,
        image: camelizedResult.image,
        favicon: camelizedResult.favicon,
        text: camelizedResult.text,
        createdAt: camelizedResult.createdAt,
        updatedAt: camelizedResult.updatedAt
      } as WebSearchResult);
    });
    console.log(groupedResults);
    
    return groupedResults;
  }

  async updateWebSearchResults(messageId: string, content: WebSearchResult[]): Promise<void> {
    // 先删除该消息的所有搜索结果
    await this.deleteWebSearchResultsByMessageId(messageId);
    
    // 然后添加新的搜索结果
    await this.createWebSearchResult({
      id: nanoid(),
      messageId,
      content
    });
  }

  async deleteWebSearchResult(id: string): Promise<void> {
    await this.db.execute('DELETE FROM web_search_results WHERE id = $1', [id]);
  }

  async deleteWebSearchResultsByMessageId(messageId: string): Promise<void> {
    await this.db.execute('DELETE FROM web_search_results WHERE message_id = $1', [messageId]);
  }
}
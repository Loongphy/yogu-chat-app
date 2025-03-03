import Database from '@tauri-apps/plugin-sql';
import camelize from '../utils/camelize';

export interface Provider {
  id: string;
  name: string;
  protocol?: string;
  apiKey?: string;
  baseUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export class ProviderService {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  async createProvider(provider: Provider): Promise<string> {
    await this.db.execute(
      'INSERT INTO providers (id, name, protocol, api_key, base_url) VALUES ($1, $2, $3, $4, $5)',
      [provider.id, provider.name, provider.protocol, provider.apiKey, provider.baseUrl]
    );
    return provider.id;
  }

  async getProvider(id: string): Promise<Provider | null> {
    const providers = await this.db.select<Record<string, any>[]>('SELECT * FROM providers WHERE id = $1', [id]);
    return providers.length > 0 ? camelize<Provider>(providers[0]) : null;
  }

  async getAllProviders(): Promise<Provider[]> {
    const providers = await this.db.select<Record<string, any>[]>('SELECT * FROM providers ORDER BY updated_at DESC');
    return camelize<Provider[]>(providers);
  }

  async updateProvider(id: string, provider: Partial<Provider>): Promise<void> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (provider.name !== undefined) {
      updates.push(`name = $${paramIndex}`);
      values.push(provider.name);
      paramIndex++;
    }

    if (provider.protocol !== undefined) {
      updates.push(`protocol = $${paramIndex}`);
      values.push(provider.protocol);
      paramIndex++;
    }

    if (provider.apiKey !== undefined) {
      updates.push(`api_key = $${paramIndex}`);
      values.push(provider.apiKey);
      paramIndex++;
    }

    if (provider.baseUrl !== undefined) {
      updates.push(`base_url = $${paramIndex}`);
      values.push(provider.baseUrl);
      paramIndex++;
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    await this.db.execute(
      `UPDATE providers SET ${updates.join(', ')} WHERE id = $${paramIndex}`,
      values
    );
  }

  async deleteProvider(id: string): Promise<void> {
    await this.db.execute('DELETE FROM providers WHERE id = $1', [id]);
  }
} 
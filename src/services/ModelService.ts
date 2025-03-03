import Database from '@tauri-apps/plugin-sql';
import camelize from '../utils/camelize';

// 模型状态枚举
export enum ModelStatus {
  Inactive = 0,
  Active = 1,
  Deprecated = 2
}

export interface Model {
  id: string;
  identifier: string;
  name: string;
  status?: ModelStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface ModelProvider {
  id: string;
  modelId: string;
  providerId: string;
  createdAt?: string;
  updatedAt?: string;
}

export class ModelService {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  async createModel(model: Model): Promise<string> {
    await this.db.execute(
      'INSERT INTO models (id, identifier, name, status) VALUES ($1, $2, $3, $4)',
      [model.id, model.identifier, model.name, model.status !== undefined ? model.status : ModelStatus.Active]
    );
    return model.id;
  }

  async getModel(id: string): Promise<Model | null> {
    const models = await this.db.select<Record<string, any>[]>('SELECT * FROM models WHERE id = $1', [id]);
    return models.length > 0 ? camelize<Model>(models[0]) : null;
  }

  async getAllModels(): Promise<Model[]> {
    const models = await this.db.select<Record<string, any>[]>('SELECT * FROM models ORDER BY updated_at DESC');
    return camelize<Model[]>(models);
  }

  async updateModel(id: string, model: Partial<Model>): Promise<void> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (model.identifier !== undefined) {
      updates.push(`identifier = $${paramIndex}`);
      values.push(model.identifier);
      paramIndex++;
    }

    if (model.name !== undefined) {
      updates.push(`name = $${paramIndex}`);
      values.push(model.name);
      paramIndex++;
    }
    
    if (model.status !== undefined) {
      updates.push(`status = $${paramIndex}`);
      values.push(model.status);
      paramIndex++;
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    await this.db.execute(
      `UPDATE models SET ${updates.join(', ')} WHERE id = $${paramIndex}`,
      values
    );
  }

  async deleteModel(id: string): Promise<void> {
    await this.db.execute('DELETE FROM models WHERE id = $1', [id]);
  }

  // 模型与提供商关联的方法
  async linkModelToProvider(modelProvider: ModelProvider): Promise<string> {
    await this.db.execute(
      'INSERT INTO model_provider (id, model_id, provider_id) VALUES ($1, $2, $3)',
      [modelProvider.id, modelProvider.modelId, modelProvider.providerId]
    );
    return modelProvider.id;
  }

  async getModelProviders(modelId: string): Promise<ModelProvider[]> {
    const modelProviders = await this.db.select<Record<string, any>[]>(
      'SELECT * FROM model_provider WHERE model_id = $1',
      [modelId]
    );
    return camelize<ModelProvider[]>(modelProviders);
  }

  async getProviderModels(providerId: string): Promise<ModelProvider[]> {
    const modelProviders = await this.db.select<Record<string, any>[]>(
      'SELECT * FROM model_provider WHERE provider_id = $1',
      [providerId]
    );
    return camelize<ModelProvider[]>(modelProviders);
  }

  async unlinkModelFromProvider(id: string): Promise<void> {
    await this.db.execute('DELETE FROM model_provider WHERE id = $1', [id]);
  }

  // 获取活跃状态的模型
  async getActiveModels(): Promise<Model[]> {
    const models = await this.db.select<Record<string, any>[]>(
      'SELECT * FROM models WHERE status = $1 ORDER BY updated_at DESC',
      [ModelStatus.Active]
    );
    return camelize<Model[]>(models);
  }

  // 更新模型状态
  async updateModelStatus(id: string, status: ModelStatus): Promise<void> {
    await this.db.execute(
      'UPDATE models SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [status, id]
    );
  }
} 
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { nanoid } from 'nanoid/non-secure';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { ModelService, Model, ModelProvider, ModelStatus } from '../services/ModelService';
import Database from '@tauri-apps/plugin-sql';
import { settingsService } from '../services/SettingsService';

export const useModelStore = defineStore("models", () => {
  const models = ref<Model[]>([]);
  const modelProviders = ref<ModelProvider[]>([]);
  const selectedModelIdentifier = ref<string | null>(null);
  const modelService = ref<ModelService | null>(null);
  const isLoading = ref<boolean>(false);
  const error = ref<string | null>(null);

  // 初始化服务
  const initService = async (db: Database) => {
    modelService.value = new ModelService(db);
    await loadModels();
    await loadAllModelProviders();
    await loadSavedModelIdentifier();
  };

  // 加载保存的模型标识符
  const loadSavedModelIdentifier = async () => {
    try {
      const savedModelIdentifier = await settingsService.get<string>('selectedModelIdentifier');
      if (savedModelIdentifier) {
        selectedModelIdentifier.value = savedModelIdentifier;
      }
    } catch (err) {
      console.error('加载保存的模型标识符失败:', err);
    }
  };

  // 加载所有模型
  const loadModels = async () => {
    if (!modelService.value) return;
    
    isLoading.value = true;
    error.value = null;
    
    try {
      const dbModels = await modelService.value.getAllModels();
      models.value = dbModels;
    } catch (err) {
      error.value = err instanceof Error ? err.message : '加载模型失败';
      console.error('加载模型失败:', err);
    } finally {
      isLoading.value = false;
    }
  };

  // 加载所有活跃模型
  const loadActiveModels = async () => {
    if (!modelService.value) return;
    
    isLoading.value = true;
    error.value = null;
    
    try {
      const dbModels = await modelService.value.getActiveModels();
      models.value = dbModels;
    } catch (err) {
      error.value = err instanceof Error ? err.message : '加载活跃模型失败';
      console.error('加载活跃模型失败:', err);
    } finally {
      isLoading.value = false;
    }
  };

  // 加载所有模型-提供商关联
  const loadAllModelProviders = async () => {
    if (!modelService.value || models.value.length === 0) return;
    
    isLoading.value = true;
    error.value = null;
    
    try {
      const allModelProviders: ModelProvider[] = [];
      
      for (const model of models.value) {
        const providers = await modelService.value.getModelProviders(model.id);
        allModelProviders.push(...providers);
      }
      
      modelProviders.value = allModelProviders;
    } catch (err) {
      error.value = err instanceof Error ? err.message : '加载模型提供商关联失败';
      console.error('加载模型提供商关联失败:', err);
    } finally {
      isLoading.value = false;
    }
  };

  // 更新模型状态
  const updateModelStatus = async (id: string, status: ModelStatus) => {
    if (!modelService.value) return false;
    
    isLoading.value = true;
    error.value = null;
    
    try {
      await modelService.value.updateModelStatus(id, status);
      
      const index = models.value.findIndex(model => model.id === id);
      if (index !== -1) {
        models.value[index] = {
          ...models.value[index],
          status,
          updatedAt: format(new Date(), 'yyyy-MM-dd HH:mm:ss', { locale: zhCN })
        };
      }
      
      return true;
    } catch (err) {
      error.value = err instanceof Error ? err.message : '更新模型状态失败';
      console.error('更新模型状态失败:', err);
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  // 添加模型
  const addModel = async (identifier: string, name: string, status: ModelStatus = ModelStatus.Active) => {
    if (!modelService.value) return null;
    
    isLoading.value = true;
    error.value = null;
    
    try {
      const modelId = nanoid();
      const newModel: Model = {
        id: modelId,
        identifier,
        name,
        status,
        createdAt: format(new Date(), 'yyyy-MM-dd HH:mm:ss', { locale: zhCN }),
        updatedAt: format(new Date(), 'yyyy-MM-dd HH:mm:ss', { locale: zhCN })
      };
      
      await modelService.value.createModel(newModel);
      models.value.unshift(newModel);
      return modelId;
    } catch (err) {
      error.value = err instanceof Error ? err.message : '添加模型失败';
      console.error('添加模型失败:', err);
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  // 更新模型
  const updateModel = async (id: string, updates: Partial<Model>) => {
    if (!modelService.value) return false;
    
    isLoading.value = true;
    error.value = null;
    
    try {
      await modelService.value.updateModel(id, updates);
      
      const index = models.value.findIndex(model => model.id === id);
      if (index !== -1) {
        models.value[index] = {
          ...models.value[index],
          ...updates,
          updatedAt: format(new Date(), 'yyyy-MM-dd HH:mm:ss', { locale: zhCN })
        };
      }
      
      return true;
    } catch (err) {
      error.value = err instanceof Error ? err.message : '更新模型失败';
      console.error('更新模型失败:', err);
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  // 删除模型
  const deleteModel = async (id: string) => {
    if (!modelService.value) return false;
    
    isLoading.value = true;
    error.value = null;
    
    try {
      // 在删除前先获取模型信息
      const modelToDelete = models.value.find(model => model.id === id);
      
      await modelService.value.deleteModel(id);
      
      const index = models.value.findIndex(model => model.id === id);
      if (index !== -1) {
        models.value.splice(index, 1);
      }
      
      // 删除相关的模型-提供商关联
      modelProviders.value = modelProviders.value.filter(mp => mp.modelId !== id);
      
      // 如果删除的是当前选中的模型，将 selectedModelIdentifier 设置为 null
      if (modelToDelete && selectedModelIdentifier.value === modelToDelete.identifier) {
        selectedModelIdentifier.value = null;
        // 同时更新保存的设置
        await settingsService.set('selectedModelIdentifier', null);
      }
      
      return true;
    } catch (err) {
      error.value = err instanceof Error ? err.message : '删除模型失败';
      console.error('删除模型失败:', err);
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  // 关联模型到提供商
  const linkModelToProvider = async (modelId: string, providerId: string) => {
    if (!modelService.value) return null;
    
    isLoading.value = true;
    error.value = null;
    
    try {
      const linkId = nanoid();
      const modelProvider: ModelProvider = {
        id: linkId,
        modelId,
        providerId,
        createdAt: format(new Date(), 'yyyy-MM-dd HH:mm:ss', { locale: zhCN }),
        updatedAt: format(new Date(), 'yyyy-MM-dd HH:mm:ss', { locale: zhCN })
      };
      
      await modelService.value.linkModelToProvider(modelProvider);
      modelProviders.value.push(modelProvider);
      return linkId;
    } catch (err) {
      error.value = err instanceof Error ? err.message : '关联模型到提供商失败';
      console.error('关联模型到提供商失败:', err);
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  // 解除模型与提供商的关联
  const unlinkModelFromProvider = async (linkId: string) => {
    if (!modelService.value) return false;
    
    isLoading.value = true;
    error.value = null;
    
    try {
      await modelService.value.unlinkModelFromProvider(linkId);
      
      const index = modelProviders.value.findIndex(mp => mp.id === linkId);
      if (index !== -1) {
        modelProviders.value.splice(index, 1);
      }
      
      return true;
    } catch (err) {
      error.value = err instanceof Error ? err.message : '解除模型与提供商关联失败';
      console.error('解除模型与提供商关联失败:', err);
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  // 清理未使用的模型（没有关联到任何提供商的模型）
  const cleanupUnusedModels = async () => {
    if (!modelService.value) return;
    
    isLoading.value = true;
    error.value = null;
    
    try {
      // 获取所有模型ID
      const modelIds = models.value.map(model => model.id);
      
      // 获取所有有关联的模型ID
      const linkedModelIds = new Set(modelProviders.value.map(mp => mp.modelId));
      
      // 找出没有关联的模型ID
      const unusedModelIds = modelIds.filter(id => !linkedModelIds.has(id));
      
      console.log('发现未使用的模型:', unusedModelIds.length);
      
      // 删除未使用的模型
      for (const id of unusedModelIds) {
        await deleteModel(id);
      }
      
      return unusedModelIds.length;
    } catch (err) {
      error.value = err instanceof Error ? err.message : '清理未使用模型失败';
      console.error('清理未使用模型失败:', err);
      return 0;
    } finally {
      isLoading.value = false;
    }
  };

  // 获取模型的所有提供商关联
  const getModelProvidersByModelId = computed(() => (modelId: string) => {
    return modelProviders.value.filter(mp => mp.modelId === modelId);
  });

  // 获取提供商的所有模型关联
  const getModelProvidersByProviderId = computed(() => (providerId: string) => {
    return modelProviders.value.filter(mp => mp.providerId === providerId);
  });

  // 选择模型并保存选择
  const selectModel = async (identifier: string | null) => {
    selectedModelIdentifier.value = identifier;
    try {
      await settingsService.set('selectedModelIdentifier', identifier);
    } catch (err) {
      console.error('保存选中的模型标识符失败:', err);
    }
  };

  return {
    models,
    modelProviders,
    selectedModelIdentifier,
    isLoading,
    error,
    initService,
    loadModels,
    loadActiveModels,
    loadAllModelProviders,
    addModel,
    updateModel,
    updateModelStatus,
    deleteModel,
    linkModelToProvider,
    unlinkModelFromProvider,
    cleanupUnusedModels,
    selectModel,
    getSelectedModel: (): Model | undefined => {
      if (!selectedModelIdentifier.value) return undefined;
      return models.value.find(model => model.identifier === selectedModelIdentifier.value);
    },
    getModelProvidersByModelId,
    getModelProvidersByProviderId
  };
}); 
import { defineStore } from "pinia";
import { ref } from "vue";
import { nanoid } from 'nanoid/non-secure';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { ProviderService, Provider } from '../services/ProviderService';
import Database from '@tauri-apps/plugin-sql';

export const useProviderStore = defineStore("providers", () => {
  const providers = ref<Provider[]>([]);
  const selectedProviderId = ref<string | null>(null);
  const providerService = ref<ProviderService | null>(null);
  const isLoading = ref<boolean>(false);
  const error = ref<string | null>(null);

  // 初始化服务
  const initService = async (db: Database) => {
    providerService.value = new ProviderService(db);
    await loadProviders();
  };

  // 加载所有提供商
  const loadProviders = async () => {
    if (!providerService.value) return;
    
    isLoading.value = true;
    error.value = null;
    
    try {
      const dbProviders = await providerService.value.getAllProviders();
      providers.value = dbProviders;
    } catch (err) {
      error.value = err instanceof Error ? err.message : '加载提供商失败';
      console.error('加载提供商失败:', err);
    } finally {
      isLoading.value = false;
    }
  };

  // 添加提供商
  const addProvider = async (name: string, apiKey?: string, baseUrl?: string, protocol: string = 'OpenAI') => {
    if (!providerService.value) {
      console.error('添加提供商失败: providerService 未初始化');
      error.value = 'providerService 未初始化';
      return null;
    }
    
    isLoading.value = true;
    error.value = null;
    
    try {
      const providerId = nanoid();
      console.log('生成的提供商ID:', providerId);
      
      const newProvider: Provider = {
        id: providerId,
        name,
        protocol,
        apiKey,
        baseUrl,
        createdAt: format(new Date(), 'yyyy-MM-dd HH:mm:ss', { locale: zhCN }),
        updatedAt: format(new Date(), 'yyyy-MM-dd HH:mm:ss', { locale: zhCN })
      };
      
      console.log('准备创建提供商:', newProvider);
      await providerService.value.createProvider(newProvider);
      console.log('提供商创建成功');
      
      providers.value.unshift(newProvider);
      return providerId;
    } catch (err) {
      console.error('添加提供商时发生错误:', err);
      error.value = err instanceof Error ? err.message : '添加提供商失败';
      console.error('添加提供商失败:', err);
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  // 更新提供商
  const updateProvider = async (id: string, updates: Partial<Provider>) => {
    if (!providerService.value) return false;
    
    isLoading.value = true;
    error.value = null;
    
    try {
      await providerService.value.updateProvider(id, updates);
      
      const index = providers.value.findIndex(provider => provider.id === id);
      if (index !== -1) {
        providers.value[index] = {
          ...providers.value[index],
          ...updates,
          updatedAt: format(new Date(), 'yyyy-MM-dd HH:mm:ss', { locale: zhCN })
        };
      }
      
      return true;
    } catch (err) {
      error.value = err instanceof Error ? err.message : '更新提供商失败';
      console.error('更新提供商失败:', err);
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  // 删除提供商
  const deleteProvider = async (id: string) => {
    if (!providerService.value) return false;
    
    isLoading.value = true;
    error.value = null;
    
    try {
      await providerService.value.deleteProvider(id);
      
      // 从本地状态中移除提供商
      const index = providers.value.findIndex(provider => provider.id === id);
      if (index !== -1) {
        providers.value.splice(index, 1);
      }
      
      // 如果当前选中的提供商被删除，清空选中状态
      if (selectedProviderId.value === id) {
        selectedProviderId.value = null;
      }
      
      return true;
    } catch (err) {
      error.value = err instanceof Error ? err.message : '删除提供商失败';
      console.error('删除提供商失败:', err);
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    providers,
    selectedProviderId,
    isLoading,
    error,
    initService,
    loadProviders,
    addProvider,
    updateProvider,
    deleteProvider,
    selectProvider: (id: string | null) => selectedProviderId.value = id,
    getSelectedProvider: (): Provider | undefined => {
      if (!selectedProviderId.value) return undefined;
      return providers.value.find(provider => provider.id === selectedProviderId.value);
    }
  };
}); 
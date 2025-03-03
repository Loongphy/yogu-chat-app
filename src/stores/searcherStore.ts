import { defineStore } from 'pinia'
import { ref } from 'vue'
import { settingsService } from '../services/SettingsService'

export const useSearcherStore = defineStore('searcher', () => {
  // 搜索设置状态
  const webSearchEnabled = ref(false)
  const searchEngine = ref<"tavily" | "exa" | undefined>()
  const apiKey = ref("")
  const searchResultCount = ref(3)

  // 初始化设置
  const initSettings = async () => {
    try {
      // 加载保存的设置
      const savedWebSearchEnabled = await settingsService.get<boolean>("webSearchEnabled")
      if (savedWebSearchEnabled !== null) {
        webSearchEnabled.value = savedWebSearchEnabled
      }

      const savedSearchEngine = await settingsService.get<"tavily" | "exa" | undefined>("searchEngine")
      console.log("savedSearchEngine", savedSearchEngine)
      if (savedSearchEngine) {
        searchEngine.value = savedSearchEngine
      }

      const savedApiKey = await settingsService.get<string>("searchApiKey")
      if (savedApiKey) {
        apiKey.value = savedApiKey
      }

      const savedSearchResultCount = await settingsService.get<number>("searchResultCount")
      if (savedSearchResultCount !== null) {
        searchResultCount.value = savedSearchResultCount
      }
    } catch (error) {
      console.error('初始化设置失败:', error)
    }
  }

  // 更新网络搜索启用状态
  const updateWebSearchEnabled = async (value: boolean) => {
    try {
      webSearchEnabled.value = value
      await settingsService.set("webSearchEnabled", value)
    } catch (error) {
      console.error('更新网络搜索状态失败:', error)
    }
  }

  // 更新搜索引擎
  const updateSearchEngine = async (engine: "tavily" | "exa") => {
    try {
      searchEngine.value = engine
      await settingsService.set("searchEngine", engine)
    } catch (error) {
      console.error('更新搜索引擎失败:', error)
    }
  }

  // 更新 API 密钥
  const updateApiKey = async (key: string) => {
    try {
      apiKey.value = key
      await settingsService.set("searchApiKey", key)
    } catch (error) {
      console.error('更新 API 密钥失败:', error)
    }
  }

  // 更新搜索结果数量
  const updateSearchResultCount = async (count: number) => {
    try {
      // 确保结果数量在合理范围内
      let validCount = count
      if (validCount < 1) validCount = 1
      if (validCount > 10) validCount = 10

      searchResultCount.value = validCount
      await settingsService.set("searchResultCount", validCount)
    } catch (error) {
      console.error('更新搜索结果数量失败:', error)
    }
  }

  return {
    webSearchEnabled,
    searchEngine,
    apiKey,
    searchResultCount,
    initSettings,
    updateWebSearchEnabled,
    updateSearchEngine,
    updateApiKey,
    updateSearchResultCount
  }
}) 
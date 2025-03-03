import { defineStore } from 'pinia'
import { ref } from 'vue'
import { settingsService } from '../services/SettingsService'

export type Language = 'zh-CN' | 'en-US' | 'ja-JP'

export const useLanguageStore = defineStore('language', () => {
  const language = ref<Language>('zh-CN')

  async function init() {
    const savedLanguage = await settingsService.get<Language>('language')
    if (savedLanguage) {
      language.value = savedLanguage
    }
  }

  async function updateLanguage(newLanguage: Language) {
    language.value = newLanguage
    await settingsService.set('language', newLanguage)
  }

  init()

  return {
    language,
    updateLanguage
  }
})
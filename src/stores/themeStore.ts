import { defineStore } from 'pinia'
import { ref } from 'vue'
import { settingsService } from '../services/SettingsService'

type Theme = 'light' | 'dark' | 'system'

export const useThemeStore = defineStore('theme', () => {
  const theme = ref<Theme>('system')
  const systemDarkMode = ref(false)

  // 更新主题
  const updateTheme = async (newTheme: Theme) => {
    theme.value = newTheme
    await settingsService.set('theme', newTheme)
    applyTheme()
  }

  // 应用主题
  const applyTheme = () => {
    const isDark = theme.value === 'system' 
      ? systemDarkMode.value 
      : theme.value === 'dark'
    
    document.documentElement.classList.toggle('dark', isDark)
  }

  // 监听系统主题变化
  const setupSystemThemeListener = () => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    systemDarkMode.value = mediaQuery.matches

    mediaQuery.addEventListener('change', (e) => {
      systemDarkMode.value = e.matches
      if (theme.value === 'system') {
        applyTheme()
      }
    })
  }

  // 初始化
  async function init() {
    const savedTheme = await settingsService.get<Theme>('theme')
    if (savedTheme) {
      theme.value = savedTheme
    }
    
    setupSystemThemeListener()
    applyTheme()
  }

  init()

  return {
    theme,
    updateTheme
  }
})
import { createI18n } from 'vue-i18n'
import { useLanguageStore, type Language } from '../stores/languageStore'
import { watch } from 'vue'

// 导入语言文件
import zhCN from './locales/zh-CN.json'
import enUS from './locales/en-US.json'
import jaJP from './locales/ja-JP.json'

const messages = {
  'zh-CN': zhCN,
  'en-US': enUS,
  'ja-JP': jaJP
}

export function setupI18n() {
  const languageStore = useLanguageStore()
  
  const i18n = createI18n({
    legacy: false,
    locale: languageStore.language,
    fallbackLocale: 'zh-CN',
    messages
  })

  // 监听语言变化
  watch(
    () => languageStore.language,
    (newLocale: Language) => {
      i18n.global.locale.value = newLocale
    }
  )
  
  return i18n
} 
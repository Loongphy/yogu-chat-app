import { createApp } from "vue";
import { createPinia } from 'pinia'
import App from "./App.vue";
import "./style.css";
import { setupI18n } from './i18n'
import { settingsService } from './services/SettingsService'
import Database from '@tauri-apps/plugin-sql'
import { useChatStore } from './stores/chatStore'
import { useProviderStore } from './stores/providerStore'
import { useModelStore } from './stores/modelStore'
import { useSearcherStore } from './stores/searcherStore'

async function bootstrap() {
  await settingsService.init()
  
  const app = createApp(App)
  const pinia = createPinia()
  app.use(pinia)
  app.use(setupI18n())
  app.mount("#app")

  // 初始化数据库
  const db = await Database.load('sqlite:database.db')
  const chatStore = useChatStore()
  const providerStore = useProviderStore()
  const modelStore = useModelStore()
  const searcherStore = useSearcherStore()
  
  await chatStore.initServices(db)
  await providerStore.initService(db)
  await modelStore.initService(db)
  await searcherStore.initSettings()
}

bootstrap()

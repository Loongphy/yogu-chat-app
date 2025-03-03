import { Store } from '@tauri-apps/plugin-store'

class SettingsService {
  private static instance: SettingsService
  private store: Store | null = null
  
  private constructor() {}
  
  static getInstance(): SettingsService {
    if (!SettingsService.instance) {
      SettingsService.instance = new SettingsService()
    }
    return SettingsService.instance
  }
  
  async init() {
    if (!this.store) {
      this.store = await Store.load('settings.dat')
    }
    return this.store
  }
  
  async get<T>(key: string): Promise<T | null> {
    if (!this.store) {
      throw new Error('Store not initialized')
    }
    return await this.store.get(key) as T
  }
  
  async set(key: string, value: unknown) {
    if (!this.store) {
      throw new Error('Store not initialized')
    }
    await this.store.set(key, value)
    await this.store.save()
  }
}

export const settingsService = SettingsService.getInstance()
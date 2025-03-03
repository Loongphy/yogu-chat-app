import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSidebarStore = defineStore('sidebar', () => {
  const isExpanded = ref(true)

  const toggleSidebar = async () => {
    isExpanded.value = !isExpanded.value
  }

  return {
    isExpanded,
    toggleSidebar
  }
})
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useModalStore = defineStore('modal', () => {
  const isSearchDialogOpen = ref(false)
  const isSettingsModalOpen = ref(false)

  const openSearchDialog = () => {
    isSettingsModalOpen.value = false
    isSearchDialogOpen.value = true
  }

  const closeSearchDialog = () => {
    isSearchDialogOpen.value = false
  }

  const openSettingsModal = () => {
    isSearchDialogOpen.value = false
    isSettingsModalOpen.value = true
  }

  const closeSettingsModal = () => {
    isSettingsModalOpen.value = false
  }

  return {
    isSearchDialogOpen,
    isSettingsModalOpen,
    openSearchDialog,
    closeSearchDialog,
    openSettingsModal,
    closeSettingsModal,
  }
}) 
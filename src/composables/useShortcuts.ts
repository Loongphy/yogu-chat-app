import { onMounted, onUnmounted } from 'vue'
import { useModalStore } from '../stores/modalStore'

export function useShortcuts() {
  const modalStore = useModalStore()

  // 处理键盘快捷键
  const handleKeyDown = (event: KeyboardEvent) => {
    // 检查是否按下了Command键(Mac)或Ctrl键(Windows/Linux)
    const isCmdOrCtrl = event.metaKey || event.ctrlKey

    if (isCmdOrCtrl) {
      // ⌘+K: 打开搜索
      if (event.key === 'k') {
        event.preventDefault()
        modalStore.openSearchDialog()
      }
      
      // ⌘+,: 打开设置
      else if (event.key === ',') {
        event.preventDefault()
        modalStore.openSettingsModal()
      }
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', handleKeyDown)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown)
  })

  return {
    handleKeyDown
  }
} 
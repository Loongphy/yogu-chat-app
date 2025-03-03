/**
 * 检测用户操作系统的组合式函数
 * 用于在UI中显示正确的快捷键
 */
export function useOS() {
  // 检测是否为 macOS
  const isMac = /mac/i.test(navigator.userAgent);

  return {
    isMac,
    // 返回适合当前操作系统的修饰键符号
    modifierKey: isMac ? '⌘' : 'Ctrl',
  };
} 
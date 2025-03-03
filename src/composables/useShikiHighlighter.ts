import {
  createHighlighter,
  type HighlighterGeneric,
  type BundledLanguage,
  type BundledTheme,
} from "shiki";
import { ref, shallowRef } from "vue";

// 全局单例高亮器实例
const highlighter = shallowRef<HighlighterGeneric<BundledLanguage, BundledTheme> | null>(null);
// 已加载的语言
const loadedLanguages = ref<Set<string>>(new Set());
// 已加载的主题
const loadedThemes = ref<Set<string>>(new Set(["github-dark", "github-light"]));
// 初始化状态
const isInitializing = ref(false);
// 初始化完成的 Promise
let initPromise: Promise<void> | null = null;

/**
 * 初始化高亮器
 */
async function initializeHighlighter(): Promise<void> {
  if (highlighter.value) return;
  if (isInitializing.value) {
    // 如果已经在初始化中，等待初始化完成
    await initPromise;
    return;
  }

  isInitializing.value = true;
  initPromise = createHighlighter({
    themes: Array.from(loadedThemes.value),
    langs: [],
  }).then((instance) => {
    highlighter.value = instance;
    isInitializing.value = false;
  }).catch((error) => {
    console.error("Failed to initialize Shiki highlighter:", error);
    isInitializing.value = false;
  });

  await initPromise;
}

/**
 * 确保语言已加载
 * @param language 需要加载的语言
 */
async function ensureLanguageLoaded(language: string): Promise<void> {
  if (!highlighter.value) {
    await initializeHighlighter();
  }

  if (!loadedLanguages.value.has(language) && highlighter.value) {
    try {
      // 将字符串语言转换为 Shiki 支持的语言类型
      await highlighter.value.loadLanguage(language as BundledLanguage);
      loadedLanguages.value.add(language);
    } catch (error) {
      console.warn(`Failed to load language: ${language}`, error);
    }
  }
}

/**
 * 高亮代码
 * @param code 要高亮的代码
 * @param language 代码语言
 * @param theme 主题名称
 */
async function highlightCode(code: string, language: string, theme: string): Promise<string> {
  await ensureLanguageLoaded(language);

  if (!highlighter.value) {
    return code;
  }

  try {
    return highlighter.value.codeToHtml(code, {
      lang: language as BundledLanguage,
      theme: theme,
    });
  } catch (error) {
    console.error(`Failed to highlight code with language: ${language}`, error);
    return code;
  }
}

/**
 * 释放高亮器资源
 */
function disposeHighlighter(): void {
  if (highlighter.value) {
    highlighter.value.dispose();
    highlighter.value = null;
    loadedLanguages.value.clear();
  }
}

/**
 * 使用 Shiki 高亮器的 composable
 */
export function useShikiHighlighter() {
  return {
    highlightCode,
    ensureLanguageLoaded,
    disposeHighlighter,
    isInitializing,
  };
} 
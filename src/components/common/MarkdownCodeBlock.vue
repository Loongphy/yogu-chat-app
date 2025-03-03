<script setup lang="ts">
import {
  WrapText,
  AlignJustify,
  Copy,
  Check,
  Code,
  Eye,
} from "lucide-vue-next";
import { ref, onMounted, computed, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useThemeStore } from "../../stores/themeStore";
import { useShikiHighlighter } from "../../composables/useShikiHighlighter";
import MarkdownMermaid from "./MarkdownMermaid.vue";

interface Props {
  content: string;
  language: string;
}

const props = defineProps<Props>();
const isWrapped = ref(false);
const isCopied = ref(false);
const highlightedCode = ref("");
const isLoading = ref(true);
const { t } = useI18n();
const themeStore = useThemeStore();
const { highlightCode } = useShikiHighlighter();

// 是否显示预览模式（针对 mermaid）
const isPreviewMode = ref(false);

// 计算是否是 mermaid 语言
const isMermaid = computed(() => {
  return props.language.toLowerCase() === "mermaid";
});

// 在组件挂载时，如果是 mermaid 语言，默认设置为预览模式
onMounted(() => {
  if (isMermaid.value) {
    isPreviewMode.value = true;
  }
});

// 计算当前是否是暗黑模式
const isDarkMode = computed(() => {
  // 如果主题是系统，则使用系统暗黑模式状态
  // 如果主题是明确设置的，则直接判断是否为 dark
  return themeStore.theme === "system"
    ? window.matchMedia("(prefers-color-scheme: dark)").matches
    : themeStore.theme === "dark";
});

// 更新代码高亮的函数
const updateHighlightedCode = async () => {
  // 根据当前主题选择适当的主题
  const theme = isDarkMode.value ? "github-dark" : "github-light";

  try {
    highlightedCode.value = await highlightCode(
      props.content,
      props.language,
      theme
    );
    isLoading.value = false;
  } catch (error) {
    console.error("Failed to highlight code:", error);
    highlightedCode.value = props.content;
    isLoading.value = false;
  }
};

// 监听暗黑模式变化
watch(isDarkMode, () => {
  updateHighlightedCode();
});

// 监听内容或语言变化
watch([() => props.content, () => props.language], () => {
  updateHighlightedCode();
  // 当语言变化时，如果是 mermaid 则默认设置为预览模式，否则设置为代码模式
  isPreviewMode.value = isMermaid.value;
});

onMounted(async () => {
  await updateHighlightedCode();
});

const handleCopy = async (content: string) => {
  try {
    await navigator.clipboard.writeText(content);
    isCopied.value = true;
    setTimeout(() => {
      isCopied.value = false;
    }, 1000);
  } catch (err) {
    console.error("Failed to copy text:", err);
  }
};

const toggleWordWrap = () => {
  isWrapped.value = !isWrapped.value;
};

// 切换预览/代码模式
const togglePreviewMode = () => {
  isPreviewMode.value = !isPreviewMode.value;
};
</script>

<template>
  <div class="relative [&_div+div]:!mt-0 mt-6 mb-10 -mx-4">
    <div
      class="flex flex-row px-4 py-2 rounded-t-xl bg-gray-50 dark:bg-zinc-800 text-gray-900 dark:text-gray-100"
    >
      <span class="font-mono text-sm">
        {{ language }}
      </span>
    </div>
    <div class="sticky top-12 right-2 z-10">
      <div class="absolute bottom-1 right-2 flex flex-row gap-2">
        <!-- 预览/代码模式切换按钮，仅在 mermaid 语言时显示 -->
        <button
          v-if="isMermaid"
          @click="togglePreviewMode"
          class="flex flex-row items-center gap-1 bg-transparent px-2 py-1 rounded-lg text-sm text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white disabled:hover:text-gray-500 dark:disabled:hover:text-gray-300 transition ease-in-out dark:hover:bg-zinc-700"
        >
          <component :is="isPreviewMode ? Code : Eye" class="w-4 h-4" />
          {{ isPreviewMode ? t("common.viewCode") : t("common.preview") }}
        </button>
        <!-- 自动换行按钮，仅在代码模式下显示（非mermaid或mermaid但在代码模式下） -->
        <button
          v-if="!isMermaid || (isMermaid && !isPreviewMode)"
          @click="toggleWordWrap"
          class="flex flex-row items-center gap-1 bg-transparent px-2 py-1 rounded-lg text-sm text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white disabled:hover:text-gray-500 dark:disabled:hover:text-gray-300 transition ease-in-out dark:hover:bg-zinc-700"
        >
          <component
            :is="isWrapped ? AlignJustify : WrapText"
            class="w-4 h-4"
          />
          {{
            isWrapped
              ? t("common.wordWrap.disable")
              : t("common.wordWrap.enable")
          }}
        </button>
        <button
          @click="handleCopy(content)"
          class="flex flex-row items-center gap-1 bg-transparent px-2 py-1 rounded-lg text-sm text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white disabled:hover:text-gray-500 dark:disabled:hover:text-gray-300 transition ease-in-out dark:hover:bg-zinc-700"
        >
          <component :is="isCopied ? Check : Copy" class="w-4 h-4" />
          {{ isCopied ? t("common.copied") : t("common.copy") }}
        </button>
      </div>
    </div>
    <div class="bg-gray-50 dark:bg-zinc-800 rounded-b-xl">
      <!-- Mermaid 预览模式 -->
      <MarkdownMermaid
        v-if="isMermaid && isPreviewMode"
        :content="content"
        class="p-4"
      />
      <!-- 代码模式 -->
      <div
        v-else
        class="bg-gray-50 dark:bg-zinc-800 text-gray-900 dark:text-gray-100"
        style="
          display: block;
          overflow-x: auto;
          padding: 16px;
          border-radius: 0px 0px 12px 12px;
          margin-top: 0px;
          font-size: 0.9em;
          line-height: 1.5em;
          @media (prefers-color-scheme: dark) {
            background-color: rgb(39, 39, 42);
          }
        "
      >
        <div v-if="isLoading" class="p-4 text-center">加载中...</div>
        <div
          v-else
          :style="{ whiteSpace: isWrapped ? 'pre-wrap' : 'pre' }"
          v-html="highlightedCode"
          class="shiki-container"
        ></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.shiki-container :deep(pre) {
  margin: 0;
  padding: 0;
  background: transparent !important;
}

.shiki-container :deep(code) {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
    "Liberation Mono", "Courier New", monospace;
  font-size: 0.9em;
  line-height: 1.5em;
}
</style>

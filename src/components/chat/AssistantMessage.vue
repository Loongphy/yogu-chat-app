<script setup lang="ts">
import { RefreshCcw } from "lucide-vue-next";
import MarkdownRenderer from "../common/MarkdownRenderer.vue";
import CopyButton from "../common/CopyButton.vue";
import Tooltip from "../common/Tooltip.vue";
import { useI18n } from "vue-i18n";
import ThinkingRenderer from "./ThinkingRenderer.vue";
import { computed } from "vue";
import { Message } from "../../stores/chatStore";
import { useSearchSidebarStore } from "../../stores/searchSidebarStore";

const { t } = useI18n();
const searchSidebarStore = useSearchSidebarStore();

const props = defineProps<{
  message: Message;
}>();

defineEmits<{
  (e: "reload"): void;
}>();

const parseMessageContent = (content: string) => {
  // If we find a complete think tag
  if (content.includes("</think>")) {
    const [thinkingContent, ...rest] = content.split("</think>");
    return {
      thinkingContent: thinkingContent.replace("<think>", "").trim(),
      textContent: rest.join("</think>").trim(),
      thinkingComplete: true,
    };
  }
  if (content.includes("<think>")) {
    return {
      thinkingContent: content.replace("<think>", "").trim(),
      textContent: "",
      thinkingComplete: false,
    };
  }
  return {
    thinkingContent: "",
    textContent: content,
    thinkingComplete: true,
  };
};

const parsedContent = computed(() => {
  return parseMessageContent(props.message.content);
});
const thinkingContent = computed(() => parsedContent.value.thinkingContent);
const textContent = computed(() => parsedContent.value.textContent);
const thinkingComplete = computed(() => parsedContent.value.thinkingComplete);
const hasSearchResults = computed(
  () =>
    !!props.message.webSearchResults &&
    props.message.webSearchResults.length > 0
);

const handleSearchResultsClick = () => {
  if (
    props.message.webSearchResults &&
    props.message.webSearchResults.length > 0
  ) {
    searchSidebarStore.showSidebar(props.message.webSearchResults);
  }
};
</script>

<template>
  <div
    class="relative group flex flex-col justify-center w-full max-w-3xl md:px-4 pb-2 gap-2 items-start bg-transparent dark:bg-transparent"
  >
    <div v-if="hasSearchResults" class="flex -ml-1 text-sm gap-2 mb-3">
      <div
        @click="handleSearchResultsClick"
        class="flex flex-row items-center px-3 py-1 rounded-full cursor-pointer bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-800 dark:text-gray-200"
      >
        <div class="truncate">
          {{ message.webSearchResults?.length }} 个网页
        </div>
      </div>
    </div>

    <div
      class="rounded-3xl prose dark:prose-invert break-words text-primary min-h-7 prose-p:opacity-95 prose-strong:opacity-100 w-full max-w-none dark:prose-a:text-blue-400 dark:prose-headings:text-gray-100 dark:prose-code:bg-gray-800 dark:prose-code:text-gray-200 dark:prose-pre:bg-gray-800 dark:prose-pre:border dark:prose-pre:border-gray-700"
    >
      <ThinkingRenderer
        v-if="thinkingContent"
        :complete="thinkingComplete"
        :content="thinkingContent"
      />
      <MarkdownRenderer
        :content="textContent"
        :citations="message.webSearchResults"
      />
    </div>
    <div
      class="flex items-center gap-[2px] w-max opacity-0 group-focus-within:opacity-100 group-hover:opacity-100 transition-opacity rounded-lg text-xs pb-2 px-2 start-0 md:start-3 -ml-4 dark:bg-gray-800/30"
    >
      <Tooltip :content="t('chat.regenerate')" placement="bottom">
        <button
          @click="$emit('reload')"
          class="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium leading-[normal] cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-gray-400 dark:focus-visible:ring-gray-500 disabled:opacity-50 disabled:cursor-default text-gray-500 dark:text-gray-200 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-600 h-8 w-8 rounded-full transition-colors"
        >
          <RefreshCcw class="w-4 h-4" />
        </button>
      </Tooltip>
      <CopyButton :content="textContent" />
    </div>
  </div>
</template>

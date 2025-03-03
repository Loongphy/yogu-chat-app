<script setup lang="ts">
import { Copy, Check } from "lucide-vue-next";
import { ref } from "vue";
import Tooltip from "./Tooltip.vue";
import { useI18n } from "vue-i18n";

const props = defineProps<{
  content: string;
}>();

const { t } = useI18n();
const isCopied = ref(false);

const copyContent = async () => {
  try {
    await navigator.clipboard.writeText(props.content);
    isCopied.value = true;
    setTimeout(() => {
      isCopied.value = false;
    }, 1000);
  } catch (err) {
    console.error("复制失败:", err);
  }
};
</script>

<template>
  <Tooltip :content="t('common.copy')" placement="bottom">
    <button
      class="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium leading-[normal] cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50 disabled:cursor-default text-gray-500 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 h-8 w-8 rounded-full"
      @click="copyContent"
    >
      <Check v-if="isCopied" class="w-4 h-4" />
      <Copy v-else class="w-4 h-4" />
    </button>
  </Tooltip>
</template>

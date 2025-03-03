<script setup lang="ts">
import ChatInput from "./ChatInput.vue";
import { ref, watch } from "vue";
import { useModelStore } from "../../stores/modelStore";
import { toast } from "vue-sonner";
import { useI18n } from "vue-i18n";

const input = ref("");
const status = ref("idle");
const modelStore = useModelStore();
const modelIdentifier = ref<string | null>(null); // 初始化为 null
const isWebSearchEnabled = ref(false); // 添加Web搜索状态
const files = ref<string[]>([]);
const { t } = useI18n();

// 使用 watch 监听 modelStore.selectedModelIdentifier 的变化
watch(
  () => modelStore.selectedModelIdentifier,
  (newValue) => {
    console.log("newValue", newValue);
    modelIdentifier.value = newValue;
  },
  { immediate: true }
); // 设置 immediate: true，确保首次加载时也能获取到值

const emit = defineEmits(["submit"]);

const handleSubmit = () => {
  try {
    if (!input.value.trim()) return;

    // 检查是否选择了模型
    if (!modelIdentifier.value) {
      toast.error(t("chat.errors.noModelSelected") || "请选择一个模型");
      return;
    }

    // 将null转换为undefined
    const modelId =
      modelIdentifier.value === null ? undefined : modelIdentifier.value;
    emit("submit", input.value, modelId, isWebSearchEnabled.value, files.value);
  } catch (error) {
    console.error("Submit error:", error);
    toast.error(t("chat.errors.submitFailed") || "提交失败，请重试");
  }
};

const handleStop = () => {
  console.log("stop");
};
</script>

<template>
  <div
    class="flex flex-col items-center justify-between w-full h-full gap-6 p-2 pt-20 mx-auto @sm:justify-center @sm:p-4 @sm:gap-9 @lg:w-4/5"
  >
    <div
      class="flex flex-col items-start justify-center w-full gap-6 @sm:gap-4 @lg:w-4/5 max-w-[50rem] flex-1 @sm:flex-initial pt-[120px] @sm:pt-0"
    >
      <h1
        class="w-full text-2xl tracking-tight @sm:text-3xl text-gray-900 dark:text-gray-100 flex items-center justify-center text-center"
      >
        晚上好，子天
      </h1>
      <div
        class="w-full text-gray-500 dark:text-gray-400 text-lg @sm:text-xl flex items-center justify-center text-center"
      >
        想聊点什么？
      </div>
    </div>
    <ChatInput
      v-model:input="input"
      v-model:model-identifier="modelIdentifier"
      v-model:is-web-search-enabled="isWebSearchEnabled"
      v-model:attachments="files"
      :is-loading="status === 'streaming'"
      @submit="handleSubmit"
      @stop="handleStop"
      class="@lg:w-4/5"
    />
  </div>
</template>

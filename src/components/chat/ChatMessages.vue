<script setup lang="ts">
import { ChevronDown } from "lucide-vue-next";
import ChatInput from "./ChatInput.vue";
import { nextTick, ref, onMounted, watch, onUnmounted } from "vue";
import UserMessage from "./UserMessage.vue";
import AssistantMessage from "./AssistantMessage.vue";
import { useChat } from "../../composables/useChat";
import { useChatStore } from "../../stores/chatStore";
import { useScrollToBottom } from "../../composables/useScrollToBottom.ts";
import { useModelStore } from "../../stores/modelStore";
import { toast } from "vue-sonner";
import { useI18n } from "vue-i18n";

const chatStore = useChatStore();
const modelStore = useModelStore();
const { t } = useI18n();

const props = defineProps<{
  chatId?: string;
}>();

// 处理错误的函数
const handleError = async (error: unknown) => {
  toast.error(
    error instanceof Error
      ? error.message
      : t("chat.errors.generalError") || "发生错误，请重试"
  );
};

const { messages, input, modelIdentifier, status, handleSubmit, stop, reload } =
  useChat({
    // id: props.chatId,
    initialMessages: [],
    onFinish: (_) => {
      if (props.chatId) {
        chatStore.updateChatModelIdentifier(
          props.chatId,
          modelIdentifier.value
        );
        chatStore.updateMessages(props.chatId, messages.value);
      }
    },
    onError: handleError,
  });

// 获取当前聊天的模型标识符
const chatModelIdentifier = ref<string | null>(null);

// 监听 chatId 变化，更新消息和模型标识符
watch(
  () => props.chatId,
  (newChatId) => {
    if (newChatId) {
      const chat = chatStore.getChat(newChatId);
      messages.value = chat?.messages || [];

      // 获取聊天的模型标识符
      chatModelIdentifier.value = chat?.modelIdentifier || null;
      console.log("chatModelIdentifier", chatModelIdentifier.value);
    } else {
      messages.value = [];
      chatModelIdentifier.value = null;
    }
  },
  { immediate: true }
);

// 初始化modelIdentifier
if (chatModelIdentifier.value) {
  modelIdentifier.value = chatModelIdentifier.value;
}

// 监听 modelIdentifier 变化，更新 chatStore 中的模型标识符
watch(
  () => modelIdentifier.value,
  (newModelIdentifier) => {
    if (props.chatId && newModelIdentifier !== chatModelIdentifier.value) {
      // 确保 newModelIdentifier 不为 null
      if (newModelIdentifier !== null) {
        chatStore.updateChatModelIdentifier(props.chatId, newModelIdentifier);
        chatModelIdentifier.value = newModelIdentifier;
        modelStore.selectModel(newModelIdentifier);
      }
    }
  }
);

const isWebSearchEnabled = ref(false);

// 提供发送消息的方法
const sendMessage = async (
  message: string,
  aModelIdentifier?: string,
  aWebSearchEnabled?: boolean,
  files?: string[]
) => {
  try {
    input.value = message;
    if (aModelIdentifier) {
      modelIdentifier.value = aModelIdentifier;
    }
    if (aWebSearchEnabled !== undefined) {
      isWebSearchEnabled.value = aWebSearchEnabled;
    }
    return nextTick(() => {
      handleSubmit({
        attachments: files,
        enableWebSearch: aWebSearchEnabled,
        searchQuery: aWebSearchEnabled ? message : undefined,
      });
    });
  } catch (error) {
    handleError(error);
  }
};

defineExpose({
  sendMessage,
});

// 使用 useScrollToBottom 自定义 hook
const [messageContainerRef, scrollTargetRef] = useScrollToBottom();
const shouldShowScrollButton = ref(false);

// 检查是否需要显示滚动按钮
const checkShouldShowScrollButton = () => {
  if (!messageContainerRef.value) return;

  const { scrollTop, scrollHeight, clientHeight } = messageContainerRef.value;
  const scrollBottom = scrollHeight - scrollTop - clientHeight;
  shouldShowScrollButton.value = scrollBottom > 100;
};

const handleScrollToBottom = () => {
  if (scrollTargetRef.value) {
    scrollTargetRef.value.scrollIntoView({ behavior: "smooth" });
  }
};

onMounted(() => {
  if (messageContainerRef.value) {
    messageContainerRef.value.addEventListener(
      "scroll",
      checkShouldShowScrollButton
    );
  }
});

onUnmounted(() => {
  if (messageContainerRef.value) {
    messageContainerRef.value.removeEventListener(
      "scroll",
      checkShouldShowScrollButton
    );
  }
});

const files = ref<string[]>([]);
</script>

<template>
  <div class="relative flex-grow min-w-0 flex flex-col items-center h-full">
    <div
      ref="messageContainerRef"
      class="w-full overflow-x-hidden scrollbar-gutter-stable flex flex-col items-center px-5 h-0 flex-grow overflow-y-auto scroll-smooth"
    >
      <div class="relative w-full flex flex-col items-center py-4">
        <div class="w-full max-w-3xl flex flex-col">
          <!-- 消息列表 -->
          <template v-for="message in messages" :key="message.id">
            <div>
              <UserMessage
                v-if="message.role === 'user'"
                :message="message"
                @update:content="(newContent: string) => (message.content = newContent)"
              />
              <AssistantMessage
                v-else-if="message.role === 'assistant'"
                :message="message"
                @reload="reload"
              />
              <!-- <div
                v-if="message.role === 'system'"
                class="text-sm text-gray-500 dark:text-gray-400"
              >
                debug: {{ message.content }}
              </div> -->
            </div>
          </template>
          <div
            style="padding-bottom: 152px; width: 100%"
            ref="scrollTargetRef"
          ></div>
        </div>
      </div>
    </div>
    <div class="absolute bottom-0 mx-auto inset-x-0 max-w-[50rem] z-20">
      <div class="absolute flex justify-center w-full h-0 pr-4 mx-auto -top-3">
        <div
          class="h-0 flex items-end justify-end w-full max-w-[50rem] px-2 z-40"
        >
          <button
            v-show="shouldShowScrollButton"
            @click="handleScrollToBottom"
            class="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium leading-[normal] cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50 disabled:cursor-default border border-[#E0E0E0] dark:border-gray-600 shadow-sm text-gray-500 dark:text-gray-200 hover:text-gray-800 dark:hover:text-white rounded-full bg-white dark:bg-[#2A2B2E] hover:bg-gray-50 dark:hover:bg-gray-700 backdrop-blur-sm size-8 transition-colors"
          >
            <ChevronDown class="w-5 h-5" />
          </button>
        </div>
      </div>
      <div class="relative w-full px-3 pb-3 sm:pb-4">
        <ChatInput
          v-model:input="input"
          v-model:model-identifier="modelIdentifier"
          v-model:is-web-search-enabled="isWebSearchEnabled"
          v-model:attachments="files"
          :is-loading="status === 'streaming'"
          dropdown-placement="top-end"
          @submit="
            () =>
              handleSubmit({
                attachments: files,
                enableWebSearch: isWebSearchEnabled,
                searchQuery: isWebSearchEnabled ? input : undefined,
              })
          "
          @stop="stop"
          class="z-10"
        />
        <div
          class="absolute bottom-0 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] h-full rounded-t-[40px] bg-white dark:bg-[#1E1F22] max-w-[50rem]"
        ></div>
      </div>
    </div>
  </div>
</template>

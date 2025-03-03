<script setup lang="ts">
import AppHeader from "./components/AppHeader.vue";
import ChatSidebar from "./components/chat/ChatSidebar.vue";
import SearchDialog from "./components/SearchDialog.vue";
import WebSearchSidebar from "./components/WebSearchSidebar.vue";
import SettingsModal from "./components/settings/SettingsModal.vue";
import SettingsSidebar from "./components/settings/SettingsSidebar.vue";
import SettingsAccount from "./components/settings/SettingsAccount.vue";
import SettingsAppearance from "./components/settings/SettingsAppearance.vue";
import SettingsShortcut from "./components/settings/SettingsShortcut.vue";
import SettingsAbout from "./components/settings/SettingsAbout.vue";
import SettingsProvider from "./components/settings/SettingsProvider.vue";
import SettingsModel from "./components/settings/SettingsModel.vue";
import SettingsSearcher from "./components/settings/SettingsSearcher.vue";
import ChatMessages from "./components/chat/ChatMessages.vue";
import { ref, onMounted, watch } from "vue";
import { useThemeStore } from "./stores/themeStore";
import { useModalStore } from "./stores/modalStore";
import ChatNew from "./components/chat/ChatNew.vue";
import { useChatStore } from "./stores/chatStore";
import { useShortcuts } from "./composables/useShortcuts";
import { useI18n } from "vue-i18n";
import { Toaster } from "vue-sonner";

const modalStore = useModalStore();
const themeStore = useThemeStore();
const chatStore = useChatStore();
const { t } = useI18n();
const activeSettingsTab = ref("account");
const showNewChat = ref(true);
const chatMessagesRef = ref();
const pendingNewMessage = ref<string | null>(null);
const pendingModelIdentifier = ref<string | undefined>(undefined);
const pendingWebSearchEnabled = ref<boolean>(false);
const pendingFiles = ref<string[]>([]);

// 使用快捷键
useShortcuts();

const handleNewChatSubmit = (
  message: string,
  modelIdentifier?: string,
  isWebSearchEnabled?: boolean,
  files?: string[]
) => {
  try {
    // 创建新话题，使用消息的前20个字符作为标题
    const chatTitle =
      message.length > 20 ? message.slice(0, 20) + "..." : message;

    chatStore.addChat(chatTitle, undefined, modelIdentifier);
    // 存储待发送的消息、模型标识符和Web搜索状态
    pendingNewMessage.value = message;
    pendingModelIdentifier.value = modelIdentifier;
    pendingWebSearchEnabled.value = isWebSearchEnabled || false;
    pendingFiles.value = files || [];
    showNewChat.value = false;
  } catch (error) {
    console.error(t("chat.errors.createChatFailed") + ":", error);
  }
};

// 监听组件挂载状态
watch(chatMessagesRef, (newRef) => {
  if (newRef && pendingNewMessage.value) {
    try {
      // 组件挂载后发送消息，并传递模型标识符和Web搜索状态
      newRef.sendMessage(
        pendingNewMessage.value,
        pendingModelIdentifier.value,
        pendingWebSearchEnabled.value,
        pendingFiles.value
      );
      pendingNewMessage.value = null;
      pendingModelIdentifier.value = undefined;
      pendingWebSearchEnabled.value = false;
      pendingFiles.value = [];
    } catch (error) {
      console.error(t("chat.errors.sendMessageFailed") + ":", error);
    }
  }
});

onMounted(() => {
  try {
    const systemDarkMode = window.matchMedia("(prefers-color-scheme: dark)");
    systemDarkMode.addEventListener("change", (e) => {
      if (themeStore.theme === "system") {
        document.documentElement.classList.toggle("dark", e.matches);
      }
    });
  } catch (error) {
    console.error(t("settings.appearance.errors.themeInitFailed") + ":", error);
  }
});
</script>

<template>
  <div class="h-full w-full flex flex-col dark:bg-[#1E1F22] dark:text-white">
    <AppHeader
      @open-settings="modalStore.openSettingsModal"
      @open-search="modalStore.openSearchDialog"
    />

    <!-- 主要内容区域 -->
    <main class="flex-1 min-h-0 flex @container">
      <!-- 左侧边栏 -->
      <ChatSidebar
        @new-chat="showNewChat = true"
        @select-chat="showNewChat = false"
      />

      <!-- 右侧内容区域 -->
      <Transition name="fade" mode="out-in">
        <ChatNew v-if="showNewChat" @submit="handleNewChatSubmit" />
        <ChatMessages
          v-else
          :chat-id="chatStore.selectedChatId || undefined"
          ref="chatMessagesRef"
        />
      </Transition>

      <!-- 搜索结果侧边栏 -->
      <WebSearchSidebar />
    </main>

    <SearchDialog />
    <SettingsModal>
      <div
        class="flex flex-col w-full sm:flex-row focus:outline-none h-0 flex-grow"
      >
        <SettingsSidebar v-model:activeTab="activeSettingsTab" />
        <div
          class="flex-1 w-full h-full pl-4 pr-4 pb-10 md:pr-4 overflow-auto scrollbar-none"
        >
          <div class="flex flex-col w-full h-full gap-6">
            <SettingsAccount v-if="activeSettingsTab === 'account'" />
            <SettingsAppearance v-if="activeSettingsTab === 'appearance'" />
            <SettingsShortcut v-if="activeSettingsTab === 'shortcut'" />
            <SettingsSearcher v-if="activeSettingsTab === 'searcher'" />
            <SettingsProvider v-if="activeSettingsTab === 'provider'" />
            <SettingsModel v-if="activeSettingsTab === 'model'" />
            <SettingsAbout v-if="activeSettingsTab === 'about'" />
          </div>
        </div>
      </div>
    </SettingsModal>
    <Toaster position="top-center" :toastOptions="{ style: { top: '64px' } }" />
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

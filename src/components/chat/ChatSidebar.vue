<script setup lang="ts">
import { useSidebarStore } from "../../stores/sidebarStore";
import { Pencil, Sparkles } from "lucide-vue-next";
import ChatItem from "./ChatItem.vue";
import { useI18n } from "vue-i18n";
import { useChatStore } from "../../stores/chatStore";

const emit = defineEmits(["newChat", "selectChat"]);
const sidebarStore = useSidebarStore();
const chatStore = useChatStore();
const { t } = useI18n();

const handleNewChat = () => {
  chatStore.selectChat(null);
  emit("newChat");
};

const selectChat = (id: string) => {
  chatStore.selectChat(id);
  emit("selectChat");
};

const deleteChat = (id: string) => {
  chatStore.deleteChat(id);
  if (chatStore.selectedChatId === null) {
    emit("newChat");
  }
};

const saveChat = (id: string, newChat: string) => {
  chatStore.updateChat(id, newChat);
};
</script>

<template>
  <aside
    class="bg-[#F7F8FA] dark:bg-[#2B2D30] border-r border-[#EbECF0] dark:border-[#1E1F22] transition-all ease-[cubic-bezier(0.4,0,0.2,1)] origin-left h-full flex"
    :class="{
      'w-[260px] translate-x-0': sidebarStore.isExpanded,
      'w-0 opacity-0 border-r-0 -translate-x-full': !sidebarStore.isExpanded,
    }"
  >
    <div
      class="w-[260px] h-full flex flex-col p-2"
      :class="{
        'opacity-100 translate-x-0': sidebarStore.isExpanded,
        'opacity-0 -translate-x-full': !sidebarStore.isExpanded,
      }"
    >
      <!-- header -->
      <div class="flex-shrink-0">
        <button
          @click="handleNewChat"
          class="inline-flex items-center justify-between gap-2 whitespace-nowrap text-sm font-medium leading-[normal] cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#DFE1E4] dark:focus-visible:ring-[#35373C] disabled:opacity-50 disabled:cursor-default h-10 rounded-lg py-2 px-3 w-full transition-all duration-150 bg-transparent dark:bg-transparent border border-transparent dark:border-transparent text-gray-800 dark:text-gray-200 hover:bg-[#EBECF0] dark:hover:bg-[#35373C] active:bg-[#DFE1E4] dark:active:bg-[#404249]"
        >
          <Sparkles class="size-4" />
          <div class="inline-flex flex-grow items-center gap-2 justify-between">
            {{ t("chat.newChat") }}
            <Pencil class="size-4" />
          </div>
        </button>
      </div>
      <!-- content -->
      <div class="flex-1 mt-2 space-y-1 overflow-y-auto min-h-0">
        <ChatItem
          v-for="chat in chatStore.chats"
          :key="chat.id"
          :chat="chat.title"
          :is-selected="chatStore.selectedChatId === chat.id"
          @select="selectChat(chat.id)"
          @delete="deleteChat(chat.id)"
          @save="(newChat) => saveChat(chat.id, newChat)"
        />
      </div>
      <!-- footer -->
      <div class="flex-shrink-0"></div>
    </div>
  </aside>
</template>

<style scoped></style>

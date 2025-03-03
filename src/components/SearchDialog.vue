<script setup lang="ts">
import { X } from "lucide-vue-next";
import { useModalStore } from "../stores/modalStore";
import { useI18n } from "vue-i18n";
import { ref, computed, watch, nextTick } from "vue";
import { useChatStore } from "../stores/chatStore";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";

const modalStore = useModalStore();
const chatStore = useChatStore();
const { t } = useI18n();

const searchQuery = ref("");
const searchInput = ref<HTMLInputElement | null>(null);

// 监听对话框打开状态，自动聚焦到输入框
watch(
  () => modalStore.isSearchDialogOpen,
  (isOpen) => {
    if (isOpen) {
      // 使用 nextTick 确保 DOM 已更新
      nextTick(() => {
        searchInput.value?.focus();
      });
    }
  }
);

const handleClose = () => {
  modalStore.closeSearchDialog();
};

// 根据搜索关键词过滤聊天记录
const filteredChats = computed(() => {
  const query = searchQuery.value.toLowerCase().trim();
  if (!query) return chatStore.chats;

  return chatStore.chats.filter((chat) =>
    chat.title.toLowerCase().includes(query)
  );
});

// 将聊天记录按日期分组
const groupedChats = computed(() => {
  const groups: { [key: string]: typeof filteredChats.value } = {
    today: [],
    yesterday: [],
    earlier: [],
  };

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  filteredChats.value.forEach((chat) => {
    console.log(chat.updatedAt, chat.createdAt);
    const chatDate = new Date(chat.updatedAt!);
    if (chatDate >= today) {
      groups.today.push(chat);
    } else if (chatDate >= yesterday) {
      groups.yesterday.push(chat);
    } else {
      groups.earlier.push(chat);
    }
  });

  return groups;
});

const handleSelectChat = (chatId: string) => {
  chatStore.selectChat(chatId);
  modalStore.closeSearchDialog();
};

const getTimeAgo = (date: string) => {
  // 将 UTC 时间转换为本地时间
  const localDate = new Date(date);

  return formatDistanceToNow(localDate, {
    addSuffix: true,
    locale: zhCN,
  });
};
</script>

<template>
  <Teleport to="body">
    <!-- 背景遮罩的过渡效果 -->
    <Transition
      enter-active-class="transition duration-100 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-75 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="modalStore.isSearchDialogOpen"
        class="fixed inset-0 z-40 bg-black/20"
        @click="handleClose"
      ></div>
    </Transition>

    <!-- 模态框内容的过渡效果 -->
    <Transition
      enter-active-class="transition duration-100 ease-out"
      enter-from-class="transform scale-95 opacity-0"
      enter-to-class="transform scale-100 opacity-100"
      leave-active-class="transition duration-75 ease-in"
      leave-from-class="transform scale-100 opacity-100"
      leave-to-class="transform scale-95 opacity-0"
    >
      <!-- Dialog 内容 -->
      <div
        v-if="modalStore.isSearchDialogOpen"
        class="fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%] gap-4 duration-200 bg-white dark:bg-[#2B2D31] rounded-3xl outline-none w-full md:w-5/6 lg:w-3/5 max-w-3xl flex flex-col h-[calc(100dvh-64px)] md:h-auto ring-1 ring-[#FFFFFF] dark:ring-[#1E1F22]"
        @keydown.escape="handleClose"
      >
        <div class="flex flex-col w-full">
          <!-- 搜索输入框 -->
          <div
            class="flex items-center gap-3 px-5 border-b border-[#EbECF0] dark:border-[#1E1F22] h-14"
          >
            <div class="flex items-center w-full gap-2">
              <input
                v-model="searchQuery"
                spellcheck="false"
                type="text"
                ref="searchInput"
                class="flex-grow w-full bg-transparent outline-none text-gray-800 dark:text-gray-200 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                :placeholder="t('search.placeholder')"
              />
              <button
                class="w-7 h-7 flex items-center justify-center rounded-full hover:bg-[#EBECF0] active:bg-[#DFE1E4] dark:hover:bg-[#4A4B4E]"
                @click="modalStore.closeSearchDialog"
              >
                <X class="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
          </div>

          <!-- 命令列表 -->
          <div
            class="h-[80dvh] md:h-[min(460px,calc(100dvh-56px-48px-32px))] overflow-auto p-3"
          >
            <!-- 今天的聊天 -->
            <div v-if="groupedChats.today.length > 0">
              <div class="text-gray-500 dark:text-gray-400 px-3 pb-1.5 pt-3">
                {{ t("search.today") }}
              </div>
              <div>
                <div
                  v-for="chat in groupedChats.today"
                  :key="chat.id"
                  class="h-[48px] rounded-2xl grid grid-cols-1 grid-rows-1 hover:bg-[#F4F4F4] dark:hover:bg-[#35373C]"
                >
                  <div
                    class="flex cursor-pointer h-[48px] items-center gap-2 px-3 col-start-1 col-end-2 row-start-1 row-end-2"
                    @click="handleSelectChat(chat.id)"
                  >
                    <div class="flex items-center gap-2 flex-grow min-w-0">
                      <div class="truncate text-gray-800 dark:text-gray-200">
                        {{ chat.title }}
                      </div>
                    </div>
                    <div
                      class="z-20 text-gray-500 dark:text-gray-400 whitespace-nowrap ml-2 hidden text-sm md:inline md:group-hover/item:hidden md:group-focus/item:hidden md:group-active/item:hidden"
                    >
                      {{ getTimeAgo(chat.updatedAt!) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 昨天的聊天 -->
            <div v-if="groupedChats.yesterday.length > 0">
              <div class="text-gray-500 dark:text-gray-400 px-3 pb-1.5 pt-3">
                {{ t("search.yesterday") }}
              </div>
              <div>
                <div
                  v-for="chat in groupedChats.yesterday"
                  :key="chat.id"
                  class="h-[48px] rounded-2xl grid grid-cols-1 grid-rows-1 hover:bg-[#F4F4F4] dark:hover:bg-[#35373C]"
                >
                  <div
                    class="flex cursor-pointer h-[48px] items-center gap-2 px-3 col-start-1 col-end-2 row-start-1 row-end-2"
                    @click="handleSelectChat(chat.id)"
                  >
                    <div class="flex items-center gap-2 flex-grow min-w-0">
                      <div class="truncate text-gray-800 dark:text-gray-200">
                        {{ chat.title }}
                      </div>
                    </div>
                    <div
                      class="z-20 text-gray-500 dark:text-gray-400 whitespace-nowrap ml-2 hidden text-sm md:inline md:group-hover/item:hidden md:group-focus/item:hidden md:group-active/item:hidden"
                    >
                      {{ getTimeAgo(chat.updatedAt!) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 更早的聊天 -->
            <div v-if="groupedChats.earlier.length > 0">
              <div class="text-gray-500 dark:text-gray-400 px-3 pb-1.5 pt-3">
                {{ t("search.earlier") }}
              </div>
              <div>
                <div
                  v-for="chat in groupedChats.earlier"
                  :key="chat.id"
                  class="h-[48px] rounded-2xl grid grid-cols-1 grid-rows-1 hover:bg-[#F4F4F4] dark:hover:bg-[#35373C]"
                >
                  <div
                    class="flex cursor-pointer h-[48px] items-center gap-2 px-3 col-start-1 col-end-2 row-start-1 row-end-2"
                    @click="handleSelectChat(chat.id)"
                  >
                    <div class="flex items-center gap-2 flex-grow min-w-0">
                      <div class="truncate text-gray-800 dark:text-gray-200">
                        {{ chat.title }}
                      </div>
                    </div>
                    <div
                      class="z-20 text-gray-500 dark:text-gray-400 whitespace-nowrap ml-2 hidden text-sm md:inline md:group-hover/item:hidden md:group-focus/item:hidden md:group-active/item:hidden"
                    >
                      {{ getTimeAgo(chat.updatedAt!) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 无搜索结果 -->
            <div
              v-if="searchQuery && !filteredChats.length"
              class="text-center text-gray-500 dark:text-gray-400 py-8"
            >
              {{ t("search.noChats") }}
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

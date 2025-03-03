<script setup lang="ts">
import {
  UserCircle2,
  Palette,
  Keyboard,
  Info,
  Server,
  Box,
  Search,
} from "lucide-vue-next";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

defineProps<{
  activeTab: string;
}>();

defineEmits<{
  (e: "update:activeTab", value: string): void;
}>();
</script>

<template>
  <div class="flex flex-col gap-1.5 pt-4 pl-3">
    <button
      class="flex items-center whitespace-nowrap cursor-pointer disabled:opacity-50 disabled:pointer-events-none rounded-xl text-sm font-medium group gap-3 px-4 justify-start h-10 hover:bg-[#EBECF0] active:bg-[#DFE1E4] dark:text-gray-200 dark:hover:bg-[#35373C] dark:active:bg-[#404249] min-w-40"
      :class="{ 'bg-[#EBECF0] dark:bg-[#35373C]': activeTab === 'account' }"
      @click="$emit('update:activeTab', 'account')"
    >
      <UserCircle2 class="w-4 h-4 text-gray-500 dark:text-gray-400" />
      {{ t("settings.sidebar.account") }}
    </button>
    <button
      class="flex items-center whitespace-nowrap cursor-pointer disabled:opacity-50 disabled:pointer-events-none rounded-xl text-sm font-medium group gap-3 px-4 justify-start h-10 hover:bg-[#EBECF0] active:bg-[#DFE1E4] dark:text-gray-200 dark:hover:bg-[#35373C] dark:active:bg-[#404249] min-w-40"
      :class="{ 'bg-[#EBECF0] dark:bg-[#35373C]': activeTab === 'appearance' }"
      @click="$emit('update:activeTab', 'appearance')"
    >
      <Palette class="w-4 h-4 text-gray-500 dark:text-gray-400" />
      {{ t("settings.sidebar.appearance") }}
    </button>
    <button
      class="flex items-center whitespace-nowrap cursor-pointer disabled:opacity-50 disabled:pointer-events-none rounded-xl text-sm font-medium group gap-3 px-4 justify-start h-10 hover:bg-[#EBECF0] active:bg-[#DFE1E4] dark:text-gray-200 dark:hover:bg-[#35373C] dark:active:bg-[#404249] min-w-40"
      :class="{ 'bg-[#EBECF0] dark:bg-[#35373C]': activeTab === 'shortcut' }"
      @click="$emit('update:activeTab', 'shortcut')"
    >
      <Keyboard class="w-4 h-4 text-gray-500 dark:text-gray-400" />
      {{ t("settings.sidebar.shortcut") }}
    </button>
    <button
      class="flex items-center whitespace-nowrap cursor-pointer disabled:opacity-50 disabled:pointer-events-none rounded-xl text-sm font-medium group gap-3 px-4 justify-start h-10 hover:bg-[#EBECF0] active:bg-[#DFE1E4] dark:text-gray-200 dark:hover:bg-[#35373C] dark:active:bg-[#404249] min-w-40"
      :class="{ 'bg-[#EBECF0] dark:bg-[#35373C]': activeTab === 'searcher' }"
      @click="$emit('update:activeTab', 'searcher')"
    >
      <Search class="w-4 h-4 text-gray-500 dark:text-gray-400" />
      {{ t("settings.sidebar.searcher") || "联网搜索" }}
    </button>
    <button
      class="flex items-center whitespace-nowrap cursor-pointer disabled:opacity-50 disabled:pointer-events-none rounded-xl text-sm font-medium group gap-3 px-4 justify-start h-10 hover:bg-[#EBECF0] active:bg-[#DFE1E4] dark:text-gray-200 dark:hover:bg-[#35373C] dark:active:bg-[#404249] min-w-40"
      :class="{ 'bg-[#EBECF0] dark:bg-[#35373C]': activeTab === 'provider' }"
      @click="$emit('update:activeTab', 'provider')"
    >
      <Server class="w-4 h-4 text-gray-500 dark:text-gray-400" />
      {{ t("settings.sidebar.provider") }}
    </button>
    <button
      class="flex items-center whitespace-nowrap cursor-pointer disabled:opacity-50 disabled:pointer-events-none rounded-xl text-sm font-medium group gap-3 px-4 justify-start h-10 hover:bg-[#EBECF0] active:bg-[#DFE1E4] dark:text-gray-200 dark:hover:bg-[#35373C] dark:active:bg-[#404249] min-w-40"
      :class="{ 'bg-[#EBECF0] dark:bg-[#35373C]': activeTab === 'model' }"
      @click="$emit('update:activeTab', 'model')"
    >
      <Box class="w-4 h-4 text-gray-500 dark:text-gray-400" />
      {{ t("settings.sidebar.model") }}
    </button>
    <button
      class="flex items-center whitespace-nowrap cursor-pointer disabled:opacity-50 disabled:pointer-events-none rounded-xl text-sm font-medium group gap-3 px-4 justify-start h-10 hover:bg-[#EBECF0] active:bg-[#DFE1E4] dark:text-gray-200 dark:hover:bg-[#35373C] dark:active:bg-[#404249] min-w-40"
      :class="{ 'bg-[#EBECF0] dark:bg-[#35373C]': activeTab === 'about' }"
      @click="$emit('update:activeTab', 'about')"
    >
      <Info class="w-4 h-4 text-gray-500 dark:text-gray-400" />
      {{ t("settings.sidebar.about") }}
    </button>
  </div>
</template>

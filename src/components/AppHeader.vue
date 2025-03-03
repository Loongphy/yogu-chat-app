<script setup lang="ts">
import { type } from "@tauri-apps/plugin-os";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { debounce } from "../utils/debounce";
import { useI18n } from "vue-i18n";
import {
  PanelLeftClose,
  Search,
  Settings,
  Sun,
  Moon,
  LogOut,
  User,
} from "lucide-vue-next";
import { ref, onMounted } from "vue";
import { invoke } from "@tauri-apps/api/core";
import { useSidebarStore } from "../stores/sidebarStore";
import DropDown from "./common/DropDown.vue";
import avatar from "../assets/avatar.jpg";
import { useThemeStore } from "../stores/themeStore";

const isFullscreen = ref(false);
const isMacOS = ref(false);
const showUserMenu = ref(false);
const sidebarStore = useSidebarStore();
const themeStore = useThemeStore();
const { t } = useI18n();

const checkFullscreen = async () => {
  const window = getCurrentWindow();
  isFullscreen.value = await window.isFullscreen();
};

const checkPlatform = async () => {
  const osType = type();
  console.log(osType);
  isMacOS.value = osType === "macos";
};

// 初始检查全屏状态
onMounted(async () => {
  await Promise.all([checkFullscreen(), checkPlatform()]);
  // 监听全屏状态变化
  const window = getCurrentWindow();
  await window.listen(
    "tauri://resize",
    debounce(async () => {
      await checkFullscreen();
    }, 150)
  );
});

const toggleTheme = () => {
  themeStore.updateTheme(
    document.documentElement.classList.contains("dark") ? "light" : "dark"
  );
};

const handleLogin = async () => {
  try {
    await invoke("web_auth");
  } catch (error) {
    console.error("登录失败:", error);
  }
};

const emit = defineEmits<{
  (e: "open-settings"): void;
  (e: "open-search"): void;
}>();
</script>

<template>
  <header
    data-tauri-drag-region
    class="z-100 h-[38px] pr-2 w-full bg-[#F7F8FA] dark:bg-[#2B2D30] border-b border-[#EbECF0] dark:border-[#1E1F22] select-none"
    :class="{
      'pl-[76px]': isMacOS && !isFullscreen,
      'pl-2': !isMacOS || isFullscreen,
    }"
  >
    <div class="pointer-events-none flex h-full items-center">
      <div class="pointer-events-auto flex items-center gap-1">
        <button
          class="w-7 h-7 rounded-md flex items-center justify-center hover:bg-[#EBECF0] active:bg-[#DFE1E4] dark:hover:bg-[#4A4B4E]"
          @click="sidebarStore.toggleSidebar"
        >
          <PanelLeftClose
            class="w-5 h-5 text-[#6E6E6E] dark:text-gray-400"
            :class="{ 'rotate-180': !sidebarStore.isExpanded }"
          />
        </button>
        <button
          class="w-7 h-7 rounded-md flex items-center justify-center hover:bg-[#EBECF0] active:bg-[#DFE1E4] dark:hover:bg-[#4A4B4E]"
          @click="toggleTheme"
        >
          <Sun
            class="w-5 h-5 text-[#6E6E6E] dark:text-gray-400 hidden dark:block"
          />
          <Moon
            class="w-5 h-5 text-[#6E6E6E] dark:text-gray-400 block dark:hidden"
          />
        </button>
      </div>
      <div
        class="pointer-events-none flex-1 flex items-center justify-center"
      ></div>
      <div class="pointer-events-auto flex items-center gap-2">
        <button
          class="hidden h-7 px-2 rounded-md select-none <!-- flex --> items-center justify-center hover:bg-[#EBECF0] active:bg-[#DFE1E4] dark:hover:bg-[#4A4B4E]"
          @click="handleLogin"
        >
          <span class="text-sm text-[#6E6E6E] dark:text-gray-400">{{
            t("header.login")
          }}</span>
        </button>
        <DropDown v-model="showUserMenu" placement="bottom-end">
          <template #trigger>
            <button
              class="relative block w-7 h-7 rounded-xl bg-gray-200 dark:bg-gray-600 flex-shrink-0 cursor-pointer overflow-hidden"
            >
              <img
                :src="avatar"
                alt="avatar"
                class="w-full h-full object-cover"
              />
              <div
                class="absolute inset-0 hover:bg-black/10 active:bg-black/20 dark:hover:bg-white/10 dark:active:bg-white/20"
              ></div>
            </button>
          </template>
          <div class="py-1">
            <button
              class="w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-[#EBECF0] active:bg-[#DFE1E4] dark:hover:bg-[#4A4B4E] flex items-center gap-2"
              @click="showUserMenu = false"
            >
              <User class="w-4 h-4 shrink-0" />
              <span class="truncate">{{ t("header.profile") }}</span>
            </button>
            <button
              class="w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-[#EBECF0] active:bg-[#DFE1E4] dark:hover:bg-[#4A4B4E] flex items-center gap-2"
              @click="showUserMenu = false"
            >
              <LogOut class="w-4 h-4 shrink-0" />
              <span class="truncate">{{ t("header.logout") }}</span>
            </button>
          </div>
        </DropDown>
        <button
          class="w-7 h-7 rounded-md flex items-center justify-center hover:bg-[#EBECF0] active:bg-[#DFE1E4] dark:hover:bg-[#4A4B4E]"
          @click="emit('open-search')"
        >
          <Search class="w-5 h-5 text-[#6E6E6E] dark:text-gray-400" />
        </button>
        <button
          class="w-7 h-7 rounded-md flex items-center justify-center hover:bg-[#EBECF0] active:bg-[#DFE1E4] dark:hover:bg-[#4A4B4E]"
          @click="emit('open-settings')"
        >
          <Settings class="w-5 h-5 text-[#6E6E6E] dark:text-gray-400" />
        </button>
      </div>
    </div>
  </header>
</template>

<style scoped></style>

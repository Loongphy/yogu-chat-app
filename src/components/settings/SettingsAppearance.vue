<script setup lang="ts">
import { Languages, ChevronDown, Sun, Moon, Monitor } from "lucide-vue-next";
import { useThemeStore } from "../../stores/themeStore";
import { useLanguageStore, type Language } from "../../stores/languageStore";
import DropDown from "../common/DropDown.vue";
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";

const themeStore = useThemeStore();
const languageStore = useLanguageStore();
const { t } = useI18n();

const languages = [
  { label: "简体中文", value: "zh-CN" as Language },
  { label: "English", value: "en-US" as Language },
  { label: "日本語", value: "ja-JP" as Language },
];

const currentLanguage = computed(
  () =>
    languages.find((lang) => lang.value === languageStore.language) ||
    languages[0]
);

const isLanguageDropdownOpen = ref(false);

const handleLanguageChange = (lang: (typeof languages)[0]) => {
  languageStore.updateLanguage(lang.value);
  isLanguageDropdownOpen.value = false;
};
</script>

<template>
  <div class="flex flex-col gap-6 px-3">
    <!-- 语言设置 -->
    <div class="flex flex-row items-center justify-between w-full gap-4">
      <div
        class="max-w-sm text-sm font-medium flex items-center gap-2 dark:text-gray-200"
      >
        {{ t("settings.appearance.language") }}
        <Languages class="w-4 h-4 text-gray-500 dark:text-gray-400" />
      </div>
      <div class="text-right min-w-24">
        <DropDown v-model="isLanguageDropdownOpen" placement="bottom-end">
          <template #trigger>
            <button
              class="group flex h-9 items-center justify-between whitespace-nowrap rounded-lg border border-gray-200 dark:border-[#404249] bg-transparent px-3 py-2 text-sm ring-offset-background hover:bg-gray-50 dark:hover:bg-[#2B2D31] disabled:cursor-not-allowed disabled:opacity-50 w-[180px] dark:text-gray-200"
            >
              {{ currentLanguage.label }}
              <ChevronDown class="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </button>
          </template>
          <div class="w-full py-1 max-h-40 overflow-y-auto">
            <button
              v-for="lang in languages"
              :key="lang.value"
              @click="handleLanguageChange(lang)"
              class="w-full px-4 py-2 text-sm text-left text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#35373C]"
              :class="{
                'bg-gray-50 dark:bg-[#35373C]':
                  currentLanguage.value === lang.value,
              }"
            >
              {{ lang.label }}
            </button>
          </div>
        </DropDown>
      </div>
    </div>

    <!-- 主题设置 -->
    <div class="flex flex-col gap-4">
      <div class="text-sm font-medium dark:text-gray-200">
        {{ t("settings.appearance.theme") }}
      </div>
      <div class="grid grid-cols-3 gap-2">
        <button
          class="flex flex-col items-center gap-2 p-3 rounded-xl border border-gray-200 dark:border-[#35373C] hover:bg-gray-50 dark:hover:bg-[#35373C] dark:bg-[#2B2D31] cursor-pointer"
          :class="{
            'bg-[#EBECF0] dark:bg-[#35373C]': themeStore.theme === 'light',
          }"
          @click="themeStore.updateTheme('light')"
        >
          <Sun class="w-5 h-5 text-gray-500 dark:text-gray-400" />
          <span class="text-sm dark:text-gray-200">{{
            t("settings.appearance.themes.light")
          }}</span>
        </button>
        <button
          class="flex flex-col items-center gap-2 p-3 rounded-xl border border-gray-200 dark:border-[#35373C] hover:bg-gray-50 dark:hover:bg-[#35373C] dark:bg-[#2B2D31] cursor-pointer"
          :class="{
            'bg-[#EBECF0] dark:bg-[#35373C]': themeStore.theme === 'dark',
          }"
          @click="themeStore.updateTheme('dark')"
        >
          <Moon class="w-5 h-5 text-gray-500 dark:text-gray-400" />
          <span class="text-sm dark:text-gray-200">{{
            t("settings.appearance.themes.dark")
          }}</span>
        </button>
        <button
          class="flex flex-col items-center gap-2 p-3 rounded-xl border border-gray-200 dark:border-[#35373C] hover:bg-gray-50 dark:hover:bg-[#35373C] dark:bg-[#2B2D31] cursor-pointer"
          :class="{
            'bg-[#EBECF0] dark:bg-[#35373C]': themeStore.theme === 'system',
          }"
          @click="themeStore.updateTheme('system')"
        >
          <Monitor class="w-5 h-5 text-gray-500 dark:text-gray-400" />
          <span class="text-sm dark:text-gray-200">{{
            t("settings.appearance.themes.system")
          }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

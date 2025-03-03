<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { useOS } from "../../composables/useOS";

const { t } = useI18n();
const { modifierKey } = useOS();
</script>

<template>
  <div class="flex flex-col gap-4 px-3">
    <div class="text-sm font-medium dark:text-gray-200">
      {{ t("settings.shortcut.title") }}
    </div>
    <div class="flex flex-col gap-3">
      <div class="flex items-center justify-between py-2">
        <div class="flex items-center gap-2">
          <span class="text-sm dark:text-gray-200">{{
            t("settings.shortcut.search")
          }}</span>
        </div>
        <div class="flex items-center gap-1">
          <kbd
            class="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-[#2B2D31] rounded border border-gray-200 dark:border-[#404249] dark:text-gray-300"
            >{{ modifierKey }}</kbd
          >
          <kbd
            class="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-[#2B2D31] rounded border border-gray-200 dark:border-[#404249] dark:text-gray-300"
            >K</kbd
          >
        </div>
      </div>
      <div class="flex items-center justify-between py-2">
        <div class="flex items-center gap-2">
          <span class="text-sm dark:text-gray-200">{{
            t("settings.shortcut.openSettings")
          }}</span>
        </div>
        <div class="flex items-center gap-1">
          <kbd
            class="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-[#2B2D31] rounded border border-gray-200 dark:border-[#404249] dark:text-gray-300"
            >{{ modifierKey }}</kbd
          >
          <kbd
            class="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-[#2B2D31] rounded border border-gray-200 dark:border-[#404249] dark:text-gray-300"
            >,</kbd
          >
        </div>
      </div>
    </div>
  </div>
</template>

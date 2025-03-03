<script setup lang="ts">
import { useI18n } from "vue-i18n";

const { t } = useI18n();
</script>

<template>
  <div class="flex flex-row items-center justify-between w-full gap-4 px-3">
    <div
      class="w-12 h-12 rounded-xl bg-gray-200 dark:bg-[#2B2D31] flex-shrink-0 overflow-hidden"
    >
      <img
        src="../../assets/avatar.jpg"
        alt="avatar"
        class="w-full h-full object-cover"
      />
    </div>
    <div class="flex flex-col gap-1">
      <div class="text-base font-medium dark:text-gray-100">子天</div>
      <div class="text-sm text-gray-500 dark:text-gray-400">zitian@ooo.ph</div>
    </div>
    <button
      class="ml-auto px-4 h-8 rounded-lg text-sm bg-[#EBECF0] hover:bg-[#DFE1E4] active:bg-[#D3D5D8] dark:bg-[#35373C] dark:text-gray-200 dark:hover:bg-[#404249] dark:active:bg-[#404249]"
    >
      {{ t("common.manage") }}
    </button>
  </div>
</template>

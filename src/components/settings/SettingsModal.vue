<script setup lang="ts">
import { X } from "lucide-vue-next";
import { useModalStore } from "../../stores/modalStore";
import { useI18n } from "vue-i18n";

const modalStore = useModalStore();
const { t } = useI18n();

const handleClose = () => {
  modalStore.closeSettingsModal();
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
        v-if="modalStore.isSettingsModalOpen"
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
      <!-- 模态框内容 -->
      <div
        v-if="modalStore.isSettingsModalOpen"
        class="fixed z-50 left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] duration-200 gap-2 bg-white dark:bg-[#2B2D31] ring-1 ring-[#FFFFFF] dark:ring-[#4A4B4E] rounded-3xl md:min-h-[420px] h-[calc(100dvh-64px)] md:h-3/5 md:w-[calc(100%-2rem)] max-w-3xl flex flex-col md:overflow-hidden"
        @keydown.escape="handleClose"
      >
        <!-- 头部 -->
        <div
          class="flex sm:text-left relative shrink-0 px-6 pt-5 pb-1 min-h-10 items-center justify-between"
        >
          <h2 class="font-medium text-xl text-left dark:text-white">
            {{ t("settings.title") }}
          </h2>
          <button
            class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#EBECF0] active:bg-[#DFE1E4] dark:hover:bg-[#4A4B4E]"
            @click="modalStore.closeSettingsModal"
          >
            <X class="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <!-- 内容区域 -->
        <slot />
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { X } from "lucide-vue-next";
import { watch } from "vue";

interface Props {
  isOpen: boolean;
  imageSrc: string;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: "close"): void;
}>();

const handleClose = () => {
  emit("close");
};

// 处理键盘事件
const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === "Escape") {
    handleClose();
  }
};

// 监听键盘事件
watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    } else {
      window.removeEventListener("keydown", handleKeyDown);
    }
  }
);
</script>

<template>
  <Teleport to="body">
    <!-- 背景遮罩层 -->
    <Transition>
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 bg-overlay backdrop-blur-[2px] duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
      ></div>
    </Transition>

    <Transition
      enter-active-class="duration-200 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]"
      leave-active-class="duration-200 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]"
    >
      <div
        v-if="isOpen"
        role="dialog"
        class="fixed left-[50%] top-[50%] z-50 grid translate-x-[-50%] translate-y-[-50%] gap-4 h-full w-full bg-transparent"
        style="pointer-events: auto"
        @click="handleClose"
      >
        <div class="flex flex-col items-center justify-center w-full h-full">
          <!-- 图片 -->
          <img
            :src="imageSrc"
            class="w-[94vw] max-h-[calc(100vh-10rem)] max-w-6xl cursor-pointer rounded-xl lg:w-fit object-contain"
            @click.stop
          />

          <!-- 关闭按钮 -->
          <div
            class="absolute flex-col justify-between hidden lg:flex end-3 inset-y-12"
          >
            <button
              @click="handleClose"
              class="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium leading-[normal] cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50 disabled:cursor-default [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:-mx-0.5 text-gray-900 dark:text-gray-100 bg-white/80 dark:bg-gray-800/80 hover:bg-button-ghost-hover dark:hover:bg-gray-700/80 h-10 w-10 rounded-full"
              type="button"
              aria-label="Close"
            >
              <X class="size-5" />
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

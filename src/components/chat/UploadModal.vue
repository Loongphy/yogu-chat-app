<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import { X, ImagePlus } from "lucide-vue-next";
import { useI18n } from "vue-i18n";
import { open } from "@tauri-apps/plugin-dialog";
import { listen, TauriEvent } from "@tauri-apps/api/event";

const { t } = useI18n();

// 定义props
defineProps<{
  isOpen: boolean;
  maxFileSize?: number; // 默认单位为MB
}>();

// 定义事件
const emit = defineEmits<{
  (e: "close"): void;
  (e: "upload", files: string[]): void;
}>();

// 处理文件选择
const handleFileSelect = async () => {
  try {
    const selectedFiles = await open({
      multiple: true,
      directory: false,
    });

    if (
      !selectedFiles ||
      (Array.isArray(selectedFiles) && selectedFiles.length === 0)
    ) {
      return; // 用户取消了选择
    }
    console.log(selectedFiles);
    emit("upload", selectedFiles);

    handleClose();
  } catch (error) {
    console.error("选择文件时出错:", error);
  }
};

// 处理拖放文件
const isDragging = ref(false);

// Tauri 文件拖放事件监听
let unlisten: (() => void) | null = null;

// 处理 Tauri 文件拖放事件
const handleFileDrop = (event: any) => {
  const droppedPaths = event.payload.paths;

  if (droppedPaths && droppedPaths.length > 0) {
    console.log(droppedPaths);
    // 发送文件路径
    emit("upload", droppedPaths);
    handleClose();
  }
};

// 设置和清理 Tauri 事件监听器
onMounted(async () => {
  try {
    unlisten = await listen(TauriEvent.DRAG_DROP, handleFileDrop);
  } catch (error) {
    console.error("设置文件拖放监听器时出错:", error);
  }
});

onBeforeUnmount(() => {
  if (unlisten) {
    unlisten();
  }
});

const handleDragOver = (event: DragEvent) => {
  event.preventDefault();
  isDragging.value = true;
};

const handleDragLeave = (event: DragEvent) => {
  event.preventDefault();
  isDragging.value = false;
};

const handleDrop = (event: DragEvent) => {
  event.preventDefault();
  isDragging.value = false;
};

// 关闭模态框
const handleClose = () => {
  emit("close");
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
        v-if="isOpen"
        class="fixed inset-0 z-40 bg-black/20 dark:bg-black/50"
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
        v-if="isOpen"
        role="dialog"
        class="fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%] duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] focus:outline-none focus:outline-0 focus-within:outline-0 gap-2 bg-white dark:bg-[#2B2D31] rounded-3xl w-full md:w-5/6 lg:w-3/5 max-w-3xl flex flex-col md:overflow-hidden px-6 pb-6 shadow-lg dark:shadow-[0_0_15px_rgba(0,0,0,0.3)]"
        @keydown.escape="handleClose"
      >
        <!-- 头部 -->
        <div
          class="flex flex-col space-y-1.5 text-center sm:text-left pt-5 pb-3 min-h-10"
        >
          <h2
            class="font-medium tracking-tight text-xl text-left text-gray-900 dark:text-gray-100"
          >
            {{ t("upload.title") || "附件" }}
          </h2>
          <p class="text-sm text-muted-foreground" hidden>添加附件</p>
        </div>

        <!-- 关闭按钮 -->
        <button
          class="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium leading-[normal] cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50 disabled:cursor-default [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:-mx-0.5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#35373C] h-10 w-10 rounded-xl absolute right-3.5 top-3.5 transition-colors"
          type="button"
          @click="handleClose"
        >
          <X class="lucide lucide-x" width="18" height="18" />
        </button>

        <!-- 内容区域 -->
        <div
          :class="[
            'border border-dashed rounded-2xl p-8 text-center transition-colors',
            isDragging
              ? 'border-gray-500 bg-gray-50 dark:bg-gray-900/20'
              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600',
          ]"
          @dragover="handleDragOver"
          @dragleave="handleDragLeave"
          @drop="handleDrop"
        >
          <div class="flex flex-col items-center gap-4">
            <div class="p-3 bg-gray-50 dark:bg-[#35373C] rounded-full">
              <ImagePlus class="h-6 w-6 text-gray-600 dark:text-gray-300" />
            </div>
            <div>
              <p class="font-medium text-gray-800 dark:text-gray-200">
                {{ isDragging ? "释放文件以上传" : "上传文件" }}
              </p>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                {{
                  isDragging
                    ? "松开鼠标完成上传"
                    : "拖放文件到此区域或点击下方按钮"
                }}
              </p>
            </div>
            <div class="flex gap-3">
              <button
                class="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium leading-[normal] cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#DFE1E4] dark:focus-visible:ring-[#35373C] disabled:opacity-50 disabled:cursor-default text-white bg-[#000000] dark:bg-[#404249] hover:bg-[#1E1F22] dark:hover:bg-[#35373C] active:bg-[#2B2D31] dark:active:bg-[#404249] border-0 h-9 rounded-lg px-4 py-2 transition-colors"
                type="button"
                @click="handleFileSelect"
              >
                选择文件
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

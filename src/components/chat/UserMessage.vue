<script setup lang="ts">
import { Pencil } from "lucide-vue-next";
import { ref, nextTick } from "vue";
import CopyButton from "../common/CopyButton.vue";
import { useI18n } from "vue-i18n";
import Tooltip from "../common/Tooltip.vue";
import { Message } from "../../stores/chatStore";
import { convertFileSrc } from "@tauri-apps/api/core";
import * as FileUtils from "../../utils/fileUtils";
import ImageLightbox from "../common/ImageLightbox.vue";

interface Props {
  message: Message;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: "update:content", value: string): void;
}>();

const { t } = useI18n();

const isEditing = ref(false);
const editingContent = ref("");
const textareaRef = ref<HTMLTextAreaElement | null>(null);

// Lightbox 相关状态
const isLightboxOpen = ref(false);
const currentLightboxImage = ref("");

const startEditing = () => {
  isEditing.value = true;
  editingContent.value = props.message.content;
  nextTick(() => {
    textareaRef.value?.focus();
  });
};

const cancelEditing = () => {
  isEditing.value = false;
  editingContent.value = "";
};

const saveEditing = () => {
  if (editingContent.value.trim()) {
    emit("update:content", editingContent.value);
  }
  cancelEditing();
};

// 获取图片预览URL
const getImagePreviewUrl = (path: string) => {
  try {
    return convertFileSrc(path);
  } catch (error) {
    console.error("获取图片预览失败:", error);
    return "";
  }
};

// 打开 Lightbox
const openLightbox = (imagePath: string) => {
  currentLightboxImage.value = getImagePreviewUrl(imagePath);
  isLightboxOpen.value = true;
};

// 关闭 Lightbox
const closeLightbox = () => {
  isLightboxOpen.value = false;
};
</script>

<template>
  <div
    class="relative group flex flex-col justify-center w-full max-w-3xl md:px-4 pb-2 gap-2 items-end"
  >
    <div
      class="rounded-3xl prose dark:prose-invert break-words text-primary min-h-7 prose-p:opacity-95 prose-strong:opacity-100 bg-gray-100 dark:bg-[#2A2B2E] border border-gray-200 dark:border-gray-600 max-w-[100%] sm:max-w-[90%] px-4 py-2.5 rounded-br-lg"
    >
      <div v-if="!isEditing" class="whitespace-pre-wrap">
        {{ props.message.content }}
      </div>
      <div class="flex flex-col w-full gap-2" v-else>
        <textarea
          ref="textareaRef"
          v-model="editingContent"
          class="w-screen max-w-[100%] bg-transparent focus:outline-none text-primary"
          :placeholder="t('chat.input.placeholder')"
          style="resize: none; height: 28px !important"
        ></textarea>
        <div class="flex flex-row justify-end w-full gap-2 p-1">
          <button
            @click="cancelEditing"
            class="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium leading-[normal] cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#DFE1E4] dark:focus-visible:ring-[#35373C] disabled:opacity-50 disabled:cursor-default text-gray-700 dark:text-gray-200 bg-transparent border border-transparent dark:border-[#1E1F22] hover:text-gray-800 dark:hover:text-gray-100 hover:bg-[#EBECF0] dark:hover:bg-[#35373C] active:bg-[#DFE1E4] dark:active:bg-[#404249] h-8 rounded-lg px-3 text-xs"
            type="button"
          >
            {{ t("common.cancel") }}
          </button>
          <button
            @click="saveEditing"
            class="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium leading-[normal] cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#DFE1E4] dark:focus-visible:ring-[#35373C] disabled:opacity-50 disabled:cursor-default text-white bg-[#000000] dark:bg-[#404249] hover:bg-[#1E1F22] dark:hover:bg-[#35373C] active:bg-[#2B2D31] dark:active:bg-[#404249] border-0 h-8 rounded-lg px-3 text-xs"
            type="button"
          >
            {{ t("common.save") }}
          </button>
        </div>
      </div>
    </div>
    <div
      v-if="props.message.files && props.message.files.length > 0"
      class="flex flex-row flex-wrap justify-end gap-2 mt-2"
    >
      <div
        v-for="(file, index) in props.message.files"
        :key="index"
        class="flex flex-row items-center rounded-xl px-3 h-10 bg-gray-100 dark:bg-[#2A2B2E] text-sm transition ease-in-out cursor-pointer hover:bg-gray-200 dark:hover:bg-[#35373C] text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600"
        data-state="closed"
        @click="FileUtils.isImageFile(file.path) && openLightbox(file.path)"
      >
        <!-- 图片缩略图或文件图标 -->
        <div
          v-if="FileUtils.isImageFile(file.path)"
          class="h-full w-10 mr-2 -ms-3 rounded-s-xl bg-cover bg-center shrink-0"
          :style="{
            backgroundImage: `url('${getImagePreviewUrl(file.path)}')`,
          }"
        ></div>
        <component
          v-else
          :is="FileUtils.getFileIcon(file.path)"
          class="!size-4 mr-2 shrink-0 text-gray-500 dark:text-gray-400"
        />
        <span class="truncate max-w-full sm:max-w-[250px]">{{
          FileUtils.getFileName(file.path)
        }}</span>
      </div>
    </div>
    <div
      v-if="!isEditing"
      class="flex items-center gap-[2px] w-max opacity-0 group-focus-within:opacity-100 group-hover:opacity-100 transition-opacity rounded-lg text-xs bg-background pb-2 px-2 end-4 -mr-2"
    >
      <Tooltip :content="t('common.edit')">
        <button
          @click="startEditing"
          class="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium leading-[normal] cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50 disabled:cursor-default text-gray-500 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 h-8 w-8 rounded-full"
        >
          <Pencil class="w-4 h-4" />
        </button>
      </Tooltip>
      <CopyButton :content="props.message.content" />
    </div>

    <!-- 图片 Lightbox -->
    <ImageLightbox
      :is-open="isLightboxOpen"
      :image-src="currentLightboxImage"
      @close="closeLightbox"
    />
  </div>
</template>

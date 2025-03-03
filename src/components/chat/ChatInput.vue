<script setup lang="ts">
import {
  Paperclip,
  ChevronDown,
  ArrowUp,
  Globe,
  Square,
  X,
} from "lucide-vue-next";
import DropDown from "../common/DropDown.vue";
import { ref, watch, computed } from "vue";
import { useI18n } from "vue-i18n";
import { useModelStore } from "../../stores/modelStore";
import { ModelStatus, type Model } from "../../services/ModelService";
import UploadModal from "./UploadModal.vue";
import { convertFileSrc } from "@tauri-apps/api/core";
import * as FileUtils from "../../utils/fileUtils";
import ImageLightbox from "../common/ImageLightbox.vue";

const props = defineProps<{
  input: string;
  isLoading: boolean;
  modelIdentifier: string | null;
  dropdownPlacement?: "top-end" | "bottom-end";
  isWebSearchEnabled?: boolean;
  attachments?: string[];
}>();

const emit = defineEmits<{
  (e: "submit", paths?: string[], isWebSearchEnabled?: boolean): void;
  (e: "stop"): void;
  (e: "update:input", value: string): void;
  (e: "update:modelIdentifier", value: string | null): void;
  (e: "update:isWebSearchEnabled", value: boolean): void;
  (e: "update:attachments", paths: string[]): void;
}>();

const showModelMenu = ref(false);
const inputValue = ref(props.input);
const isWebSearchEnabled = ref(props.isWebSearchEnabled || false);
const isComposing = ref(false);
const isUploadModalOpen = ref(false);
const selectedPaths = ref<string[]>([]);

const modelStore = useModelStore();
const { t } = useI18n();
const selectedModelIdentifier = ref<string | null>(
  props.modelIdentifier !== null
    ? props.modelIdentifier
    : modelStore.selectedModelIdentifier || "deepseek/deepseek-r1"
);

// 计算属性：获取所有活跃模型列表
const models = computed<Model[]>(() => {
  return modelStore.models.filter(
    (model) => model.status === ModelStatus.Active
  );
});

// 计算属性：获取当前选中的模型名称
const selectedModelName = computed(() => {
  if (!selectedModelIdentifier.value) return t("model.select");
  const model = modelStore.models.find(
    (m) => m.identifier === selectedModelIdentifier.value
  );
  return model ? model.name : t("model.select");
});

// 监听外部 input 变化
watch(
  () => props.input,
  (newValue) => {
    inputValue.value = newValue;
  }
);

// 监听 initialModelIdentifier 变化
watch(
  () => props.modelIdentifier,
  (newValue) => {
    if (newValue !== selectedModelIdentifier.value) {
      selectedModelIdentifier.value = newValue;
    }
  }
);

watch(inputValue, (newValue) => {
  emit("update:input", newValue);
});

// 监听 selectedModelIdentifier 变化，同步到父组件
watch(selectedModelIdentifier, (newValue) => {
  emit("update:modelIdentifier", newValue);
  if (newValue) {
    modelStore.selectModel(newValue);
  }
});

// 监听 isWebSearchEnabled 变化
watch(isWebSearchEnabled, (newValue) => {
  emit("update:isWebSearchEnabled", newValue);
});

const handleModelChange = (model: Model) => {
  if (model && model.identifier) {
    selectedModelIdentifier.value = model.identifier;
    showModelMenu.value = false;
  }
};

const handleSubmit = () => {
  if (
    (!inputValue.value.trim() && selectedPaths.value.length === 0) ||
    props.isLoading
  )
    return;

  // 准备要发送的文件路径
  const pathsToSend = [...selectedPaths.value];

  // 如果有选择的文件路径，发送路径信息
  if (selectedPaths.value.length > 0) {
    emit("update:attachments", pathsToSend);
    selectedPaths.value = [];
  }

  emit("submit", pathsToSend, isWebSearchEnabled.value);
};

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    handleSubmit();
  }
};

const handleStop = () => {
  emit("stop");
};

const toggleWebSearch = () => {
  isWebSearchEnabled.value = !isWebSearchEnabled.value;
};

const handleCompositionStart = () => {
  isComposing.value = true;
};

const handleCompositionEnd = () => {
  isComposing.value = false;
};

const openUploadModal = () => {
  isUploadModalOpen.value = true;
};

const closeUploadModal = () => {
  isUploadModalOpen.value = false;
};

const handleFileUpload = (paths: string[]) => {
  // 处理文件上传逻辑
  console.log("上传的文件路径:", paths);
  // 将文件路径添加到选择的文件路径列表
  selectedPaths.value = [...selectedPaths.value, ...paths];
};

// 删除上传的文件
const removeFile = (index: number) => {
  selectedPaths.value = selectedPaths.value.filter((_, i) => i !== index);
};

// 根据文件扩展名获取对应的图标组件
const getFileIcon = (path: string) => {
  return FileUtils.getFileIcon(path);
};

// 添加一个新的计算属性，用于检查文件是否为图片
const isImageFile = (path: string) => {
  return FileUtils.isImageFile(path);
};

// 添加一个函数来获取图片的本地预览URL
const getImagePreviewUrl = (path: string) => {
  try {
    // 使用 URL.createObjectURL 创建本地文件的预览URL
    // 这里假设 path 是一个本地文件路径，实际使用时可能需要调整
    return convertFileSrc(path);
  } catch (error) {
    console.error("获取图片预览失败:", error);
    return "";
  }
};

// 添加 Lightbox 相关状态
const isLightboxOpen = ref(false);
const currentLightboxImage = ref("");

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
  <div class="flex flex-row gap-2 justify-center w-full relative">
    <input class="hidden" multiple type="file" name="files" />
    <div
      class="duration-150 relative w-full max-w-[50rem] ring-1 ring-[#D1D5DB] dark:ring-[#404249] ring-inset bg-white dark:bg-[#2B2D31] @container/input hover:ring-[#B8BCC4] dark:hover:ring-[#4A4D55] hover:bg-[#FFFFFF] dark:hover:bg-[#2B2D31] focus-within:ring-1 focus-within:ring-[#B8BCC4] dark:focus-within:ring-[#4A4D55] hover:focus-within:ring-[#B8BCC4] dark:hover:focus-within:ring-[#4A4D55] pb-12 px-3 rounded-3xl"
    >
      <!-- 展示上传的文件列表 -->
      <div
        v-if="selectedPaths.length > 0"
        class="w-full flex flex-row gap-2 mt-3 flex-wrap whitespace-nowrap"
        style="opacity: 1; transform: none"
      >
        <div
          v-for="(path, index) in selectedPaths"
          :key="index"
          class="max-w-full"
          style="opacity: 1; transform: none"
        >
          <div
            class="flex flex-row items-center rounded-xl px-3 h-10 bg-[#F2F3F5] dark:bg-[#35373C] text-sm transition ease-in-out cursor-pointer hover:bg-[#E5E7EA] dark:hover:bg-[#404249] text-[#1E1F22] dark:text-[#EBEDF0] pr-1.5"
            data-state="closed"
            @click="isImageFile(path) && openLightbox(path)"
          >
            <!-- 图片缩略图或文件图标 -->
            <div
              v-if="isImageFile(path)"
              class="h-full w-10 mr-2 -ms-3 rounded-s-xl bg-cover bg-center shrink-0"
              :style="{ backgroundImage: `url('${getImagePreviewUrl(path)}')` }"
            ></div>
            <component
              v-else
              :is="getFileIcon(path)"
              class="!size-4 mr-2 shrink-0 text-[#5D6067] dark:text-[#B8BCC4]"
            />
            <!-- 文件名 -->
            <span class="truncate max-w-full sm:max-w-[250px]">{{
              path.split("/").pop()
            }}</span>
            <!-- 删除按钮 -->
            <button
              class="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium leading-[normal] cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#DFE1E4] dark:focus-visible:ring-[#35373C] disabled:opacity-50 disabled:cursor-default [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:-mx-0.5 text-[#5D6067] dark:text-[#B8BCC4] hover:bg-[#EBECF0] dark:hover:bg-[#404249] hover:text-[#1E1F22] dark:hover:text-[#EBEDF0] h-6 w-6 rounded-full ml-1 p-0.5"
              type="button"
              @click.stop="removeFile(index)"
            >
              <X width="16" height="16" />
            </button>
          </div>
        </div>
      </div>

      <div class="relative z-10">
        <span
          class="absolute px-3 py-5 text-gray-500 dark:text-gray-400 pointer-events-none"
          :class="{ hidden: inputValue.length > 0 || isComposing }"
        >
          {{ t("chat.input.placeholder") }}
        </span>
        <textarea
          v-model="inputValue"
          @keydown="handleKeyDown"
          @compositionstart="handleCompositionStart"
          @compositionend="handleCompositionEnd"
          class="w-full px-3 bg-transparent focus:outline-none text-gray-800 dark:text-gray-200 align-bottom min-h-14 pt-5 my-0 mb-5 resize-none"
        ></textarea>
      </div>
      <div
        class="flex gap-1.5 absolute inset-x-0 bottom-0 border-2 border-transparent p-3"
      >
        <button
          @click="openUploadModal"
          class="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium leading-[normal] cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#DFE1E4] dark:focus-visible:ring-[#35373C] disabled:opacity-50 disabled:cursor-default h-9 rounded-full py-2 relative px-2 transition-all duration-150 bg-transparent border border-[#EBECF0] dark:border-[#1E1F22] w-9 aspect-square text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-[#EBECF0] dark:hover:bg-[#35373C] active:bg-[#DFE1E4] dark:active:bg-[#404249]"
        >
          <Paperclip class="w-5 h-5" />
        </button>
        <div class="flex gap-1.5 grow">
          <div class="flex gap-1.5 grow">
            <button
              @click="toggleWebSearch"
              class="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium leading-[normal] cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#DFE1E4] dark:focus-visible:ring-[#35373C] disabled:opacity-50 disabled:cursor-default h-9 rounded-full py-2 relative px-2 transition-all duration-150 border"
              :class="[
                isWebSearchEnabled
                  ? 'bg-[#EBEDF0] dark:bg-[#404249] text-gray-800 dark:text-gray-200 border-[#DFE1E4] dark:border-[#35373C]'
                  : 'bg-transparent border-[#EBECF0] dark:border-[#1E1F22] text-gray-500 dark:text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 hover:bg-[#F7F8FA] dark:hover:bg-[#2B2D31] hover:border-[#E5E7EA] dark:hover:border-[#35373C]',
              ]"
            >
              <Globe class="w-5 h-5" />
              <span class="hidden @md:inline-block">{{
                t("chat.input.webSearch")
              }}</span>
            </button>
          </div>
          <div class="flex items-center">
            <DropDown
              v-model="showModelMenu"
              :placement="dropdownPlacement || 'bottom-end'"
              @open="
                modelStore.models.length === 0 && modelStore.loadActiveModels()
              "
            >
              <template #trigger>
                <button
                  class="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium leading-[normal] cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#DFE1E4] dark:focus-visible:ring-[#35373C] disabled:opacity-50 disabled:cursor-default text-gray-800 dark:text-gray-200 hover:bg-[#EBECF0] dark:hover:bg-[#35373C] active:bg-[#DFE1E4] dark:active:bg-[#404249] rounded-full px-3.5 py-2 flex-row pl-3 pr-2.5 h-9 sm:px-3 border border-[#EBECF0] dark:border-[#1E1F22] sm:border-0 max-w-[150px]"
                >
                  <span
                    class="text-gray-800 dark:text-gray-200 inline-block truncate max-w-[100px]"
                    >{{ selectedModelName }}</span
                  >
                  <ChevronDown
                    class="w-4 h-4 text-gray-500 dark:text-gray-400 shrink-0"
                  />
                </button>
              </template>
              <div class="py-1 max-h-40 overflow-y-auto max-w-[200px]">
                <button
                  v-for="model in models"
                  :key="model.identifier"
                  @click="handleModelChange(model)"
                  class="w-full truncate px-4 py-2 text-sm text-left text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#35373C]"
                  :class="{
                    'bg-gray-50 dark:bg-[#35373C]':
                      selectedModelIdentifier === model.identifier,
                  }"
                >
                  {{ model.name }}
                </button>
              </div>
            </DropDown>
          </div>
        </div>
        <div class="ml-auto flex flex-row items-end gap-1">
          <button
            v-if="!isLoading"
            :disabled="!inputValue.trim()"
            @click="handleSubmit"
            class="group flex flex-col justify-center rounded-full focus:outline-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#DFE1E4] dark:focus-visible:ring-[#35373C]"
          >
            <div
              class="h-9 relative aspect-square flex flex-col items-center justify-center rounded-full ring-1 ring-inset before:absolute before:inset-0 before:rounded-full before:bg-[#000000] dark:before:bg-[#404249] before:ring-0 before:transition-all duration-500 text-gray-100 ring-transparent before:[clip-path:circle(50%_at_50%_50%)] hover:before:bg-[#1E1F22] dark:hover:before:bg-[#35373C] active:before:bg-[#2B2D31] dark:active:before:bg-[#404249] group-hover:scale-110 group-active:scale-95 transition-transform will-change-transform"
            >
              <ArrowUp class="w-5 h-5 relative z-10 transform-gpu" />
            </div>
          </button>
          <button
            v-else
            @click="handleStop"
            class="group flex flex-col justify-center rounded-full focus:outline-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#DFE1E4] dark:focus-visible:ring-[#35373C]"
          >
            <div
              class="h-9 relative aspect-square flex flex-col items-center justify-center rounded-full ring-1 ring-inset before:absolute before:inset-0 before:rounded-full before:bg-[#000000] dark:before:bg-[#404249] before:ring-0 before:transition-all duration-500 text-gray-100 ring-transparent before:[clip-path:circle(50%_at_50%_50%)] hover:before:bg-[#1E1F22] dark:hover:before:bg-[#35373C] active:before:bg-[#2B2D31] dark:active:before:bg-[#404249] group-hover:scale-110 group-active:scale-95 transition-transform will-change-transform"
            >
              <Square class="w-4 h-4 relative z-10 transform-gpu" />
            </div>
          </button>
        </div>
      </div>
    </div>

    <!-- 上传文件模态框 -->
    <UploadModal
      :is-open="isUploadModalOpen"
      :max-file-size="10"
      @close="closeUploadModal"
      @upload="handleFileUpload"
    />

    <!-- 图片 Lightbox -->
    <ImageLightbox
      :is-open="isLightboxOpen"
      :image-src="currentLightboxImage"
      @close="closeLightbox"
    />
  </div>
</template>

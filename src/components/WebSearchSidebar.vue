<script setup lang="ts">
import { X } from "lucide-vue-next";
import { useSearchSidebarStore } from "../stores/searchSidebarStore";
import { ref, onMounted, nextTick, watch, computed } from "vue";
import { useI18n } from "vue-i18n";

const searchSidebarStore = useSearchSidebarStore();
const resultRefs = ref<HTMLElement[]>([]);
const { t } = useI18n();

const emit = defineEmits(["close"]);

// 关闭侧边栏的方法
const closeSidebar = () => {
  searchSidebarStore.hideSidebar();
  emit("close");
};

// 计算当前选中的结果索引
const currentIndex = computed(() => {
  if (!searchSidebarStore.currentId) return undefined;

  // 查找与当前 ID 匹配的结果索引
  return searchSidebarStore.searchResults.findIndex(
    (result) => result.source === searchSidebarStore.currentId
  );
});

// 滚动到当前选中的结果
const scrollToCurrentResult = async () => {
  const index = currentIndex.value;
  if (index !== undefined && index >= 0 && resultRefs.value[index]) {
    await nextTick();
    resultRefs.value[index]?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }
};

// 监听 currentId 的变化，滚动到相应位置
watch(() => searchSidebarStore.currentId, scrollToCurrentResult);

// 监听搜索结果的变化，滚动到相应位置
watch(() => searchSidebarStore.searchResults, scrollToCurrentResult);

// 组件挂载后滚动到当前选中的结果
onMounted(scrollToCurrentResult);
</script>

<template>
  <div
    v-if="searchSidebarStore.isVisible"
    class="h-dvh flex-shrink-0 max-w-[66%]"
    style="width: 400px"
  >
    <div class="relative h-full w-full">
      <div
        class="absolute z-10 start-0 top-0 bottom-0 w-2 cursor-col-resize border-l border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800"
      ></div>
      <div class="h-full p-0">
        <div
          class="max-h-[80dvh] md:max-h-none h-full flex flex-col w-full overflow-y-auto overflow-x-hidden"
        >
          <div
            class="flex flex-row items-center justify-between flex-shrink-0 w-full h-16 px-5 sticky top-0 bg-white dark:bg-[#1E1F22]"
          >
            <div class="flex flex-row gap-2 items-center max-w-[80%]">
              <div
                class="truncate text-sm overflow-hidden font-medium text-gray-900 dark:text-gray-100"
              >
                {{ t("search.results") }}
              </div>
            </div>
            <div class="flex justify-end items-center gap-2">
              <button
                @click="closeSidebar"
                class="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium leading-[normal] cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50 disabled:cursor-default text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 h-10 w-10 rounded-xl flex-shrink-0"
                type="button"
              >
                <X class="size-5" />
              </button>
            </div>
          </div>
          <div class="flex-grow w-full px-3 pb-6 h-fit overflow-y-visible">
            <!-- 搜索结果列表 -->
            <div class="flex flex-col items-center gap-2">
              <div
                class="w-full py-1 text-base text-gray-900 dark:text-gray-100"
                v-for="(result, index) in searchSidebarStore.searchResults"
                :key="index"
                :ref="el => { if (el) resultRefs[index] = el as HTMLElement }"
              >
                <a
                  :href="result.source"
                  target="_blank"
                  rel="noopener noreferrer"
                  :class="[
                    'block text-base hover:bg-gray-50 dark:hover:bg-[#2B2D30] rounded-xl focus:outline-none focus-within:outline-none focus-visible:ring-1 focus-visible:ring-ring',
                    {
                      'highlight-pulse':
                        String(index + 1) === searchSidebarStore.currentId,
                    },
                  ]"
                >
                  <div class="flex flex-col gap-1 px-4 py-3 max-w-full">
                    <span
                      class="text-sm font-semibold text-gray-900 dark:text-gray-100"
                      >{{ result.title }}</span
                    >
                    <p
                      class="text-sm line-clamp-3 text-gray-700 dark:text-gray-300"
                    >
                      {{ result.content }}
                    </p>
                    <div class="flex items-center gap-2">
                      <!-- <div
                        class="inline-flex align-text-bottom items-center justify-center select-none my-0 rounded-md opacity-100 ml-0"
                      >
                        <img
                          :src="result.favicon"
                          alt=""
                          class="size-[18px] m-0 rounded-md"
                        />
                      </div> -->
                      <span
                        class="text-xs text-gray-500 dark:text-gray-400 truncate flex-1"
                      >
                        {{ result.source }}
                      </span>
                    </div>
                  </div>
                </a>
              </div>

              <!-- 无搜索结果 -->
              <div
                v-if="searchSidebarStore.searchResults.length === 0"
                class="text-center text-gray-500 dark:text-gray-400 py-8"
              >
                {{ t("search.noResults") }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.highlight-pulse {
  position: relative;
  overflow: hidden;
}

.highlight-pulse::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(59, 130, 246, 0.08);
  border-radius: 0.75rem;
  animation: pulse 3s ease-in-out 2;
  pointer-events: none;
  z-index: 0;
}

.dark .highlight-pulse::after {
  background: rgba(96, 165, 250, 0.1);
}

@keyframes pulse {
  0% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.5;
  }
}
</style>

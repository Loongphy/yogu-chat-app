<script setup lang="ts">
import { ref } from "vue";
import Switch from "../common/Switch.vue";
import DropDown from "../common/DropDown.vue";
import { ChevronDown, Eye, EyeOff } from "lucide-vue-next";
import { useI18n } from "vue-i18n";
import { useSearcherStore } from "../../stores/searcherStore";

// 使用 i18n
const { t } = useI18n();

// 使用设置 store
const searcherStore = useSearcherStore();

// 搜索引擎下拉菜单状态
const isSearchEngineDropdownOpen = ref(false);

// 显示/隐藏 API Key
const showApiKey = ref(false);

// 搜索引擎选项
const searchEngineOptions = [
  { value: "tavily", label: "Tavily" },
  { value: "exa", label: "Exa" },
];

// 更新搜索引擎
const updateSearchEngine = async (engine: "tavily" | "exa") => {
  await searcherStore.updateSearchEngine(engine);
  isSearchEngineDropdownOpen.value = false;
};

// 更新 API 密钥
const updateApiKey = async () => {
  await searcherStore.updateApiKey(searcherStore.apiKey);
};

// 更新搜索结果数量
const updateSearchResultCount = async () => {
  // 确保结果数量在合理范围内
  let count = searcherStore.searchResultCount;
  if (count < 1) count = 1;
  if (count > 10) count = 10;

  await searcherStore.updateSearchResultCount(count);
};
</script>

<template>
  <div class="flex flex-col h-full">
    <div class="flex-1 overflow-y-auto px-4">
      <div class="space-y-6 py-4">
        <!-- 启用联网搜索 -->
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <label
              class="block text-sm font-medium text-gray-800 dark:text-gray-200"
            >
              {{ t("settings.searcher.enableWebSearch") }}
            </label>
            <Switch
              :model-value="searcherStore.webSearchEnabled"
              @update:model-value="searcherStore.updateWebSearchEnabled($event)"
            />
          </div>
          <div class="text-xs text-gray-500 dark:text-gray-300">
            {{ t("settings.searcher.enableWebSearchDesc") }}
          </div>
        </div>

        <!-- 联网搜索引擎 -->
        <div class="space-y-2">
          <label
            class="block text-sm font-medium text-gray-800 dark:text-gray-200"
          >
            {{ t("settings.searcher.searchEngine") }}
          </label>
          <DropDown
            v-model="isSearchEngineDropdownOpen"
            placement="bottom-start"
            :fullWidth="true"
          >
            <template #trigger>
              <div
                class="h-9 w-full rounded-md border border-[#DFE1E4] dark:border-[#4A4D52] bg-white dark:bg-[#2B2D31] px-3 py-2 text-sm transition-colors hover:border-[#C1C3C7] dark:hover:border-[#6D7175] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#DFE1E4] dark:focus-visible:ring-[#35373C] focus-visible:border-[#000000] dark:focus-visible:border-[#FFFFFF] disabled:opacity-50 flex items-center justify-start text-gray-800 dark:text-gray-200"
                :class="{
                  'opacity-50 cursor-not-allowed':
                    !searcherStore.webSearchEnabled,
                }"
                @click.stop="
                  searcherStore.webSearchEnabled &&
                    (isSearchEngineDropdownOpen = !isSearchEngineDropdownOpen)
                "
              >
                <span class="mr-auto">{{
                  searchEngineOptions.find(
                    (option) => option.value === searcherStore.searchEngine
                  )?.label
                }}</span>
                <ChevronDown class="w-4 h-4 text-gray-500 dark:text-gray-300" />
              </div>
            </template>
            <div
              class="w-full py-1 max-h-40 overflow-y-auto bg-white dark:bg-[#2B2D31] border border-[#DFE1E4] dark:border-[#4A4D52] rounded-md shadow-lg"
            >
              <button
                v-for="option in searchEngineOptions"
                :key="option.value"
                @click="updateSearchEngine(option.value as 'tavily' | 'exa')"
                class="block w-full px-4 py-2 text-sm text-left text-gray-800 dark:text-gray-200 hover:bg-[#EBECF0] dark:hover:bg-[#3E4045]"
                :class="{
                  'bg-[#EBECF0] dark:bg-[#3E4045]':
                    searcherStore.searchEngine === option.value,
                }"
                :disabled="!searcherStore.webSearchEnabled"
              >
                {{ option.label }}
              </button>
            </div>
          </DropDown>
        </div>

        <!-- API 秘钥 -->
        <div class="space-y-2">
          <label
            class="block text-sm font-medium text-gray-800 dark:text-gray-200"
          >
            {{ t("settings.searcher.apiKey") }}
          </label>
          <div class="relative">
            <input
              :type="showApiKey ? 'text' : 'password'"
              v-model="searcherStore.apiKey"
              @blur="updateApiKey"
              class="h-9 w-full pr-9 rounded-md border border-[#DFE1E4] dark:border-[#4A4D52] bg-white dark:bg-[#2B2D31] px-3 py-2 text-sm transition-colors hover:border-[#C1C3C7] dark:hover:border-[#6D7175] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#DFE1E4] dark:focus-visible:ring-[#35373C] focus-visible:border-[#000000] dark:focus-visible:border-[#FFFFFF] disabled:opacity-50 placeholder:text-gray-400 dark:placeholder:text-gray-400 text-gray-800 dark:text-gray-200"
              :placeholder="t('settings.searcher.apiKeyPlaceholder')"
              :disabled="!searcherStore.webSearchEnabled"
              :class="{
                'opacity-50 cursor-not-allowed':
                  !searcherStore.webSearchEnabled,
              }"
            />
            <button
              @click="showApiKey = !showApiKey"
              class="absolute right-0.5 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#EBECF0] dark:hover:bg-[#3E4045]"
              :disabled="!searcherStore.webSearchEnabled"
            >
              <Eye
                v-if="!showApiKey"
                class="w-4 h-4 text-gray-500 dark:text-gray-300"
              />
              <EyeOff v-else class="w-4 h-4 text-gray-500 dark:text-gray-300" />
            </button>
          </div>
          <div class="text-xs text-gray-500 dark:text-gray-300">
            {{ t("settings.searcher.apiKeyDesc") }}
          </div>
        </div>

        <!-- 搜索结果数量 -->
        <div class="space-y-2">
          <label
            class="block text-sm font-medium text-gray-800 dark:text-gray-200"
          >
            {{ t("settings.searcher.resultCount") }}
          </label>
          <input
            v-model.number="searcherStore.searchResultCount"
            type="number"
            min="1"
            max="10"
            @blur="updateSearchResultCount"
            class="h-9 w-full rounded-md border border-[#DFE1E4] dark:border-[#4A4D52] bg-white dark:bg-[#2B2D31] px-3 py-2 text-sm transition-colors hover:border-[#C1C3C7] dark:hover:border-[#6D7175] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#DFE1E4] dark:focus-visible:ring-[#35373C] focus-visible:border-[#000000] dark:focus-visible:border-[#FFFFFF] disabled:opacity-50 placeholder:text-gray-400 dark:placeholder:text-gray-400 text-gray-800 dark:text-gray-200"
            :disabled="!searcherStore.webSearchEnabled"
            :class="{
              'opacity-50 cursor-not-allowed': !searcherStore.webSearchEnabled,
            }"
          />
          <div class="text-xs text-gray-500 dark:text-gray-300">
            {{ t("settings.searcher.resultCountDesc") }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

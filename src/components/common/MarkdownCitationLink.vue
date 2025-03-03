<script setup lang="ts">
import { defineProps } from "vue";
import { WebSearchResult } from "../../services/WebSearchResultService";
import { useSearchSidebarStore } from "../../stores/searchSidebarStore";

const props = defineProps<{
  children: any;
  citations?: WebSearchResult[];
  dataId?: string;
}>();

const searchSidebarStore = useSearchSidebarStore();

const handleClick = () => {
  searchSidebarStore.showSidebar(props.citations ?? [], props.dataId);
};
</script>

<template>
  <button
    @click="handleClick"
    class="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium leading-[normal] cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#DFE1E4] dark:focus-visible:ring-[#35373C] disabled:opacity-50 disabled:cursor-default text-gray-700 dark:text-gray-300 bg-[#EBECF0] dark:bg-[#35373C] hover:bg-[#DFE1E4] dark:hover:bg-[#404249] active:bg-[#DFE1E4] dark:active:bg-[#404249] border-0 rounded-lg px-1 transition-colors duration-150"
  >
    {{ dataId }}
  </button>
</template>

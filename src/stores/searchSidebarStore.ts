import { defineStore } from "pinia";
import { ref } from "vue";
import { WebSearchResult as ServiceWebSearchResult } from "../services/WebSearchResultService";

// 为侧边栏定义的搜索结果类型
export interface WebSearchResult {
  title: string;
  content: string;
  source: string;
  favicon: string;
}

export const useSearchSidebarStore = defineStore("searchSidebar", () => {
  // 侧边栏是否可见
  const isVisible = ref(false);
  // 当前显示的搜索结果
  const searchResults = ref<WebSearchResult[]>([]);
  const currentId = ref<string | undefined>(undefined);
  // 显示侧边栏并设置搜索结果
  const showSidebar = (results: ServiceWebSearchResult[], id?: string) => {
    // 将服务中的 WebSearchResult 类型转换为侧边栏需要的 WebSearchResult 类型
    const formattedResults: WebSearchResult[] = results.map(result => ({
      title: result.title || "",
      content: result.text || "",
      source: result.url || "",
      favicon: result.favicon || ""
    }));
    
    searchResults.value = formattedResults;
    isVisible.value = true;
    currentId.value = id;
  };

  // 隐藏侧边栏
  const hideSidebar = () => {
    isVisible.value = false;
  };

  // 切换侧边栏可见性
  const toggleSidebar = () => {
    isVisible.value = !isVisible.value;
  };

  return {
    isVisible,
    currentId,
    searchResults,
    showSidebar,
    hideSidebar,
    toggleSidebar
  };
});
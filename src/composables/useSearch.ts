import { ref } from 'vue';
import Exa, { SearchResult as ExaSearchResult } from "exa-js";
import { tavily } from '@tavily/core';
import { useSearcherStore } from '../stores/searcherStore';

// 类型定义
// =========================================

/**
 * 搜索引擎类型
 */
export type SearchEngineType = 'exa' | 'tavily';

/**
 * 统一的搜索结果接口，兼容不同的搜索引擎
 */
export interface UnifiedSearchResult {
  // 基本信息
  title: string;           // 搜索结果标题
  url: string;             // 搜索结果URL
  text: string;            // 搜索结果内容文本
  
  // 元数据
  score?: number;          // 相关性得分
  publishedDate?: string;  // 发布日期
  source?: SearchEngineType; // 来源（如 "exa" 或 "tavily"）
  
  // 额外信息
  snippet?: string;        // 摘要或片段
  imageUrl?: string;       // 相关图片URL
  favicon?: string;        // 网站图标
  
  // 原始数据
  raw?: unknown;           // 原始搜索引擎返回的完整数据
}

/**
 * Tavily 搜索结果类型
 */
interface TavilySearchResult {
  title: string;
  url: string;
  content: string;
  score?: number;
  published_date?: string;
  [key: string]: any;
}

/**
 * 搜索选项配置
 */
export interface SearchOptions {
  onError?: (error: unknown, source: string) => void | Promise<void>;
  maxPreviousQueries?: number;
  previousQueries?: string[];
}

// 默认配置
// =========================================
const DEFAULT_OPTIONS: SearchOptions = {
  maxPreviousQueries: 3,
  previousQueries: []
};

// 工具函数
// =========================================

/**
 * 创建上下文查询
 * @param query 当前查询
 * @param previousQueries 历史查询
 * @param maxPreviousQueries 最大历史查询数量
 * @returns 带上下文的查询
 */
const createContextualQuery = (
  query: string, 
  previousQueries: string[], 
  maxPreviousQueries: number
): string => {
  if (previousQueries.length === 0) {
    return query;
  }
  
  const context = previousQueries
    .slice(-maxPreviousQueries)
    .map((q: string) => `Previous question: ${q}`)
    .join("\n");
    
  return `${context}\n\nNow answer the question: ${query}`;
};

/**
 * 处理搜索错误
 */
const handleSearchError = async (
  error: unknown, 
  source: string,
  onError?: (error: unknown, source: string) => void | Promise<void>
) => {
  console.error(`${source} error:`, error);
  if (onError) {
    await onError(error, source);
  }
};

/**
 * 更新查询历史
 */
const updateQueryHistory = (
  previousQueries: string[], 
  query: string, 
  maxPreviousQueries: number
): string[] => {
  return [...previousQueries, query].slice(-maxPreviousQueries);
};

// 主要搜索函数
// =========================================
export function useSearch(options: SearchOptions = {}) {
  // 合并选项与默认值
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
  const { maxPreviousQueries = 3, previousQueries: initialQueries = [] } = mergedOptions;
  
  // 引入 store
  const searcherStore = useSearcherStore();
  
  // 初始化 searcherStore 设置
  (async () => {
    await searcherStore.initSettings();
  })();
  
  // 搜索相关状态
  const previousQueries = ref<string[]>(initialQueries);
  const searchResults = ref<UnifiedSearchResult[]>([]);
  const isSearching = ref(false);

  /**
   * 执行 Exa 搜索
   */
  const performExaSearch = async (query: string): Promise<void> => {
    try {
      isSearching.value = true;
      
      // 创建上下文查询
      const contextualQuery = createContextualQuery(
        query, 
        previousQueries.value, 
        maxPreviousQueries
      );
      
      // 调用 Exa 搜索 API
      const exa = new Exa(searcherStore.apiKey);
      const searchResponse = await exa.searchAndContents(contextualQuery, {
        type: "auto",
        text: true,
        numResults: searcherStore.searchResultCount,
      });

      const results = searchResponse.results || [];

      // 格式化搜索结果
      searchResults.value = results.map((result: ExaSearchResult<{}>) => ({
        title: result.title || "",
        url: result.url,
        text: result.text,
        score: result.score,
        source: "exa",
        raw: result
      }));

      // 更新查询历史
      previousQueries.value = updateQueryHistory(
        previousQueries.value, 
        query, 
        maxPreviousQueries
      );
    } catch (error) {
      await handleSearchError(error, "Exa search", mergedOptions.onError);
    } finally {
      isSearching.value = false;
    }
  };

  /**
   * 执行 Tavily 搜索
   */
  const performTavilySearch = async (query: string): Promise<void> => {
    try {
      isSearching.value = true;
      
      // 创建 Tavily 客户端
      const tavilyClient = tavily({ apiKey: searcherStore.apiKey });
      
      // 创建上下文查询
      const contextualQuery = createContextualQuery(
        query, 
        previousQueries.value, 
        maxPreviousQueries
      );
      
      // 执行搜索
      const searchResponse = await tavilyClient.search(contextualQuery, {
        maxResults: searcherStore.searchResultCount,
      });
      const results: TavilySearchResult[] = searchResponse.results;

      // 格式化搜索结果
      searchResults.value = results.map((result: TavilySearchResult) => ({
        title: result.title || "",
        url: result.url,
        text: result.content,
        score: result.score,
        publishedDate: result.published_date,
        source: "tavily",
        raw: result
      }));

      // 更新查询历史
      previousQueries.value = updateQueryHistory(
        previousQueries.value, 
        query, 
        maxPreviousQueries
      );
    } catch (error) {
      await handleSearchError(error, "Tavily search", mergedOptions.onError);
    } finally {
      isSearching.value = false;
    }
  };

  /**
   * 执行搜索
   * @param query 搜索查询
   */
  const search = async (query: string): Promise<void> => {
    if (!query.trim()) {
      console.warn("搜索查询不能为空");
      return;
    }
    
    try {
      console.log("searcherStore.searchEngine", searcherStore.searchEngine);
      // 根据配置选择搜索引擎
      if (searcherStore.searchEngine === "exa") {
        await performExaSearch(query);
      } else if (searcherStore.searchEngine === "tavily") {
        await performTavilySearch(query);
      } else {
        throw new Error("未配置搜索引擎");
      }
    } catch (error) {
      await handleSearchError(error, "Search", mergedOptions.onError);
    }
  };

  /**
   * 清除搜索历史
   */
  const clearSearchHistory = (): void => {
    previousQueries.value = [];
  };

  /**
   * 清除搜索结果
   */
  const clearSearchResults = (): void => {
    searchResults.value = [];
  };

  return {
    // 状态
    searchResults,
    isSearching,
    previousQueries,
    
    // 方法
    search,
    clearSearchHistory,
    clearSearchResults
  };
}
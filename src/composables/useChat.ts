import { ref } from 'vue';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createOpenAI } from '@ai-sdk/openai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createXai } from '@ai-sdk/xai';
import { createDeepSeek } from '@ai-sdk/deepseek';
import { toast } from 'vue-sonner';

import { toCoreMessages } from "../utils/converter.ts";
import { streamText } from 'ai';
import { useModelStore } from '../stores/modelStore';
import { useProviderStore } from '../stores/providerStore';
import { Message } from '../stores/chatStore';
import { nanoid } from 'nanoid/non-secure';
import { WebSearchResult } from '../services/WebSearchResultService.ts';
import { useSearch, UnifiedSearchResult } from '../composables/useSearch.ts';


export interface UseChatOptions {
  id?: string;
  onFinish?: (message: Message) => void | Promise<void>;
  onError?: (error: unknown) => void | Promise<void>;
  initialMessages?: Message[];
}

export type ChatRequestOptions = {
  attachments?: string[];
  enableWebSearch?: boolean;
  searchQuery?: string;
}

export function useChat({
  id,
  onFinish,
  onError,
  initialMessages,
}: UseChatOptions = {}) {

  const chatId = id ?? nanoid();

  const messages = ref<Message[]>(initialMessages || []);
  const input = ref('');
  const modelIdentifier = ref<string>('');
  const status = ref<'idle' | 'streaming'>('idle');
  const abortController = ref<AbortController | null>(null);
  const files = ref<string[]>([]);
  // 引入 store
  const modelStore = useModelStore();
  const providerStore = useProviderStore();

  // 根据 modelIdentifier 获取 provider 和 client
  const getClientByModelIdentifier = (identifier: string) => {
    try {
      // 1. 查找模型
      const model = modelStore.models.find(m => m.identifier === identifier);
      if (!model) {
        const errorMsg = `找不到模型: ${identifier}`;
        throw new Error(errorMsg);
      }
      
      // 2. 查找模型关联的提供商
      const modelProviderLinks = modelStore.getModelProvidersByModelId(model.id);
      if (modelProviderLinks.length === 0) {
        const errorMsg = `模型 ${identifier} 没有关联的提供商`;
        throw new Error(errorMsg);
      }
      
      // 3. 获取第一个关联的提供商
      const providerId = modelProviderLinks[0].providerId;
      const provider = providerStore.providers.find(p => p.id === providerId);
      
      if (!provider) {
        const errorMsg = `找不到提供商: ${providerId}`;
        throw new Error(errorMsg);
      }
      
      // 4. 检查API密钥是否存在
      if (!provider.apiKey) {
        const errorMsg = `提供商 ${provider.name} 没有设置API密钥`;
        throw new Error(errorMsg);
      }
      
      // 5. 根据提供商协议创建对应的客户端
      const apiKey = provider.apiKey || '';
      const baseUrl = provider.baseUrl || '';
      
      switch (provider.protocol) {
        case 'OpenAI':
          return createOpenAI({
            apiKey,
            baseURL: baseUrl || undefined,
          });
        case 'Claude':
          return createAnthropic({
            apiKey,
            baseURL: baseUrl || undefined,
          });
        case 'DeepSeek':
          return createDeepSeek({
            apiKey,
            baseURL: baseUrl || undefined,
          });
        case 'Gemini':
          return createGoogleGenerativeAI({
            apiKey,
            baseURL: baseUrl || undefined,
          });
        case 'Grok':
          return createXai({
            apiKey,
            baseURL: baseUrl || undefined,
          });
        case 'OpenRouter':
          return createOpenRouter({
            apiKey,
            baseURL: baseUrl || undefined,
          });
        default:
          return createOpenAI({
            apiKey,
            baseURL: baseUrl || undefined,
          });
      }
    } catch (error: unknown) {
      // 将错误传递给上层处理
      throw error;
    }
  };

  // 提取的共同流处理逻辑
  const streamChatResponse = async (enableWebSearch: boolean = false, searchQuery?: string) => {
    status.value = 'streaming';

    const assistantMessage: Message = {
      id: nanoid(),
      role: 'assistant',
      content: '',
      chatId: chatId,
    };
    messages.value.push(assistantMessage);
    const lastMessage = messages.value[messages.value.length - 1];
    // 创建新的 AbortController
    abortController.value = new AbortController();

    // 判断是否需要 webSearch
    if (enableWebSearch && searchQuery) {
      try {
        // 使用 useSearch 进行网络搜索
        const { search, searchResults } = useSearch({
          onError: (error) => {
            console.error('Web search error:', error);
            if (onError) {
              onError(error);
            }
          },
          // 初始化 previousQueries：遍历消息历史，提取之前的搜索查询
          previousQueries: messages.value.reduce((queries: string[], msg, index) => {
            // 如果下一条消息是助手消息且有搜索结果，则当前用户消息被视为搜索查询
            const nextMsg = messages.value[index + 1];
            if (msg.role === 'user' && nextMsg && nextMsg.role === 'assistant' && nextMsg.webSearchResults && nextMsg.webSearchResults.length > 0) {
              queries.push(msg.content);
            }
            return queries;
          }, [])
        });

        // 执行搜索
        await search(searchQuery);
        
        // 将搜索结果转换为 WebSearchResult 格式
        const webSearchResults: WebSearchResult[] = searchResults.value.map((result: UnifiedSearchResult) => ({
          id: nanoid(),
          messageId: lastMessage.id || nanoid(),
          title: result.title,
          url: result.url,
          publishedDate: result.publishedDate,
          score: result.score,
          image: result.imageUrl,
          favicon: result.favicon,
          text: result.text
        }));
        
        console.log('webSearchResults: ', webSearchResults);
        lastMessage.webSearchResults = webSearchResults;
      } catch (error) {
        console.error('Web search error:', error);
        toast.error('Web 搜索失败: ' + (error instanceof Error ? error.message : '未知错误'));
        if (onError) {
          onError(error);
        }
      }
    }

    try {
      // 获取当前模型标识符对应的客户端
      const client: any = getClientByModelIdentifier(modelIdentifier.value);

      console.log('messages to send: ', messages.value);
      const coreMessages = await toCoreMessages(messages.value);
      console.log('core messages to send: ', coreMessages);
      // 准备streamText的选项
      const streamOptions: any = {
        model: client(modelIdentifier.value),
        messages: coreMessages,
        abortSignal: abortController.value.signal,
      };

      // 调用 streamText
      const { fullStream } = streamText(streamOptions);

      let lastType: "reasoning" | "text-delta" | null = null;
      // 处理 deepseek 的 reasoning 流
      let newContent = "";
      for await (const part of fullStream) {
        console.log('part: ', part);
        if (part.type === "reasoning" || part.type === "text-delta") {
          if (lastType !== "reasoning" && part.type === "reasoning") {
            newContent = newContent + "\n<think>\n";
          } else if (lastType === "reasoning" && part.type !== "reasoning") { 
            newContent = newContent + "\n</think>\n";
          }
          newContent = newContent + part.textDelta;
          lastType = part.type;
          messages.value[messages.value.length - 1] = {
            ...lastMessage,
            content: newContent
          };
        } else if (part.type === "error") {
          console.error('stream error: ', part.error);
          if (onError) {
            onError(part.error);
          }
        }
      }
      if (lastType === "reasoning") {
        newContent = newContent + "\n</think>\n";
      }
      messages.value[messages.value.length - 1] = {
        ...lastMessage,
        content: newContent
      };

      status.value = 'idle';
      // 调用 onFinish 回调
      if (onFinish) {
        await onFinish(messages.value[messages.value.length - 1]);
      }
    } catch (error) {
      console.error('Stream error:', error);
      
      // 如果是被用户主动中断的，不显示错误
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Stream aborted by user');
      } else {
        toast.error(error instanceof Error ? error.message : '生成回复失败，请重试');
        
        // 将错误传递给上层处理
        if (onError) {
          await onError(error);
        }
      }
      
      status.value = 'idle';
    }
  };

  const handleSubmit = async (
    options: ChatRequestOptions = {}
  ) => {
    try {
      const value = input.value.trim();
      if (!value) return;
      
      input.value = '';

      // 添加用户消息
      const userMessage: Message = {
        id: nanoid(),
        role: 'user',
        content: value,
        chatId: chatId,
        files: options.attachments?.map((file) => ({
          id: nanoid(),
          path: file,
        })) || [],
      };
      messages.value.push(userMessage);

      // 使用提取的共同流处理逻辑
      await streamChatResponse(options.enableWebSearch, options.searchQuery);
    } catch (error: unknown) {
      // 处理错误
      console.error('handleSubmit error:', error);
      toast.error(error instanceof Error ? error.message : '发送消息失败，请重试');
      if (onError) {
        await onError(error);
      }
      status.value = 'idle';
    }
  };

  const stop = () => {
    if (abortController.value) {
      abortController.value.abort();
      abortController.value = null;
    }
    status.value = 'idle';
  };

  const reload = async (options: ChatRequestOptions = {}) => {
    try {
      // 如果没有消息，无法重新加载
      if (messages.value.length === 0) return;

      // 找到最后一条用户消息
      let lastUserMessageIndex = messages.value.length - 1;
      while (lastUserMessageIndex >= 0 && messages.value[lastUserMessageIndex].role !== 'user') {
        lastUserMessageIndex--;
      }

      if (lastUserMessageIndex < 0) return;

      // 删除最后一条用户消息之后的所有消息
      messages.value = messages.value.slice(0, lastUserMessageIndex + 1);

      // 重新生成回复
      await streamChatResponse(options.enableWebSearch, options.searchQuery);
    } catch (error) {
      console.error('Reload error:', error);
      toast.error('重新生成回复失败: ' + (error instanceof Error ? error.message : '未知错误'));
      if (onError) {
        await onError(error);
      }
      status.value = 'idle';
    }
  };

  return {
    id: chatId,
    messages,
    input,
    files,
    modelIdentifier,
    status,
    handleSubmit,
    stop,
    reload,
  };
}
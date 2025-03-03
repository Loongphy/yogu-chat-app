import { defineStore } from "pinia";
import { ref } from "vue";
import { nanoid } from 'nanoid/non-secure';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { ChatService } from '../services/ChatService';
import { MessageService, Message as DbMessage } from '../services/MessageService';
import { WebSearchResult, WebSearchResultService } from '../services/WebSearchResultService';
import Database from '@tauri-apps/plugin-sql';

interface Message extends DbMessage {
  webSearchResults?: WebSearchResult[];
}

interface Chat {
  id: string;
  title: string;
  messages: Message[];
  modelIdentifier?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type { Message };

export const useChatStore = defineStore("chats", () => {
  const chats = ref<Chat[]>([]);
  const selectedChatId = ref<string | null>(null);
  const chatService = ref<ChatService | null>(null);
  const messageService = ref<MessageService | null>(null);
  const webSearchResultService = ref<WebSearchResultService | null>(null);

  // 初始化服务
  const initServices = async (db: Database) => {
    chatService.value = new ChatService(db);
    messageService.value = new MessageService(db);
    webSearchResultService.value = new WebSearchResultService(db);
    // 加载所有聊天
    const dbChats = await chatService.value.getAllChats();
    for (const chat of dbChats) {
      const messages = await messageService.value.getMessagesByChat(chat.id);
      // 获取所有消息的搜索结果
      const webSearchResultsMap = new Map<string, WebSearchResult[]>();
      if (messages.length > 0) {
        const webSearchResults = await webSearchResultService.value.mapWebSearchResultsByMessageIds(
          messages.map(m => m.id ?? '')
        );
        // 将搜索结果按消息ID分组
        Object.entries(webSearchResults).forEach(([messageId, results]) => {
          webSearchResultsMap.set(messageId, results); 
        });
      }
      chats.value.push({
        id: chat.id,
        title: chat.title,
        messages: messages.map(m => ({
          id: String(m.id),
          chatId: chat.id,
          role: m.role as 'user' | 'assistant' | 'system',
          content: m.content,
          files: m.files,
          webSearchResults: webSearchResultsMap.get(String(m.id)) || undefined
        })),
        modelIdentifier: chat.modelIdentifier,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt
      });
    }
  };

  const addChat = async (title: string, initialMessage?: Message, modelIdentifier?: string) => {
    const chatId = nanoid();
    const newChat: Chat = {
      id: chatId,
      title,
      messages: initialMessage ? [initialMessage] : [],
      modelIdentifier: modelIdentifier || 'default',
      createdAt: format(new Date(), 'yyyy-MM-dd HH:mm:ss', { locale: zhCN }),
      updatedAt: format(new Date(), 'yyyy-MM-dd HH:mm:ss', { locale: zhCN })
    };
    
    chats.value.unshift(newChat);
    selectedChatId.value = newChat.id;

    // 保存到数据库
    if (chatService.value) {
      await chatService.value.createChat({
        id: chatId,
        title,
        modelIdentifier: modelIdentifier || 'default'
      });

      // 如果有初始消息，保存消息
      if (initialMessage && messageService.value) {
        await messageService.value.createMessage({
          chatId: chatId,
          role: initialMessage.role,
          content: initialMessage.content,
          files: initialMessage.files
        });
      }
    }

    return chatId;
  };

  const deleteChat = async (id: string) => {
    const index = chats.value.findIndex(chat => chat.id === id);
    if (index !== -1) {
      chats.value.splice(index, 1);
      if (selectedChatId.value === id) {
        selectedChatId.value = null;
      }

      // 从数据库删除
      if (chatService.value) {
        await chatService.value.deleteChat(id);
        if (messageService.value) {
          await messageService.value.deleteMessagesByChatId(id);
        }
      }
    }
  };

  const updateChat = async (id: string, newTitle: string) => {
    const chat = chats.value.find(chat => chat.id === id);
    if (chat) {
      chat.title = newTitle;
      
      // 更新数据库
      if (chatService.value) {
        await chatService.value.updateChat(id, { title: newTitle });
      }
    }
  };

  const updateMessages = async (id: string, messages: Message[]) => {
    const chat = chats.value.find(chat => chat.id === id);
    if (chat) {
      chat.messages = messages;
      
      // 更新数据库中的消息
      if (messageService.value && webSearchResultService.value) {
        // 获取当前数据库中的消息
        const existingMessages = await messageService.value.getMessagesByChat(id);
        const existingIds = new Set(existingMessages.map(m => m.id));
        
        // 保存所有新消息到数据库
        for (const message of messages) {
          // 如果消息不存在于数据库中，则保存
          if (!existingIds.has(message.id)) {
            await messageService.value.createMessage({
              id: message.id,
              chatId: id,
              role: message.role,
              content: message.content,
              files: message.files
            });
            
            // 如果消息有搜索结果，则分别保存每个搜索结果
            if (message.webSearchResults && message.webSearchResults.length > 0) {
              await webSearchResultService.value.createWebSearchResult({
                id: nanoid(),
                messageId: message.id ?? '',
                content: message.webSearchResults
              });
            }
          }
        }
      }
    }
  };

  // 更新聊天的模型标识符
  const updateChatModelIdentifier = async (id: string, modelIdentifier: string) => {
    const chat = chats.value.find(chat => chat.id === id);
    if (chat) {
      chat.modelIdentifier = modelIdentifier;
      
      // 更新数据库
      if (chatService.value) {
        await chatService.value.updateChat(id, { modelIdentifier });
      }
    }
  };

  return {
    chats,
    selectedChatId,
    addChat,
    deleteChat,
    updateChat,
    selectChat: (id: string | null) => selectedChatId.value = id,
    updateMessages,
    updateChatModelIdentifier,
    getMessages: (id: string): Message[] => {
      const chat = chats.value.find(chat => chat.id === id);
      return chat ? chat.messages : [];
    },
    getChat: (id: string): Chat | undefined => {
      return chats.value.find(chat => chat.id === id);
    },
    getSelectedChat: (): Chat | undefined => {
      if (!selectedChatId.value) return undefined;
      return chats.value.find(chat => chat.id === selectedChatId.value);
    },
    initServices
  };
});
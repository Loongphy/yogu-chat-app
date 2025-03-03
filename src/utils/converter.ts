import { CoreMessage, CoreSystemMessage, CoreUserMessage, CoreAssistantMessage, FilePart, ImagePart } from "ai";
import { Message } from "../stores/chatStore";
import { convertFileSrc } from "@tauri-apps/api/core";
import { WebSearchResult } from "../services/WebSearchResultService";
import { getMimeType, isImageFile } from "./fileUtils";

// 通用函数将URL转换为base64
async function urlToBase64(url: string, fileType: 'image' | 'file' = 'file'): Promise<string> {
  try {
    // 使用 fetch 获取内容
    const response = await fetch(url);
    const blob = await response.blob();
    
    // 使用 FileReader 将 blob 转换为 base64
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result); // 返回 data:mime/xxx;base64,xxx 格式
        } else {
          reject(new Error(`无法将${fileType === 'image' ? '图片' : '文件'}转换为 base64 字符串`));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error(`获取${fileType === 'image' ? '图片' : '文件'}并转换为 base64 失败:`, error);
    throw error;
  }
}

const formatSearchResultsToText = (results: WebSearchResult[]) => {
    let formattedResults = "";
    if (results && results.length > 0) {
        results.forEach((result, index) => {
        formattedResults += `[webpage ${index + 1} begin]\n`;
        formattedResults += `Title: ${result.title}\n`;
        formattedResults += `URL: ${result.url}\n`;
        formattedResults += `Content: ${result.text}\n`;
        formattedResults += `[webpage ${index + 1} end]\n\n`;
        });
    } else {
        formattedResults = "No search results found.";
    }
    return formattedResults;
};

const createSystemMessageFromSearchResults = (formattedResults: string, currentDate: string) => {
    return `# The following contents are the search results related to the user's message:

${formattedResults}

In the search results I provide to you, each result is formatted as [webpage X begin]...[webpage X end], where X represents the numerical index of each article. Please cite the context at the end of the relevant sentence when appropriate. Use the citation format [citation:X] in the corresponding part of your answer. If a sentence is derived from multiple contexts, list all relevant citation numbers, such as [citation:3][citation:5]. Be sure not to cluster all citations at the end; instead, include them in the corresponding parts of the answer.
When responding, please keep the following points in mind:
- Today is ${currentDate}.
- Not all content in the search results is closely related to the user's question. You need to evaluate and filter the search results based on the question.
- For listing-type questions (e.g., listing all flight information), try to limit the answer to 10 key points and inform the user that they can refer to the search sources for complete information. Prioritize providing the most complete and relevant items in the list. Avoid mentioning content not provided in the search results unless necessary.
- For creative tasks (e.g., writing an essay), ensure that references are cited within the body of the text, such as [citation:3][citation:5], rather than only at the end of the text. You need to interpret and summarize the user's requirements, choose an appropriate format, fully utilize the search results, extract key information, and generate an answer that is insightful, creative, and professional. Extend the length of your response as much as possible, addressing each point in detail and from multiple perspectives, ensuring the content is rich and thorough.
- If the response is lengthy, structure it well and summarize it in paragraphs. If a point-by-point format is needed, try to limit it to 5 points and merge related content.
- For objective Q&A, if the answer is very brief, you may add one or two related sentences to enrich the content.
- Choose an appropriate and visually appealing format for your response based on the user's requirements and the content of the answer, ensuring strong readability.
- Your answer should synthesize information from multiple relevant webpages and avoid repeatedly citing the same webpage.
- Unless the user requests otherwise, your response should be in the same language as the user's question.
`;
};

export async function toCoreMessages(messages: Message[]): Promise<CoreMessage[]> {
    const coreMessages: CoreMessage[] = [];
    
    for (const message of messages) {
        // 根据角色创建不同类型的 CoreMessage
        if (message.role === 'system') {
            coreMessages.push({
                role: 'system',
                content: message.content
            } as CoreSystemMessage);
        } else if (message.role === 'user') {
            if (message.files && message.files.length > 0) {
                const files = message.files || []; // 确保 files 不为 undefined
                const contentParts = [];
                
                // 添加文本内容
                contentParts.push({
                    type: "text",
                    text: message.content
                });
                
                // 处理文件
                for (const file of files) {
                    const filePath = file.path;
                    const fileUrl = convertFileSrc(filePath);
                    
                    if (isImageFile(filePath)) {
                        // 处理图片文件
                        contentParts.push({
                            type: "image",
                            image: await urlToBase64(fileUrl, 'image')
                        } as ImagePart);
                    } else {
                        // 处理其他类型的文件
                        contentParts.push({
                            type: "file",
                            data: await urlToBase64(fileUrl, 'file'),
                            mimeType: getMimeType(filePath)
                        } as FilePart);
                    }
                }
                
                coreMessages.push({
                    role: 'user',
                    content: contentParts
                } as CoreUserMessage);
            } else {
                coreMessages.push({
                    role: 'user',
                    content: message.content
                } as CoreUserMessage);
            }
        } else if (message.role === 'assistant') {
            if (message.webSearchResults && message.webSearchResults.length > 0) {
                const systemMessage = createSystemMessageFromSearchResults(
                    formatSearchResultsToText(message.webSearchResults),
                    new Date().toLocaleDateString()
                );
                coreMessages.push({
                    role: 'system',
                    content: systemMessage
                } as CoreSystemMessage);
            }
            if (message.content) {
                coreMessages.push({
                    role: 'assistant',
                    content: message.content
                } as CoreAssistantMessage);
            }
        } else {
            // 默认情况，应该不会发生
            coreMessages.push({
                role: 'user',
                content: message.content
            } as CoreUserMessage);
        }
    }
    
    return coreMessages;
}
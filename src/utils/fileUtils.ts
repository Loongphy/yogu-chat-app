import {
  FileImage,
  FileVideo,
  FileAudio,
  FileCode,
  FileJson,
  FileSpreadsheet,
  File,
  FileArchive,
  FileMusic,
  FileTerminal,
  FilePen,
  FileType,
  FileText,
} from "lucide-vue-next";

/**
 * 根据文件扩展名获取对应的MIME类型
 * @param filePath 文件路径
 * @returns MIME类型字符串
 */
export function getMimeType(filePath: string): string {
  const extension = filePath.split('.').pop()?.toLowerCase() || '';
  const mimeTypes: Record<string, string> = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'svg': 'image/svg+xml',
    'pdf': 'application/pdf',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'xls': 'application/vnd.ms-excel',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'ppt': 'application/vnd.ms-powerpoint',
    'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'txt': 'text/plain',
    'csv': 'text/csv',
    'json': 'application/json',
    'xml': 'application/xml',
    'zip': 'application/zip',
    'rar': 'application/x-rar-compressed',
    'mp3': 'audio/mpeg',
    'mp4': 'video/mp4',
    'avi': 'video/x-msvideo',
    'mov': 'video/quicktime',
  };
  
  return mimeTypes[extension] || 'application/octet-stream';
}

/**
 * 检查文件是否为图片
 * @param filePath 文件路径
 * @returns 是否为图片文件
 */
export function isImageFile(filePath: string): boolean {
  const extension = filePath.split('.').pop()?.toLowerCase() || '';
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'];
  return imageExtensions.includes(extension);
}

/**
 * 从文件路径中提取文件名
 * @param path 文件路径
 * @returns 文件名
 */
export function getFileName(path: string): string {
  return path.split("/").pop() || path;
}

/**
 * 根据文件扩展名获取对应的图标组件
 * @param path 文件路径
 * @returns 对应的图标组件
 */
export function getFileIcon(path: string) {
  const extension = path.split(".").pop()?.toLowerCase() || "";

  // 图片文件
  if (["jpg", "jpeg", "png", "gif", "bmp", "svg", "webp"].includes(extension)) {
    return FileImage;
  }

  // 视频文件
  if (["mp4", "webm", "avi", "mov", "wmv", "flv", "mkv"].includes(extension)) {
    return FileVideo;
  }

  // 音频文件
  if (["mp3", "wav", "ogg", "flac", "aac", "m4a"].includes(extension)) {
    return FileAudio;
  }

  // 音乐文件
  if (["midi", "mid"].includes(extension)) {
    return FileMusic;
  }

  // 代码文件
  if (
    [
      "js",
      "ts",
      "jsx",
      "tsx",
      "html",
      "css",
      "scss",
      "less",
      "php",
      "py",
      "java",
      "c",
      "cpp",
      "cs",
      "go",
      "rb",
      "swift",
      "kt",
    ].includes(extension)
  ) {
    return FileCode;
  }

  // 终端/脚本文件
  if (["sh", "bash", "zsh", "bat", "cmd", "ps1"].includes(extension)) {
    return FileTerminal;
  }

  // PDF文件
  if (extension === "pdf") {
    return FileText;
  }

  // JSON文件
  if (extension === "json") {
    return FileJson;
  }

  // 电子表格文件
  if (["xlsx", "xls", "csv", "ods"].includes(extension)) {
    return FileSpreadsheet;
  }

  // 文本文件
  if (["txt", "md", "rtf", "log"].includes(extension)) {
    return FileText;
  }

  // 字体文件
  if (["ttf", "otf", "woff", "woff2", "eot"].includes(extension)) {
    return FileType;
  }

  // 压缩文件
  if (["zip", "rar", "7z", "tar", "gz", "bz2"].includes(extension)) {
    return FileArchive;
  }

  // 文档文件
  if (["doc", "docx", "odt", "pages"].includes(extension)) {
    return FilePen;
  }

  // XML文件
  if (["xml", "svg", "xaml"].includes(extension)) {
    return FileCode;
  }

  // 默认文件图标
  return File;
} 
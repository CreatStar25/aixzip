// src/config/tools.ts

// ✨ 确保这里包含了 'ja' 以及其他所有您需要的语种代码
export const locales = [
  'en', 'zh-cn', 'zh-tw', 'es', 'ar', 'pt', 'id', 'ms', 
  'fr', 'ru', 'hi', 'ja', 'de', 'ko', 'tr', 'vi', 
  'th', 'it', 'fa', 'nl', 'pl', 'sv', 'uk', 'ro'
];

export const tools = [
  { id: 'gemini-remove-waterprint', category: 'image' },
  { id: 'image-compressor', category: 'image' },
  { id: 'image-editor', category: 'image' },
  { id: 'image-resizer', category: 'image' },
  { id: 'image-converter', category: 'image' },
  { id: 'pdf-to-image', category: 'pdf' },
  { id: 'zip-creator', category: 'file' },
  // ... 更多工具
];
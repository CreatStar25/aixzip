// src/config/tools.ts

// ✨ 确保这里包含了 'ja' 以及其他所有您需要的语种代码
export const locales = [
  'en', 'zh-cn', 'zh-tw', 'es', 'ar', 'pt', 'id', 'ms', 
  'fr', 'ru', 'hi', 'ja', 'de', 'ko', 'tr', 'vi', 
  'th', 'it', 'fa', 'nl', 'pl', 'sv', 'uk', 'ro', 'ur'
];

export const tools = [
  { id: 'gemini-remove-waterprint', category: 'image', icon: 'fa-wand-magic-sparkles' },
  { id: 'image-compressor', category: 'image', icon: 'fa-compress' },
  { id: 'image-editor', category: 'image', icon: 'fa-crop-simple' },
  { id: 'image-resizer', category: 'image', icon: 'fa-expand' },
  { id: 'image-converter', category: 'image', icon: 'fa-rotate' },
  { id: 'pdf-to-image', category: 'pdf', icon: 'fa-file-pdf' },
  { id: 'zip-creator', category: 'file', icon: 'fa-file-zipper' },
];
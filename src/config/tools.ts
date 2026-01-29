// 定义工具的元数据结构
export interface ToolConfig {
  id: string;          // URL 中的工具名，如 'gemini-remove-waterprint'
  category: 'image' | 'pdf' | 'file'; // URL 中的分类，如 'image'
  icon: string;        // 菜单图标
}

// 注册所有工具
export const tools: ToolConfig[] = [
  // --- 图片工具 ---
  {
    id: 'gemini-remove-waterprint',
    category: 'image',
    icon: 'fa-wand-magic-sparkles'
  },
  {
    id: 'image-compressor',
    category: 'image',
    icon: 'fa-compress'
  },
  {
    id: 'image-cropper',
    category: 'image',
    icon: 'fa-crop'
  },
  
  // --- PDF 工具 ---
  {
    id: 'word-to-pdf',
    category: 'pdf',
    icon: 'fa-file-word'
  },
  {
    id: 'pdf-to-image',
    category: 'pdf',
    icon: 'fa-file-pdf'
  },

  // --- 文件工具 ---
  {
    id: 'zip-creator',
    category: 'file',
    icon: 'fa-file-zipper'
  }
];

// 定义支持的语言列表 (你的24种语言)
export const locales = ['en', 'zh-cn', 'zh-tw', 'es', 'ar', /* ...其他语言 */ ];
// src/i18n/ui.ts

export const navData = {
  en: {
    image: { 
      title: "Image Tools", 
      items: [
        { name: "Watermark Remover", href: "/image/gemini-remove-waterprint" },
        // ✨ 改名：体现裁剪(Resize)和压缩
        { name: "Resize & Compress", href: "/image/image-compressor" }
      ] 
    },
    pdf: { 
      title: "PDF Tools", 
      items: [
        { name: "PDF to Image", href: "/pdf/pdf-to-image" }
      ] 
    },
    file: { 
      title: "File Tools", 
      items: [
        { name: "Create ZIP", href: "/file/zip-creator" }
      ] 
    }
  },
  'zh-cn': {
    image: { 
      title: "图片工具", 
      items: [
        { name: "智能去水印", href: "/zh-cn/image/gemini-remove-waterprint" },
        // ✨ 改名
        { name: "图片裁剪压缩", href: "/zh-cn/image/image-compressor" }
      ] 
    },
    pdf: { 
      title: "PDF 工具", 
      items: [
        { name: "PDF 转图片", href: "/zh-cn/pdf/pdf-to-image" }
      ] 
    },
    file: { 
      title: "文件工具", 
      items: [
        { name: "创建 ZIP", href: "/zh-cn/file/zip-creator" }
      ] 
    }
  }
};

export const ui = {
  en: {
    // ... (保留通用翻译) ...
    'site.title': 'AIxZIP',
    'site.seo_keywords': 'Free AI Tools, PDF Tools, Image Tools, File Converters',
    'hero.title': 'Free Online AI Tools & File Converter',
    'hero.subtitle': '100% Client-side processing. No file uploads to server. Secure, Fast, and Free.',
    'hero.search_placeholder': 'Search tools (e.g. "Watermark", "PDF")',
    'section.all': 'All Tools',
    'footer.desc': 'Free online tools to convert, compress, and edit your files.',
    'footer.rights': 'All rights reserved.',
    'footer.col.pdf': 'PDF Tools', 'footer.col.image': 'Image Tools', 'footer.col.company': 'Company', 'footer.col.lang': 'International',
    'footer.link.about': 'About Us', 'footer.link.privacy': 'Privacy Policy', 'footer.link.terms': 'Terms of Service',
    'breadcrumb.home': 'Home',

    // --- Gemini 去水印 (保留) ---
    'tool.gemini-remove-waterprint.title': 'Gemini AI Watermark Remover',
    'tool.gemini-remove-waterprint.desc': 'Remove watermarks instantly with AI.',
    // ...

    // ==========================================
    // ✨ Image Compressor 专属翻译
    // ==========================================
    'tool.image-compressor.title': 'Image Resizer & Compressor',
    'tool.image-compressor.desc': 'Batch resize by pixels or percentage. Smart compression support.',
    
    // SaaS 介绍
    'steps.compress.1.title': 'Upload Images',
    'steps.compress.1.desc': 'Drag & drop multiple images.',
    'steps.compress.2.title': 'Resize Options',
    'steps.compress.2.desc': 'Choose between Pixels or Percentage. Set constraints.',
    'steps.compress.3.title': 'Compress & Download',
    'steps.compress.3.desc': 'Adjust quality and download as ZIP.',
    
    'feat.compress.1.title': 'Flexible Resizing',
    'feat.compress.1.desc': 'Resize by exact pixels or percentage scale. Supports "Do not enlarge".',
    'feat.compress.2.title': 'Smart Compression',
    'feat.compress.2.desc': 'Reduce file size efficiently while maintaining aspect ratio.',
    'feat.compress.3.title': 'Batch Processing',
    'feat.compress.3.desc': 'Process hundreds of images locally in your browser.',

    'faq.compress.q1': 'Can I prevent small images from being upscaled?',
    'faq.compress.a1': 'Yes, just check the "Do not enlarge" option.',
    'faq.compress.q2': 'Does it support bulk processing?',
    'faq.compress.a2': 'Yes, unlimited local batch processing.',

    'testi.compress.1.text': 'Great for resizing photos for my blog. The percentage option is very handy.',
    'testi.compress.1.author': 'Emily R., Blogger',
  },

  'zh-cn': {
    // ... (保留通用翻译) ...
    'site.title': 'AIxZIP',
    'site.seo_keywords': '免费 AI 工具、PDF 工具、图片处理及文件格式转换',
    'hero.title': '免费在线 AI 工具箱 & 文件转换器',
    'hero.subtitle': '100% 纯前端处理。文件不上传服务器。安全、快速、免费。',
    'hero.search_placeholder': '搜索工具 (例如 "去水印", "PDF")',
    'section.all': '所有工具',
    'footer.desc': '免费的在线工具，用于转换、压缩和编辑您的文件。',
    'footer.rights': '版权所有。',
    'footer.col.pdf': 'PDF 工具', 'footer.col.image': '图片工具', 'footer.col.company': '关于我们', 'footer.col.lang': '国际化',
    'footer.link.about': '关于我们', 'footer.link.privacy': '隐私政策', 'footer.link.terms': '服务条款',
    'breadcrumb.home': '首页',

    // --- Gemini 去水印 (保留) ---
    'tool.gemini-remove-waterprint.title': 'Gemini 智能图片去水印',
    'tool.gemini-remove-waterprint.desc': 'AI 自动去除图片水印。',
    // ...

    // ==========================================
    // ✨ Image Compressor 专属翻译
    // ==========================================
    'tool.image-compressor.title': '在线图片裁剪压缩 - 批量调整尺寸',
    'tool.image-compressor.desc': '免费在线批量修改图片尺寸和压缩体积。支持按像素或百分比缩放。纯前端处理。',
    
    // SaaS 介绍
    'steps.compress.1.title': '上传图片',
    'steps.compress.1.desc': '拖拽多张图片到上传区。',
    'steps.compress.2.title': '选择调整方式',
    'steps.compress.2.desc': '支持“按像素”固定宽高，或“按百分比”整体缩放。',
    'steps.compress.3.title': '压缩并下载',
    'steps.compress.3.desc': '调整压缩率，一键打包下载。',
    
    'feat.compress.1.title': '灵活的尺寸调整',
    'feat.compress.1.desc': '既可以精确控制像素宽高，也可以按比例快速缩放。支持“不放大”保护。',
    'feat.compress.2.title': '智能压缩引擎',
    'feat.compress.2.desc': '默认 90% 智能压缩，在画质和体积之间取得最佳平衡。',
    'feat.compress.3.title': '批量处理',
    'feat.compress.3.desc': '浏览器本地极速处理，无需上传服务器，保护隐私。',

    'faq.compress.q1': '如果图片比目标尺寸小，会变模糊吗？',
    'faq.compress.a1': '您可以勾选“如果像素较小则不放大”选项，这样小图会保持原状。',
    'faq.compress.q2': '支持多少张图片？',
    'faq.compress.a2': '理论上无限制，取决于您的电脑性能。',

    'testi.compress.1.text': '百分比缩放功能太好用了，我经常需要把原图缩小 50% 发给客户预览。',
    'testi.compress.1.author': '李明, 摄影师',
  },
  
  // ... (保留通用 Key) ...
  'section.how_it_works': '如何使用', 'section.features': '功能亮点', 'section.testimonials': '用户评价', 'section.faq': '常见问题',
};
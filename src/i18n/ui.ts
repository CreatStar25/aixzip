// src/i18n/ui.ts

export const navData = {
  en: {
    image: { 
      title: "Image Tools", 
      items: [
        { name: "Watermark Remover", href: "/en/image/gemini-remove-waterprint" },
        { name: "Resize & Compress", href: "/en/image/image-compressor" }
      ] 
    },
    pdf: { 
      title: "PDF Tools", 
      items: [
        { name: "PDF to Image", href: "/en/pdf/pdf-to-image" }
      ] 
    },
    file: { 
      title: "File Tools", 
      items: [
        { name: "Create ZIP", href: "/en/file/zip-creator" }
      ] 
    }
  },
  'zh-cn': {
    image: { 
      title: "图片工具", 
      items: [
        { name: "智能去水印", href: "/zh-cn/image/gemini-remove-waterprint" },
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
    // --- General Site ---
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

    // --- SaaS Common Sections ---
    'section.how_it_works': 'How It Works',
    'section.features': 'Key Features',
    'section.testimonials': 'What Users Say',
    'section.faq': 'FAQ',
    'feat.nologin.title': 'No Sign Up', 'feat.nologin.desc': 'Start using tools immediately without registration.',
    'feat.client.title': 'Client-Side', 'feat.client.desc': 'Files are processed in your browser. No server uploads.',
    'feat.offline.title': 'Offline Capable', 'feat.offline.desc': 'Works even without internet after loading.',
    'feat.secure.title': '100% Secure', 'feat.secure.desc': 'Your data never leaves your device.',
    'faq.title': 'Frequently Asked Questions',
    'faq.q1': 'Is AIxZIP free?', 'faq.a1': 'Yes, all tools are completely free to use.',
    'faq.q2': 'Are my files safe?', 'faq.a2': 'Absolutely. We use browser-based technology, so your files are processed locally.',
    'testi.title': 'Loved by Users',
    'testi.1.text': 'The watermark remover is magic! And I love that I do not need to upload my private contracts to a server.',
    'testi.1.author': 'Sarah J., Designer',

    // --- Tool: Gemini Watermark Remover ---
    'tool.gemini-remove-waterprint.title': 'Gemini AI Watermark Remover',
    'tool.gemini-remove-waterprint.desc': 'Remove watermarks instantly with AI.',
    'steps.watermark.1.title': 'Upload Images', 'steps.watermark.1.desc': 'Drag & drop your images (JPG, PNG, WebP) into the box.',
    'steps.watermark.2.title': 'AI Processing', 'steps.watermark.2.desc': 'Our Gemini algorithm automatically detects and removes watermarks.',
    'steps.watermark.3.title': 'Download', 'steps.watermark.3.desc': 'Download your clean images individually or as a ZIP file.',
    'feat.watermark.1.title': 'AI-Powered Removal', 'feat.watermark.1.desc': 'Advanced algorithm detects complex patterns and restores background.',
    'feat.watermark.2.title': 'Batch Processing', 'feat.watermark.2.desc': 'Process hundreds of images at once. Saves your time.',
    'feat.watermark.3.title': 'Privacy First', 'feat.watermark.3.desc': 'Images are processed in your browser. No data leaves your device.',
    'faq.watermark.q1': 'Is it really free?', 'faq.watermark.a1': 'Yes, it is completely free with no limits on daily usage.',
    'faq.watermark.q2': 'Do you store my images?', 'faq.watermark.a2': 'No. We use client-side technology. Your images are processed locally on your computer.',
    'faq.watermark.q3': 'Does it support batch renaming?', 'faq.watermark.a3': 'Yes! You can set a prefix and auto-number your files before downloading.',
    'testi.watermark.1.text': 'This saved me hours of work on my design project. The quality is amazing.',
    'testi.watermark.1.author': 'David K., Graphic Designer',

    // --- Tool: Image Compressor & Resizer ---
    'tool.image-compressor.title': 'Image Resizer & Compressor',
    'tool.image-compressor.desc': 'Batch resize, compress and strip EXIF metadata (GPS) for privacy.',
    
    // SaaS Content
    'steps.compress.1.title': 'Upload Images', 'steps.compress.1.desc': 'Drag & drop multiple images.',
    'steps.compress.2.title': 'Resize Options', 'steps.compress.2.desc': 'Choose between Pixels or Percentage. Set constraints.',
    'steps.compress.3.title': 'Compress & Download', 'steps.compress.3.desc': 'Adjust quality and download as ZIP.',
    'feat.compress.1.title': 'Flexible Resizing', 'feat.compress.1.desc': 'Resize by exact pixels or percentage scale. Supports "Do not enlarge".',
    'feat.compress.2.title': 'Smart Compression', 'feat.compress.2.desc': 'Reduce file size efficiently while maintaining aspect ratio.',
    'feat.compress.3.title': 'Batch Processing', 'feat.compress.3.desc': 'Process hundreds of images locally in your browser.',
    'feat.compress.4.title': 'Privacy Protection', 'feat.compress.4.desc': 'Automatically strips EXIF metadata and GPS location data to protect your privacy.',
    'faq.compress.q1': 'Can I prevent small images from being upscaled?', 'faq.compress.a1': 'Yes, just check the "Do not enlarge" option.',
    'faq.compress.q2': 'Does it support bulk processing?', 'faq.compress.a2': 'Yes, unlimited local batch processing.',
    'testi.compress.1.text': 'Great for resizing photos for my blog. The percentage option is very handy.',
    'testi.compress.1.author': 'Emily R., Blogger',

    // Component UI (ImageCompressor.jsx)
    'drag_drop': 'Click or Drag to Upload Images',
    'support_hint': 'Supports JPG, PNG, WebP · Batch Processing',
    'queue_title': 'Process Queue',
    'clear_list': 'Clear List',
    'empty_hint': 'Waiting for images...',
    'settings_title': 'Resize Options',
    'tab_pixels': 'By Pixels',
    'tab_percent': 'By Percentage',
    'lbl_width': 'Width (px)',
    'lbl_height': 'Height (px)',
    'lbl_percent': 'Percentage (%)',
    'chk_no_enlarge': 'Do not enlarge if smaller',
    'sec_compress': 'Compression',
    'chk_compress': 'Enable Compression',
    'lbl_quality': 'Quality',
    'val_quality_high': 'High Quality',
    'val_quality_low': 'High Compression',
    'hint_smart': '90% is recommended for visually lossless compression.',
    'sec_privacy': 'Privacy',
    'chk_strip_metadata': 'Strip Metadata (EXIF/GPS)',
    'hint_strip_metadata': 'Active: Location and camera info will be removed.',
    'btn_download': 'Download ZIP (Original Names)',
    'status_pending': 'Pending',
    'status_processing': 'Processing...',
    'status_done': 'Done',
    'status_error': 'Failed',
    'stat_saved': 'Size Saved',
  },

  'zh-cn': {
    // --- 网站基础信息 ---
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

    // --- SaaS 通用板块 ---
    'section.how_it_works': '如何使用',
    'section.features': '功能亮点',
    'section.testimonials': '用户评价',
    'section.faq': '常见问题',
    'feat.nologin.title': '无需登录', 'feat.nologin.desc': '直接使用，无需繁琐的注册流程。',
    'feat.client.title': '纯前端处理', 'feat.client.desc': '所有计算在浏览器本地完成，不消耗服务器流量。',
    'feat.offline.title': '离线可用', 'feat.offline.desc': '网页加载后，断网也能继续使用工具。',
    'feat.secure.title': '数据安全', 'feat.secure.desc': '您的文件从未离开过您的设备，隐私绝对安全。',
    'faq.title': '常见问题',
    'faq.q1': 'AIxZIP 是免费的吗？', 'faq.a1': '是的，所有工具完全免费，没有任何隐藏费用。',
    'faq.q2': '我的文件安全吗？', 'faq.a2': '绝对安全。我们使用 WebAssembly 等技术在您的浏览器本地处理文件，您的文件从未上传到我们的服务器。',
    'testi.title': '用户评价',
    'testi.1.text': '去水印效果太神奇了！最重要的是，我不需要把保密的合同上传到云端，这让我很放心。',
    'testi.1.author': '李娜, 设计师',

    // --- Tool: Gemini Watermark Remover ---
    'tool.gemini-remove-waterprint.title': 'Gemini 智能图片去水印',
    'tool.gemini-remove-waterprint.desc': 'AI 自动去除图片水印。',
    'steps.watermark.1.title': '上传图片', 'steps.watermark.1.desc': '将您的图片（JPG, PNG, WebP）拖拽到上方框中。',
    'steps.watermark.2.title': '智能处理', 'steps.watermark.2.desc': 'Gemini 算法会自动识别水印模式并进行消除。',
    'steps.watermark.3.title': '下载保存', 'steps.watermark.3.desc': '预览效果，支持单张下载或一键打包下载。',
    'feat.watermark.1.title': 'AI 智能去除', 'feat.watermark.1.desc': '先进的背景差分算法，精准还原被遮挡的画面细节。',
    'feat.watermark.2.title': '批量处理', 'feat.watermark.2.desc': '一次性处理数百张图片，工作效率提升 10 倍。',
    'feat.watermark.3.title': '隐私安全', 'feat.watermark.3.desc': '所有处理均在您的浏览器本地完成，图片绝不上传服务器。',
    'faq.watermark.q1': '这个工具真的免费吗？', 'faq.watermark.a1': '是的，完全免费，没有每日使用次数限制。',
    'faq.watermark.q2': '你们会保存我的图片吗？', 'faq.watermark.a2': '不会。我们使用 WebAssembly 技术在本地处理，您的数据从未离开过您的设备。',
    'faq.watermark.q3': '支持批量重命名吗？', 'faq.watermark.a3': '支持！您可以在侧边栏设置文件名前缀，下载时会自动按顺序编号。',
    'testi.watermark.1.text': '这是我用过最快的去水印工具，而且不需要把公司文件传到云端，非常安全。',
    'testi.watermark.1.author': '张伟, 电商运营',

    // --- Tool: Image Compressor & Resizer ---
    'tool.image-compressor.title': '在线图片裁剪压缩 - 批量调整尺寸',
    'tool.image-compressor.desc': '批量修改尺寸、压缩体积并自动移除 EXIF/GPS 敏感信息。纯前端处理。',
    
    // SaaS Content
    'steps.compress.1.title': '上传图片', 'steps.compress.1.desc': '拖拽多张图片到上传区。',
    'steps.compress.2.title': '选择调整方式', 'steps.compress.2.desc': '支持“按像素”固定宽高，或“按百分比”整体缩放。',
    'steps.compress.3.title': '压缩并下载', 'steps.compress.3.desc': '调整压缩率，一键打包下载。',
    'feat.compress.1.title': '灵活的尺寸调整', 'feat.compress.1.desc': '既可以精确控制像素宽高，也可以按比例快速缩放。支持“不放大”保护。',
    'feat.compress.2.title': '智能压缩引擎', 'feat.compress.2.desc': '默认 90% 智能压缩，在画质和体积之间取得最佳平衡。',
    'feat.compress.3.title': '批量处理', 'feat.compress.3.desc': '浏览器本地极速处理，无需上传服务器，保护隐私。',
    'feat.compress.4.title': '隐私保护', 'feat.compress.4.desc': '自动移除图片中的 EXIF 元数据和 GPS 地理位置信息，防止隐私泄露。',
    'faq.compress.q1': '如果图片比目标尺寸小，会变模糊吗？', 'faq.compress.a1': '您可以勾选“如果像素较小则不放大”选项，这样小图会保持原状。',
    'faq.compress.q2': '支持多少张图片？', 'faq.compress.a2': '理论上无限制，取决于您的电脑性能。',
    'testi.compress.1.text': '百分比缩放功能太好用了，我经常需要把原图缩小 50% 发给客户预览。',
    'testi.compress.1.author': '李明, 摄影师',

    // Component UI (ImageCompressor.jsx)
    'drag_drop': '点击或拖拽上传图片',
    'support_hint': '支持 JPG, PNG, WebP · 批量处理',
    'queue_title': '处理队列',
    'clear_list': '清空列表',
    'empty_hint': '等待添加图片...',
    'settings_title': '调整尺寸选项',
    'tab_pixels': '按像素',
    'tab_percent': '按百分比',
    'lbl_width': '宽度 (px)',
    'lbl_height': '高度 (px)',
    'lbl_percent': '缩放比例 (%)',
    'chk_no_enlarge': '如果像素较小则不放大',
    'sec_compress': '压缩设置',
    'chk_compress': '启用压缩',
    'lbl_quality': '画质强度',
    'val_quality_high': '高画质 (视觉无损)',
    'val_quality_low': '高压缩比',
    'hint_smart': '推荐 90%：在不影响视觉观感的前提下最大化压缩体积。',
    'sec_privacy': '隐私设置',
    'chk_strip_metadata': '移除元数据 (EXIF/GPS)',
    'hint_strip_metadata': '已启用: 将自动清除地理位置和相机拍摄参数。',
    'btn_download': '打包下载 (保留原名)',
    'status_pending': '等待',
    'status_processing': '处理中...',
    'status_done': '完成',
    'status_error': '失败',
    'stat_saved': '已优化体积',
  },
};
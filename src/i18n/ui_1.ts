// src/i18n/ui.ts

export const navData = {
  en: {
    image: { 
      title: "Image Tools", 
      items: [
        // 1. Gemini 去水印及压缩
        { name: "Gemini Watermark & Compress", href: "/image/gemini-remove-waterprint" },
        // 2. 批量裁剪
        { name: "Batch Image Resizer", href: "/image/image-resizer" },
        // 3. 批量压缩
        { name: "Batch Image Compressor", href: "/image/image-compressor" },
        // 4. 批量转换
        { name: "Batch Image Converter", href: "/image/image-converter" },
        // 5. 图片编辑
        { name: "Image Editor (Rotate/Flip)", href: "/image/image-editor" }
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
        // 1. Gemini 去水印及压缩
        { name: "Gemini图片去水印及压缩", href: "/zh-cn/image/gemini-remove-waterprint" },
        // 2. 批量裁剪
        { name: "批量裁剪图片尺寸", href: "/zh-cn/image/image-resizer" },
        // 3. 批量压缩
        { name: "批量压缩图片体积", href: "/zh-cn/image/image-compressor" },
        // 4. 批量转换
        { name: "批量转换图片格式", href: "/zh-cn/image/image-converter" },
        // 5. 图片编辑
        { name: "图片调整器（旋转、翻转等）", href: "/zh-cn/image/image-editor" }
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

    // ==========================================
    // 1. Gemini Watermark Remover & Compress
    // ==========================================
    'tool.gemini-remove-waterprint.title': 'Gemini AI Watermark Remover & Compressor',
    'tool.gemini-remove-waterprint.desc': 'Remove watermarks and compress images instantly with AI.',
    'steps.watermark.1.title': 'Upload Images', 'steps.watermark.1.desc': 'Drag & drop your images (JPG, PNG, WebP) into the box.',
    'steps.watermark.2.title': 'AI Processing', 'steps.watermark.2.desc': 'Gemini algorithm detects watermarks and compresses the image.',
    'steps.watermark.3.title': 'Download', 'steps.watermark.3.desc': 'Download cleaned and optimized images.',
    'feat.watermark.1.title': 'AI Removal', 'feat.watermark.1.desc': 'Advanced algorithm restores background details.',
    'feat.watermark.2.title': 'Smart Compress', 'feat.watermark.2.desc': 'Reduce file size while keeping high quality.',
    'feat.watermark.3.title': 'Privacy First', 'feat.watermark.3.desc': 'Images are processed locally.',
    'faq.watermark.q1': 'Is it free?', 'faq.watermark.a1': 'Yes, completely free.',
    'faq.watermark.q2': 'Data safety?', 'faq.watermark.a2': 'Processed locally in your browser.',
    'faq.watermark.q3': 'Batch rename?', 'faq.watermark.a3': 'Yes, supported.',
    'testi.watermark.1.text': 'Amazing tool for cleaning up my product photos.',
    'testi.watermark.1.author': 'David K.',

    // ==========================================
    // 2. Batch Image Resizer (New)
    // ==========================================
    'tool.image-resizer.title': 'Batch Image Resizer',
    'tool.image-resizer.desc': 'Resize multiple images by pixels or percentage easily.',
    // (Resizer specific SaaS content placeholders)
    'steps.resizer.1.title': 'Upload', 'steps.resizer.1.desc': 'Select your photos.',
    'steps.resizer.2.title': 'Set Dimensions', 'steps.resizer.2.desc': 'Choose width, height, or scale percentage.',
    'steps.resizer.3.title': 'Resize', 'steps.resizer.3.desc': 'Batch resize and download instantly.',

    // ==========================================
    // 3. Batch Image Compressor (Renamed)
    // ==========================================
    'tool.image-compressor.title': 'Batch Image Compressor',
    'tool.image-compressor.desc': 'Compress JPG, PNG, WebP images efficiently without quality loss.',
    
    // SaaS Content (Shared/Specific for Compressor)
    'steps.compress.1.title': 'Upload Images', 'steps.compress.1.desc': 'Drag & drop multiple images.',
    'steps.compress.2.title': 'Configure', 'steps.compress.2.desc': 'Set compression level and resizing options.',
    'steps.compress.3.title': 'Process', 'steps.compress.3.desc': 'Auto-process locally and download.',
    'feat.compress.1.title': 'High Efficiency', 'feat.compress.1.desc': 'Reduce up to 80% file size.',
    'feat.compress.2.title': 'Batch Mode', 'feat.compress.2.desc': 'Process hundreds of photos at once.',
    'feat.compress.3.title': 'No Quality Loss', 'feat.compress.3.desc': 'Smart compression preserves visual quality.',
    'feat.compress.4.title': 'Privacy', 'feat.compress.4.desc': 'Strips metadata (EXIF) for safety.',
    'faq.compress.q1': 'Supported formats?', 'faq.compress.a1': 'JPG, PNG, WebP.',
    'faq.compress.q2': 'Limits?', 'faq.compress.a2': 'No limits, depends on your device memory.',
    'testi.compress.1.text': 'Great for optimizing my blog images.',
    'testi.compress.1.author': 'Emily R.',

    // ==========================================
    // 4. Batch Image Converter (New)
    // ==========================================
    'tool.image-converter.title': 'Batch Image Converter',
    'tool.image-converter.desc': 'Convert images between JPG, PNG, WebP formats in bulk.',

    // ==========================================
    // 5. Image Editor (Rotate/Flip) (New)
    // ==========================================
    'tool.image-editor.title': 'Free Online Image Editor',
    'tool.image-editor.desc': 'Rotate, flip, and adjust your images quickly in the browser.',

    // Component UI (Shared Keys for ImageCompressor.jsx & Others)
    'drag_drop': 'Click or Drag to Upload Images',
    'support_hint': 'Supports JPG, PNG, WebP · Batch Processing',
    'queue_title': 'Process Queue',
    'clear_list': 'Clear List',
    'empty_hint': 'Waiting for images...',
    'settings_title': 'Options',
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
    'hint_smart': 'Recommended for balance.',
    'sec_privacy': 'Privacy',
    'chk_strip_metadata': 'Strip Metadata',
    'hint_strip_metadata': 'Removes EXIF/GPS info.',
    'btn_download': 'Download ZIP',
    'status_pending': 'Pending',
    'status_processing': 'Processing...',
    'status_done': 'Done',
    'status_error': 'Failed',
    'stat_saved': 'Saved',
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

    // ==========================================
    // 1. Gemini图片去水印及压缩
    // ==========================================
    'tool.gemini-remove-waterprint.title': 'Gemini 智能图片去水印及压缩',
    'tool.gemini-remove-waterprint.desc': 'AI 自动去除图片水印，并支持无损压缩体积。',
    'steps.watermark.1.title': '上传图片', 'steps.watermark.1.desc': '将您的图片（JPG, PNG, WebP）拖拽到上方框中。',
    'steps.watermark.2.title': '智能处理', 'steps.watermark.2.desc': 'Gemini 算法自动识别水印并优化文件体积。',
    'steps.watermark.3.title': '下载保存', 'steps.watermark.3.desc': '预览效果，支持单张下载或一键打包下载。',
    'feat.watermark.1.title': 'AI 智能去除', 'feat.watermark.1.desc': '先进的背景差分算法，精准还原被遮挡的画面细节。',
    'feat.watermark.2.title': '智能压缩', 'feat.watermark.2.desc': '在去除水印的同时，自动优化图片体积，节省空间。',
    'feat.watermark.3.title': '隐私安全', 'feat.watermark.3.desc': '所有处理均在您的浏览器本地完成，图片绝不上传服务器。',
    'faq.watermark.q1': '这个工具真的免费吗？', 'faq.watermark.a1': '是的，完全免费，没有每日使用次数限制。',
    'faq.watermark.q2': '你们会保存我的图片吗？', 'faq.watermark.a2': '不会。我们使用本地技术处理，数据从未离开过您的设备。',
    'faq.watermark.q3': '支持批量重命名吗？', 'faq.watermark.a3': '支持！您可以在侧边栏设置文件名前缀，下载时会自动按顺序编号。',
    'testi.watermark.1.text': '这是我用过最快的去水印工具，而且不需要把公司文件传到云端，非常安全。',
    'testi.watermark.1.author': '张伟, 电商运营',

    // ==========================================
    // 2. 批量裁剪图片尺寸
    // ==========================================
    'tool.image-resizer.title': '在线批量裁剪图片尺寸',
    'tool.image-resizer.desc': '免费在线批量修改图片宽度和高度。支持按像素或百分比缩放，保持画质。',
    // (Resizer specific)
    'steps.resizer.1.title': '上传', 'steps.resizer.1.desc': '选择您的图片。',
    'steps.resizer.2.title': '设置尺寸', 'steps.resizer.2.desc': '输入宽度、高度或缩放比例。',
    'steps.resizer.3.title': '裁剪', 'steps.resizer.3.desc': '一键批量处理并下载。',

    // ==========================================
    // 3. 批量压缩图片体积
    // ==========================================
    'tool.image-compressor.title': '在线批量压缩图片体积',
    'tool.image-compressor.desc': '批量压缩 JPG, PNG, WebP 图片大小。支持智能压缩和无损模式。',
    
    // SaaS Content (Compressor)
    'steps.compress.1.title': '上传图片', 'steps.compress.1.desc': '拖拽多张图片到上传区。',
    'steps.compress.2.title': '选择调整方式', 'steps.compress.2.desc': '支持“按像素”固定宽高，或“按百分比”整体缩放。',
    'steps.compress.3.title': '压缩并下载', 'steps.compress.3.desc': '调整压缩率，一键打包下载。',
    'feat.compress.1.title': '灵活的尺寸调整', 'feat.compress.1.desc': '既可以精确控制像素宽高，也可以按比例快速缩放。',
    'feat.compress.2.title': '智能压缩引擎', 'feat.compress.2.desc': '默认 99% 智能压缩，在画质和体积之间取得最佳平衡。',
    'feat.compress.3.title': '批量处理', 'feat.compress.3.desc': '浏览器本地极速处理，无需上传服务器，保护隐私。',
    'feat.compress.4.title': '隐私保护', 'feat.compress.4.desc': '自动移除图片中的 EXIF 元数据和 GPS 地理位置信息。',
    'faq.compress.q1': '如果图片比目标尺寸小，会变模糊吗？', 'faq.compress.a1': '您可以勾选“如果像素较小则不放大”选项，这样小图会保持原状。',
    'faq.compress.q2': '支持多少张图片？', 'faq.compress.a2': '理论上无限制，取决于您的电脑性能。',
    'testi.compress.1.text': '百分比缩放功能太好用了，我经常需要把原图缩小 50% 发给客户预览。',
    'testi.compress.1.author': '李明, 摄影师',

    // ==========================================
    // 4. 批量转换图片格式
    // ==========================================
    'tool.image-converter.title': '在线批量图片格式转换',
    'tool.image-converter.desc': '免费在线将图片转换为 JPG, PNG, WebP 格式。批量处理，快速高效。',

    // ==========================================
    // 5. 图片调整器（旋转、翻转等）
    // ==========================================
    'tool.image-editor.title': '免费在线图片编辑器',
    'tool.image-editor.desc': '简单的在线图片编辑工具。支持旋转、翻转和基础调整。纯前端处理。',

    // Component UI (ImageCompressor.jsx & Others)
    'drag_drop': '点击或拖拽上传图片',
    'support_hint': '支持 JPG, PNG, WebP · 批量处理',
    'queue_title': '处理队列',
    'clear_list': '清空列表',
    'empty_hint': '等待添加图片...',
    'settings_title': '调整选项',
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
    'hint_smart': '推荐 99%：视觉无损 + 显著减小体积。',
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
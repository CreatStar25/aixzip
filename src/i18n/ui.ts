// src/i18n/ui.ts

export const navData = {
  en: {
    image: { 
      title: "Image Tools", 
      items: [
        // ✅ 修复：添加 /en 前缀
        { name: "Gemini Watermark Remover", href: "/en/image/gemini-remove-waterprint" },
        { name: "Image Editor (Rotate/Flip)", href: "/en/image/image-editor" },
        { name: "Batch Image Resizer", href: "/en/image/image-resizer" },
        { name: "Batch Image Compressor", href: "/en/image/image-compressor" },
        { name: "Batch Image Converter", href: "/en/image/image-converter" }
      ] 
    },
    pdf: { 
      title: "PDF Tools", 
      items: [
        // ✅ 修复：添加 /en 前缀
        { name: "PDF to Image", href: "/en/pdf/pdf-to-image" }
      ] 
    },
    file: { 
      title: "File Tools", 
      items: [
        // ✅ 修复：添加 /en 前缀
        { name: "Create ZIP", href: "/en/file/zip-creator" }
      ] 
    }
  },
  'zh-cn': {
    image: { 
      title: "图片工具", 
      items: [
        { name: "Gemini AI 图像去水印", href: "/zh-cn/image/gemini-remove-waterprint" },
        { name: "图片调整器（旋转/翻转）", href: "/zh-cn/image/image-editor" },
        { name: "批量裁剪图片尺寸", href: "/zh-cn/image/image-resizer" },
        { name: "批量压缩图片体积", href: "/zh-cn/image/image-compressor" },
        { name: "批量转换图片格式", href: "/zh-cn/image/image-converter" }
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

// ... ui 对象保持不变 ...
export const ui = {
  // ... (保持您原有的 ui 内容)
  en: {
    'site.title': 'AIxZIP',
    'site.seo_keywords': 'Free Online PDF, Image, Video Tools',
    'hero.title': 'Free Online File Tools',
    'hero.subtitle': 'Process your files locally in your browser. Fast, secure, and free.',
    'hero.search_placeholder': 'Search for tools...',
    'section.all': 'All Tools',
    
    'breadcrumb.home': 'Home',
    'section.how_it_works': 'How It Works',
    'section.features': 'Key Features',
    'section.testimonials': 'What Users Say',
    'section.faq': 'FAQ',
    
    'feat.nologin.title': 'No Login Required',
    'feat.nologin.desc': 'Start using tools immediately without registration.',
    'feat.client.title': 'Local Processing',
    'feat.client.desc': 'Files are processed in your browser for maximum privacy.',
    'feat.secure.title': '100% Secure',
    'feat.secure.desc': 'Your files never leave your device.',
    'feat.offline.title': 'Works Offline',
    'feat.offline.desc': 'Once loaded, use tools without internet connection.',
    
    'testi.title': 'What Users Say',
    'testi.1.text': 'Super fast and easy to use. Saved me hours!',
    'testi.1.author': 'Alex D.',

    // 组件通用词条
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
    'site.title': 'AIxZIP',
    'site.seo_keywords': '免费在线 PDF、图片、视频工具',
    'hero.title': '免费在线文件工具箱',
    'hero.subtitle': '所有文件处理均在浏览器本地完成。快速、安全、免费。',
    'hero.search_placeholder': '搜索工具...',
    'section.all': '全部工具',

    'feat.nologin.title': '无需登录',
    'feat.nologin.desc': '无需注册，打开即用。',
    'feat.client.title': '本地处理',
    'feat.client.desc': '文件仅在浏览器中处理，保护隐私。',
    'feat.secure.title': '安全可靠',
    'feat.secure.desc': '您的文件永远不会上传到服务器。',
    'feat.offline.title': '离线可用',
    'feat.offline.desc': '页面加载后，无需网络即可使用。',

    'testi.title': '用户评价',
    'testi.1.text': '转换速度非常快，而且不用上传文件，很放心。',
    'testi.1.author': '李明',

    'breadcrumb.home': '首页',
    'section.how_it_works': '如何使用',
    'section.features': '功能亮点',
    'section.testimonials': '用户评价',
    'section.faq': '常见问题',

    // 组件通用词条
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
    'btn_download': '打包下载',
    'status_pending': '等待',
    'status_processing': '处理中...',
    'status_done': '完成',
    'status_error': '失败',
    'stat_saved': '已优化体积',
  }
};
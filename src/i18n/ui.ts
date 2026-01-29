// src/i18n/ui.ts

export const navData = {
  // ... 保持 navData 不变 ...
  en: {
    image: { title: "Image Tools", items: [{ name: "Watermark Remover", href: "/image/gemini-remove-waterprint" }, { name: "Compress Image", href: "/image/image-compressor" }] },
    pdf: { title: "PDF Tools", items: [{ name: "PDF to Image", href: "/pdf/pdf-to-image" }] },
    file: { title: "File Tools", items: [{ name: "Create ZIP", href: "/file/zip-creator" }] }
  },
  'zh-cn': {
    image: { title: "图片工具", items: [{ name: "智能去水印", href: "/zh-cn/image/gemini-remove-waterprint" }, { name: "图片压缩", href: "/zh-cn/image/image-compressor" }] },
    pdf: { title: "PDF 工具", items: [{ name: "PDF 转图片", href: "/zh-cn/pdf/pdf-to-image" }] },
    file: { title: "文件工具", items: [{ name: "创建 ZIP", href: "/zh-cn/file/zip-creator" }] }
  }
};

export const ui = {
  en: {
    'site.title': 'AIxZIP',
    'hero.title': 'Free Online AI Tools & File Converter',
    'hero.subtitle': '100% Client-side processing. No file uploads to server. Secure, Fast, and Free.',
    'hero.search_placeholder': 'Search tools (e.g. "Watermark", "PDF")',
    'section.all': 'All Tools',
    
    // 亮点
    'feat.nologin.title': 'No Sign Up',
    'feat.nologin.desc': 'Start using tools immediately without registration.',
    'feat.client.title': 'Client-Side',
    'feat.client.desc': 'Files are processed in your browser. No server uploads.',
    'feat.offline.title': 'Offline Capable',
    'feat.offline.desc': 'Works even without internet after loading.',
    'feat.secure.title': '100% Secure',
    'feat.secure.desc': 'Your data never leaves your device.',

    // FAQ & Testimonials
    'faq.title': 'Frequently Asked Questions',
    'faq.q1': 'Is AIxZIP free?',
    'faq.a1': 'Yes, all tools are completely free to use.',
    'faq.q2': 'Are my files safe?',
    'faq.a2': 'Absolutely. We use browser-based technology, so your files are processed locally.',
    'testi.title': 'Loved by Users',
    'testi.1.text': 'The watermark remover is magic! And I love that I do not need to upload my private contracts to a server.',
    'testi.1.author': 'Sarah J., Designer',

    // --- ✨ 新增：Footer 底部栏翻译 ---
    'footer.desc': 'Free online tools to convert, compress, and edit your files. No registration required.',
    'footer.col.pdf': 'PDF Tools',
    'footer.col.image': 'Image Tools',
    'footer.col.company': 'Company',
    'footer.col.lang': 'International',
    'footer.link.about': 'About Us',
    'footer.link.privacy': 'Privacy Policy',
    'footer.link.terms': 'Terms of Service',
    'footer.rights': 'All rights reserved.'
  },
  'zh-cn': {
    'site.title': 'AIxZIP',
    'hero.title': '免费在线 AI 工具箱 & 文件转换器',
    'hero.subtitle': '100% 纯前端处理。文件不上传服务器。安全、快速、免费。',
    'hero.search_placeholder': '搜索工具 (例如 "去水印", "PDF")',
    'section.all': '所有工具',

    'feat.nologin.title': '无需登录',
    'feat.nologin.desc': '直接使用，无需繁琐的注册流程。',
    'feat.client.title': '纯前端处理',
    'feat.client.desc': '所有计算在浏览器本地完成，不消耗服务器流量。',
    'feat.offline.title': '离线可用',
    'feat.offline.desc': '网页加载后，断网也能继续使用工具。',
    'feat.secure.title': '数据安全',
    'feat.secure.desc': '您的文件从未离开过您的设备，隐私绝对安全。',

    'faq.title': '常见问题',
    'faq.q1': 'AIxZIP 是免费的吗？',
    'faq.a1': '是的，所有工具完全免费，没有任何隐藏费用。',
    'faq.q2': '我的文件安全吗？',
    'faq.a2': '绝对安全。我们使用 WebAssembly 等技术在您的浏览器本地处理文件，您的文件从未上传到我们的服务器。',

    'testi.title': '用户评价',
    'testi.1.text': '去水印效果太神奇了！最重要的是，我不需要把保密的合同上传到云端，这让我很放心。',
    'testi.1.author': '李娜, 设计师',

    // --- ✨ 新增：Footer 底部栏翻译 ---
    'footer.desc': '免费的在线工具，用于转换、压缩和编辑您的文件。无需注册。',
    'footer.col.pdf': 'PDF 工具',
    'footer.col.image': '图片工具',
    'footer.col.company': '关于我们',
    'footer.col.lang': '国际化',
    'footer.link.about': '关于 AIxZIP',
    'footer.link.privacy': '隐私政策',
    'footer.link.terms': '服务条款',
    'footer.rights': '版权所有。'
  }
};
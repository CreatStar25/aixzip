import React from 'react';

// 导入已有的工具组件
import WatermarkRemover from './WatermarkRemover';
import ImageCompressor from './ImageCompressor';
import ImageResizer from './ImageResizer'; // ✨ 新增：引入批量裁剪组件
import PdfToImage from './PdfToImage';
import ZipCreator from './ZipCreator';
import ComingSoon from './ComingSoon'; // 占位组件

export default function ToolDispatcher({ toolId, lang }) {
  // 根据 toolId 返回对应的组件
  // toolId 对应 src/config/tools.ts 中的 id 字段
  switch (toolId) {
    // 1. 图片工具
    case 'gemini-remove-waterprint':
      return <WatermarkRemover lang={lang} />;
      
    case 'image-compressor':
      return <ImageCompressor lang={lang} />;
      
    case 'image-resizer': 
      // ✨ 注册：当访问 /image/image-resizer 时渲染此组件
      return <ImageResizer lang={lang} />;

    // 2. PDF 工具
    case 'pdf-to-image':
      return <PdfToImage lang={lang} />;

    // 3. 文件工具
    case 'zip-creator':
      return <ZipCreator lang={lang} />;

    // 4. 尚未开发完成的工具 (占位)
    case 'image-converter':
    case 'image-editor':
    default:
      // 如果找不到对应的 ID，或者是规划中但未开发的工具，显示 Coming Soon
      return <ComingSoon toolName={toolId} lang={lang} />;
  }
}
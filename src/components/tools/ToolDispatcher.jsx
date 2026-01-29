import React, { Suspense } from 'react';

// 引入所有工具组件
import WatermarkRemover from './WatermarkRemover.jsx';
import ImageCompressor from './ImageCompressor.jsx';
import PdfToImage from './PdfToImage.jsx';
import ZipCreator from './ZipCreator.jsx';
import ComingSoon from './ComingSoon.jsx';

// 建立映射表
const componentMap = {
  // 图片工具
  'gemini-remove-waterprint': WatermarkRemover,
  'image-compressor': ImageCompressor,
  'image-cropper': ComingSoon,
  
  // PDF 工具
  'pdf-to-image': PdfToImage,
  'word-to-pdf': ComingSoon,
  
  // 文件工具
  'zip-creator': ZipCreator,
  
  // 视频工具
  'video-compressor': ComingSoon
};

export default function ToolDispatcher({ toolId, lang }) {
  // 根据 ID 获取组件，如果没有找到则显示 ComingSoon
  const ToolComponent = componentMap[toolId] || ComingSoon;

  return (
    <div className="tool-container">
      <ToolComponent lang={lang} />
    </div>
  );
}
import WatermarkRemover from './WatermarkRemover.jsx';
import ImageCompressor from './ImageCompressor.jsx';
import PdfToImage from './PdfToImage.jsx';
import ZipCreator from './ZipCreator.jsx';
import ComingSoon from './ComingSoon.jsx'; // 引入占位组件

const componentMap = {
  // 图片工具
  'gemini-remove-waterprint': WatermarkRemover,
  'image-compressor': ImageCompressor,
  'image-cropper': ComingSoon, // 暂时用占位符
  
  // PDF 工具
  'pdf-to-image': PdfToImage,
  'word-to-pdf': ComingSoon,   // 暂时用占位符
  
  // 文件工具
  'zip-creator': ZipCreator,
  
  // 视频工具 (如果你之前加了的话)
  'video-compressor': ComingSoon
};

export default componentMap;
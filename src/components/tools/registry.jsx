// 引入你之前写好的具体工具组件
import WatermarkRemover from './WatermarkRemover.jsx';
import ImageCompressor from './ImageCompressor.jsx';
import PdfToImage from './PdfToImage.jsx';
// ... 引入其他组件

// 建立映射关系
const componentMap = {
  'gemini-remove-waterprint': WatermarkRemover,
  'image-compressor': ImageCompressor,
  'pdf-to-image': PdfToImage,
  // 如果某个工具还没开发完，可以放一个 ComingSoon 组件
  'word-to-pdf': () => <div className="p-10 text-center">Coming Soon...</div>, 
};

export default componentMap;
import React from 'react';

export default function ImageCompressor({ lang }) {
  return (
    <div className="p-12 text-center">
      <div className="w-16 h-16 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-6">
        <i className="fa-solid fa-compress"></i>
      </div>
      <h2 className="text-3xl font-black text-slate-800 mb-4">
        {lang === 'zh-cn' ? '图片极致压缩' : 'Image Compressor'}
      </h2>
      <p className="text-slate-500 mb-8 max-w-lg mx-auto">
        {lang === 'zh-cn' 
          ? '在不降低画质的情况下减少 80% 的体积。支持批量处理。' 
          : 'Reduce file size by up to 80% without losing quality. Batch processing supported.'}
      </p>
      
      <button className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-xl shadow-green-500/20 transition-all hover:-translate-y-1">
        <i className="fa-solid fa-upload mr-2"></i>
        {lang === 'zh-cn' ? '选择图片' : 'Select Images'}
      </button>
    </div>
  );
}
import React from 'react';

export default function PdfToImage({ lang }) {
  return (
    <div className="p-12 text-center">
      <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-6">
        <i className="fa-solid fa-file-pdf"></i>
      </div>
      <h2 className="text-3xl font-black text-slate-800 mb-4">
        {lang === 'zh-cn' ? 'PDF 转图片' : 'PDF to JPG/PNG'}
      </h2>
      <p className="text-slate-500 mb-8">
        {lang === 'zh-cn' ? '将 PDF 页面转换为高清图片。' : 'Convert PDF pages to high-quality images.'}
      </p>
      <button className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-xl shadow-red-500/20 transition-all hover:-translate-y-1">
        <i className="fa-solid fa-folder-open mr-2"></i>
        {lang === 'zh-cn' ? '选择 PDF 文件' : 'Select PDF File'}
      </button>
    </div>
  );
}
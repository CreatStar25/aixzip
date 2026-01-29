import React, { useState, useRef } from 'react';

export default function WatermarkRemover({ lang }) {
  const [image, setImage] = useState(null);
  const [processing, setProcessing] = useState(false);
  
  // 简单的文案字典 (实际项目中建议使用 useTranslation hook)
  const t = {
    title: lang === 'zh-cn' ? '智能去水印' : 'Smart Watermark Remover',
    upload: lang === 'zh-cn' ? '上传图片' : 'Upload Image',
    desc: lang === 'zh-cn' ? '支持 JPG, PNG. 纯前端处理，保护隐私。' : 'Supports JPG, PNG. Client-side processing.',
    process: lang === 'zh-cn' ? '去除水印' : 'Remove Watermark',
    download: lang === 'zh-cn' ? '下载结果' : 'Download Result',
  };

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
    }
  };

  const handleProcess = () => {
    setProcessing(true);
    // 模拟处理延迟
    setTimeout(() => {
      setProcessing(false);
      alert(lang === 'zh-cn' ? '去水印完成！(演示版)' : 'Watermark Removed! (Demo)');
    }, 1500);
  };

  return (
    <div className="p-8 md:p-12 text-center">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-slate-800 mb-4">{t.title}</h2>
        <p className="text-slate-500">{t.desc}</p>
      </div>

      {!image ? (
        <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-slate-300 rounded-2xl cursor-pointer hover:bg-slate-50 hover:border-blue-500 transition-all group">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <i className="fa-solid fa-cloud-arrow-up text-4xl text-slate-400 group-hover:text-blue-500 mb-4 transition-colors"></i>
            <p className="text-sm text-slate-500 font-bold">{t.upload}</p>
          </div>
          <input type="file" className="hidden" accept="image/*" onChange={handleUpload} />
        </label>
      ) : (
        <div className="space-y-6">
          <img src={image} alt="Preview" className="max-h-[400px] mx-auto rounded-lg shadow-lg" />
          <div className="flex justify-center gap-4">
            <button 
              onClick={() => setImage(null)}
              className="px-6 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold"
            >
              Reset
            </button>
            <button 
              onClick={handleProcess}
              disabled={processing}
              className="px-8 py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/30 flex items-center gap-2"
            >
              {processing && <i className="fa-solid fa-spinner fa-spin"></i>}
              {t.process}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
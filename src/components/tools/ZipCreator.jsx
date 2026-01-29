import React from 'react';

export default function ZipCreator({ lang }) {
  return (
    <div className="p-12 text-center">
      <div className="w-16 h-16 bg-yellow-100 text-yellow-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-6">
        <i className="fa-solid fa-file-zipper"></i>
      </div>
      <h2 className="text-3xl font-black text-slate-800 mb-4">
        {lang === 'zh-cn' ? '在线打包 ZIP' : 'Create ZIP Online'}
      </h2>
      <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-xl shadow-yellow-500/20 transition-all">
        {lang === 'zh-cn' ? '开始打包' : 'Start Archiving'}
      </button>
    </div>
  );
}
import React from 'react';

export default function ComingSoon({ lang }) {
  return (
    <div className="p-20 text-center text-slate-400">
      <i className="fa-solid fa-person-digging text-6xl mb-6 opacity-50"></i>
      <h2 className="text-2xl font-bold mb-2">
        {lang === 'zh-cn' ? '功能开发中...' : 'Coming Soon'}
      </h2>
      <p>
        {lang === 'zh-cn' ? '这个强大的工具正在赶来的路上！' : 'We are working hard to bring this tool to you.'}
      </p>
    </div>
  );
}
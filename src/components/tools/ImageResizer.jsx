import React, { useState, useEffect, useCallback } from 'react';
import JSZip from 'jszip';
import UPNG from 'upng-js'; // 引入压缩库

export default function ImageResizer({ lang }) {
  // --- 状态管理 ---
  const [queue, setQueue] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  
  // 状态：是否需要重新处理 (当用户修改参数后置为 true)
  const [needsProcessing, setNeedsProcessing] = useState(true);

  // 1. 尺寸设置
  const [resizeSettings, setResizeSettings] = useState({
    mode: 'pixels',     // 'pixels' | 'percent'
    targetWidth: '',    
    targetHeight: '',   
    percent: 50,        
    lockAspectRatio: true
  });

  // 2. 压缩设置 (新增)
  const [compressSettings, setCompressSettings] = useState({
    mode: 'lossy',      // 'lossy' (智能) | 'lossless' (原画)
    quality: 90         // 默认 90%
  });

  // 3. 通用设置
  const [prefix, setPrefix] = useState('');

  // --- I18n 翻译 ---
  const t = {
    title: lang === 'zh-cn' ? '批量图片尺寸调整' : 'Batch Image Resizer',
    drag_text: lang === 'zh-cn' ? '点击或拖拽上传图片' : 'Click or Drag Images Here',
    drag_hint: lang === 'zh-cn' ? '支持 JPG, PNG, WebP' : 'Supports JPG, PNG, WebP',
    
    // Resize Section
    sec_resize: lang === 'zh-cn' ? '尺寸设置' : 'Resize Settings',
    tab_pixels: lang === 'zh-cn' ? '按尺寸 (Pixels)' : 'By Pixels',
    tab_percent: lang === 'zh-cn' ? '按百分比 (%)' : 'By Percentage',
    lbl_width: lang === 'zh-cn' ? '宽度' : 'Width',
    lbl_height: lang === 'zh-cn' ? '高度' : 'Height',
    lbl_lock: lang === 'zh-cn' ? '锁定长宽比' : 'Lock Aspect Ratio',
    
    // Compress Section
    sec_compress: lang === 'zh-cn' ? '导出设置 (压缩)' : 'Export Settings (Compression)',
    opt_smart: lang === 'zh-cn' ? '智能压缩' : 'Smart',
    opt_original: lang === 'zh-cn' ? '原画模式' : 'Original',
    label_quality: lang === 'zh-cn' ? '画质' : 'Quality',
    hint_compress: lang === 'zh-cn' ? '推荐 90%: 平衡画质与体积' : 'Rec 90%: Balance quality & size',

    // Rename
    label_rename: lang === 'zh-cn' ? '批量重命名' : 'Batch Rename',
    placeholder_rename: lang === 'zh-cn' ? '例如: 缩略图' : 'e.g. thumb',

    // Buttons
    btn_start: lang === 'zh-cn' ? '开始处理' : 'Start Processing',
    btn_download: lang === 'zh-cn' ? '打包下载' : 'Download All',
    btn_download_one: lang === 'zh-cn' ? '下载' : 'Download',
    btn_processing: lang === 'zh-cn' ? '处理中...' : 'Processing...',
    clear_list: lang === 'zh-cn' ? '清空列表' : 'Clear',

    // Modal
    modal_title: lang === 'zh-cn' ? '确认清空列表?' : 'Clear All Items?',
    modal_desc: lang === 'zh-cn' ? '所有操作都将丢失。' : 'All settings will be lost.',
    modal_cancel: lang === 'zh-cn' ? '取消' : 'Cancel',
    modal_confirm: lang === 'zh-cn' ? '确认清空' : 'Clear All',
    leave_warning: lang === 'zh-cn' ? '任务正在进行中，离开将丢失进度。' : 'Tasks in progress. Leaving will lose progress.'
  };

  // --- 安全防护 ---
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (queue.length > 0) {
        e.preventDefault();
        e.returnValue = t.leave_warning;
        return t.leave_warning;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [queue, t.leave_warning]);

  // --- 逻辑：当参数变化时，标记为需要处理 ---
  useEffect(() => {
    setNeedsProcessing(true);
    // 同时将所有已完成的项目状态重置为 pending，但不清除 blob 以便保留预览（可选，这里选择清除blob以避免混淆）
    if (queue.length > 0) {
        setQueue(prev => prev.map(item => ({ ...item, status: 'pending', blob: null })));
    }
  }, [resizeSettings, compressSettings]);

  // --- 辅助：计算预期尺寸 ---
  const calculateTargetSize = useCallback((originalW, originalH) => {
    let w = originalW;
    let h = originalH;

    if (resizeSettings.mode === 'percent') {
      const scale = resizeSettings.percent / 100;
      w = Math.round(originalW * scale);
      h = Math.round(originalH * scale);
    } else {
      const tw = parseInt(resizeSettings.targetWidth);
      const th = parseInt(resizeSettings.targetHeight);
      const ratio = originalW / originalH;

      if (!isNaN(tw) && isNaN(th)) {
        w = tw;
        h = resizeSettings.lockAspectRatio ? Math.round(tw / ratio) : originalH;
      } else if (isNaN(tw) && !isNaN(th)) {
        h = th;
        w = resizeSettings.lockAspectRatio ? Math.round(th * ratio) : originalW;
      } else if (!isNaN(tw) && !isNaN(th)) {
        w = tw;
        h = th; // 如果都输入了，强制使用输入值（可能会变形，如果用户取消锁定）
      }
    }
    return { w: Math.max(1, w), h: Math.max(1, h) };
  }, [resizeSettings]);


  // --- 1. 文件处理 ---
  const handleFiles = async (files) => {
    const validFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
    const newItems = await Promise.all(validFiles.map(async (file) => {
      const dims = await new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
        img.onerror = () => resolve({ w: 0, h: 0 });
        img.src = URL.createObjectURL(file);
      });

      return {
        id: Math.random().toString(36).substr(2, 9),
        file: file,
        status: 'pending', 
        originalW: dims.w,
        originalH: dims.h,
        blob: null,
        resultSize: 0
      };
    }));
    setQueue(prev => [...prev, ...newItems]);
    setNeedsProcessing(true); // 新文件加入，肯定需要处理
  };

  // --- 2. 核心处理 (Resize + Compress) ---
  const processImage = async (item) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(item.file);
      img.src = url;
      
      img.onload = () => {
        // A. Resize
        const { w, h } = calculateTargetSize(item.originalW, item.originalH);
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h); // 简单缩放，浏览器自带平滑

        // B. Compress
        const isPng = item.file.type === 'image/png';
        
        if (compressSettings.mode === 'lossy') {
            if (isPng) {
                // PNG Smart Compress (UPNG)
                try {
                    const rgbaData = ctx.getImageData(0, 0, w, h).data.buffer;
                    // 90% -> cnum=230, 100% -> cnum=0 (lossless)
                    const cnum = compressSettings.quality >= 100 ? 0 : Math.floor((compressSettings.quality / 100) * 256);
                    const pngBuffer = UPNG.encode([rgbaData], w, h, cnum);
                    resolve(new Blob([pngBuffer], {type: 'image/png'}));
                } catch (err) {
                    // Fallback
                    canvas.toBlob(b => resolve(b), 'image/png');
                }
            } else {
                // JPG/WebP Compress
                const q = compressSettings.quality / 100;
                canvas.toBlob(b => resolve(b), item.file.type, q);
            }
        } else {
            // Original Mode (只是 Resize，不强行压缩质量)
            canvas.toBlob(b => resolve(b), item.file.type, 1.0);
        }
        
        URL.revokeObjectURL(url);
      };
      
      img.onerror = (e) => {
        URL.revokeObjectURL(url);
        reject(e);
      };
    });
  };

  // --- 3. 手动触发处理逻辑 ---
  const handleStartProcessing = async () => {
    if (processing) return;
    setProcessing(true);

    // 找到所有 pending 的项目
    const pendingItems = queue.filter(i => i.status === 'pending');
    
    // 串行处理 (One-by-one) 防止卡顿
    for (let i = 0; i < pendingItems.length; i++) {
        const item = pendingItems[i];
        
        // 1. 设置状态为 processing
        setQueue(prev => prev.map(q => q.id === item.id ? { ...q, status: 'processing' } : q));
        
        try {
            // 2. 执行处理
            // 给 UI 线程留一点喘息时间
            await new Promise(r => setTimeout(r, 50)); 
            const blob = await processImage(item);
            
            // 3. 设置状态为 done
            setQueue(prev => prev.map(q => q.id === item.id ? { ...q, status: 'done', blob, resultSize: blob.size } : q));
        } catch (error) {
            setQueue(prev => prev.map(q => q.id === item.id ? { ...q, status: 'error' } : q));
        }
    }

    setProcessing(false);
    setNeedsProcessing(false); // 全部处理完毕
  };

  // --- 下载逻辑 ---
  const handleDownloadSingle = (item) => {
    if (!item.blob) return;
    const link = document.createElement('a');
    link.href = URL.createObjectURL(item.blob);
    link.download = item.file.name; 
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadAll = async () => {
    const validItems = queue.filter(i => i.status === 'done' && i.blob);
    if (validItems.length === 0) return;
    
    const zip = new JSZip();
    const prefixStr = prefix.trim();
    const folderName = prefixStr || 'resized_images'; 
    const folder = zip.folder(folderName);

    validItems.forEach((item, index) => {
        let fileName = item.file.name;
        if (prefixStr) {
            let ext = fileName.split('.').pop();
            if (ext === fileName) ext = 'jpg';
            fileName = `${prefixStr}_${index + 1}.${ext}`;
        }
        folder.file(fileName, item.blob);
    });

    try {
        const content = await zip.generateAsync({type: "blob"});
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = `${folderName}.zip`;
        link.click();
    } catch (e) {
        alert("Zip Error: " + e.message);
    }
  };

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024; const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleDimensionChange = (key, value) => {
    const val = value.replace(/\D/g, '');
    setResizeSettings(prev => ({
        ...prev,
        [key]: val,
        // 互斥逻辑：输入宽，清空高（如果是锁定比例模式）
        [key === 'targetWidth' ? 'targetHeight' : 'targetWidth']: prev.lockAspectRatio ? '' : prev[key === 'targetWidth' ? 'targetHeight' : 'targetWidth']
    }));
  };

  const doneItems = queue.filter(i => i.status === 'done');

  // --- Render ---
  return (
    <div className="flex flex-col gap-4 relative">

        {/* 确认清空弹窗 */}
        {showClearConfirm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 transform transition-all scale-100">
                    <div className="text-center mb-6">
                        <div className="w-12 h-12 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <i className="fa-solid fa-triangle-exclamation text-xl"></i>
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-2">{t.modal_title}</h3>
                        <p className="text-sm text-slate-500">{t.modal_desc}</p>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => setShowClearConfirm(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition">{t.modal_cancel}</button>
                        <button onClick={() => { setQueue([]); setShowClearConfirm(false); setNeedsProcessing(true); }} className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 shadow-lg shadow-red-500/30 transition">{t.modal_confirm}</button>
                    </div>
                </div>
            </div>
        )}

        {/* 1. 上方：预览列表 */}
        <div 
            className={`bg-white rounded-3xl shadow-sm border border-slate-100 min-h-[300px] flex flex-col relative transition-all duration-200 overflow-hidden
                ${isDragging ? 'ring-4 ring-emerald-100 border-emerald-400' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
            onDrop={(e) => { e.preventDefault(); setIsDragging(false); if(e.dataTransfer.files) handleFiles(e.dataTransfer.files); }}
        >
            <input type="file" id="fileInput" className="hidden" multiple accept="image/*" onChange={(e) => { handleFiles(e.target.files); e.target.value = ''; }} />

            {queue.length > 0 && (
                <div className="px-5 py-3 border-b border-slate-50 flex justify-between items-center bg-white/80 backdrop-blur-sm sticky top-0 z-10">
                    <span className="text-sm font-bold text-slate-500">{t.title} ({queue.length})</span>
                    <button onClick={() => setShowClearConfirm(true)} className="text-xs text-red-400 hover:text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-full transition">
                        <i className="fa-solid fa-trash-can mr-1"></i> {t.clear_list}
                    </button>
                </div>
            )}

            <div className="flex-1 p-4 overflow-y-auto max-h-[500px] custom-scroll">
                {queue.length === 0 ? (
                    <div onClick={() => document.getElementById('fileInput').click()} className="h-full flex flex-col items-center justify-center cursor-pointer py-10 group min-h-[250px]">
                        <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-3xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-emerald-100 transition-all duration-300 shadow-sm">
                            <i className="fa-solid fa-cloud-arrow-up text-2xl"></i>
                        </div>
                        <h3 className="text-lg font-bold text-slate-700 mb-1">{t.drag_text}</h3>
                        <p className="text-slate-400 text-xs">{t.drag_hint}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                        {queue.map(item => {
                            const targetDims = calculateTargetSize(item.originalW, item.originalH);
                            return (
                                <div key={item.id} className="relative group bg-slate-50 rounded-xl p-2 border border-slate-100 hover:border-emerald-300 hover:shadow-md transition-all">
                                    <div className="aspect-square bg-white rounded-lg flex items-center justify-center mb-2 text-slate-300 relative overflow-hidden">
                                        <img src={URL.createObjectURL(item.file)} className="w-full h-full object-contain opacity-90" alt="" />
                                        
                                        <div className="absolute top-1 right-1 flex gap-1 z-10">
                                            {item.status === 'done' && (
                                                <button onClick={(e) => { e.stopPropagation(); handleDownloadSingle(item); }} className="w-5 h-5 bg-white rounded-full flex items-center justify-center text-emerald-600 shadow-sm hover:scale-110 cursor-pointer border border-emerald-100" title={t.btn_download_one}>
                                                    <i className="fa-solid fa-download text-[10px]"></i>
                                                </button>
                                            )}
                                            {item.status === 'processing' && <i className="fa-solid fa-spinner fa-spin text-emerald-500 drop-shadow-md"></i>}
                                            {item.status === 'done' && <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-white text-[9px] shadow-sm"><i className="fa-solid fa-check"></i></div>}
                                        </div>
                                    </div>
                                    
                                    <div className="text-center">
                                        <p className="text-[10px] font-bold text-slate-700 truncate w-full mb-1">{item.file.name}</p>
                                        <div className="flex items-center justify-center gap-1 text-[9px] bg-slate-200/50 rounded-md py-0.5 px-1 font-mono text-slate-500">
                                            <span>{item.originalW}x{item.originalH}</span>
                                            <i className="fa-solid fa-arrow-right text-[8px] opacity-50"></i>
                                            <span className="text-emerald-600 font-bold">{targetDims.w}x{targetDims.h}</span>
                                        </div>
                                        <p className="text-[9px] text-slate-400 font-mono mt-1">
                                            {item.status === 'done' 
                                                ? <span className="text-emerald-600 font-bold">{formatSize(item.resultSize)}</span>
                                                : formatSize(item.file.size)
                                            }
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                        <div onClick={() => document.getElementById('fileInput').click()} className="aspect-square rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:border-emerald-400 hover:bg-emerald-50 transition-colors text-slate-300 hover:text-emerald-500">
                            <i className="fa-solid fa-plus text-xl mb-1"></i>
                            <span className="text-[10px] font-bold">Add</span>
                        </div>
                    </div>
                )}
            </div>
        </div>

        {/* 2. 下方：操作栏 (双排布局) */}
        <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100 p-5 flex flex-col gap-6">
            
            {/* 上排：尺寸设置 + 重命名 + 按钮 */}
            <div className="flex flex-col md:flex-row items-end justify-between gap-6">
                
                {/* 尺寸控制区 */}
                <div className="flex-1 w-full md:w-auto flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t.sec_resize}</span>
                        {/* Tab Switcher */}
                        <div className="flex bg-slate-100 rounded-lg p-0.5">
                            <button onClick={() => setResizeSettings(s => ({...s, mode: 'pixels'}))} className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${resizeSettings.mode === 'pixels' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>{t.tab_pixels}</button>
                            <button onClick={() => setResizeSettings(s => ({...s, mode: 'percent'}))} className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${resizeSettings.mode === 'percent' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>{t.tab_percent}</button>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {resizeSettings.mode === 'pixels' ? (
                            <>
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <div className="absolute -top-2 left-2 px-1 bg-white text-[10px] font-bold text-slate-400">{t.lbl_width}</div>
                                        <input type="text" value={resizeSettings.targetWidth} placeholder="Auto" onChange={(e) => handleDimensionChange('targetWidth', e.target.value)} 
                                            className="w-28 pl-3 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-blue-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition shadow-sm" />
                                        <span className="absolute right-3 top-2.5 text-xs text-slate-300">px</span>
                                    </div>
                                    <div className="text-slate-300"><i className="fa-solid fa-link"></i></div>
                                    <div className="relative">
                                        <div className="absolute -top-2 left-2 px-1 bg-white text-[10px] font-bold text-slate-400">{t.lbl_height}</div>
                                        <input type="text" value={resizeSettings.targetHeight} placeholder="Auto" onChange={(e) => handleDimensionChange('targetHeight', e.target.value)} 
                                            className="w-28 pl-3 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-blue-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition shadow-sm" />
                                        <span className="absolute right-3 top-2.5 text-xs text-slate-300">px</span>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center gap-3 flex-1 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 max-w-md">
                                <span className="text-xs font-bold text-slate-500">{t.tab_percent}</span>
                                <input type="range" min="1" max="200" step="5" value={resizeSettings.percent} onChange={(e) => setResizeSettings(s => ({...s, percent: parseInt(e.target.value)}))} 
                                    className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500" />
                                <span className="text-sm font-bold text-blue-600 min-w-[40px] text-right">{resizeSettings.percent}%</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* 重命名区 */}
                <div className="flex-1 w-full md:w-auto flex flex-col gap-3">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t.label_rename}</span>
                    <div className="relative">
                        <input type="text" placeholder={t.placeholder_rename} value={prefix} onChange={(e) => setPrefix(e.target.value)} 
                            className="w-full pl-3 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition shadow-inner" />
                        <span className="absolute right-3 top-3 text-slate-400 text-xs font-mono select-none">_#</span>
                    </div>
                </div>

                {/* 主操作按钮 (Toggle) */}
                <div className="w-full md:w-auto flex-shrink-0">
                    {!needsProcessing && doneItems.length > 0 ? (
                        /* 下载按钮 (绿色) */
                        <button onClick={handleDownloadAll} className="w-full md:w-auto px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/30 transition-all active:scale-95 flex items-center justify-center gap-2">
                            <i className="fa-solid fa-download"></i> {t.btn_download}
                            <span className="bg-emerald-600 px-1.5 py-0.5 rounded-full text-[10px] opacity-90">{doneItems.length}</span>
                        </button>
                    ) : (
                        /* 处理按钮 (蓝色) */
                        <button onClick={handleStartProcessing} disabled={queue.length === 0 || processing} 
                            className="w-full md:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-600/30 transition-all active:scale-95 flex items-center justify-center gap-2">
                            {processing ? <><i className="fa-solid fa-spinner fa-spin"></i> {t.btn_processing}</> : <><i className="fa-solid fa-bolt"></i> {t.btn_start}</>}
                        </button>
                    )}
                </div>
            </div>

            <div className="border-t border-slate-100"></div>

            {/* 下排：压缩设置 (类似 WatermarkRemover) */}
            <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t.sec_compress}</span>
                    {compressSettings.mode === 'lossy' && <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-bold">{t.hint_compress}</span>}
                </div>
                
                <div className="flex items-center gap-4">
                    {/* Mode Switch */}
                    <div className="flex bg-slate-100 rounded-lg p-1 shadow-inner">
                        <button onClick={() => setCompressSettings(s => ({...s, mode: 'lossy'}))} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${compressSettings.mode === 'lossy' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>{t.opt_smart}</button>
                        <button onClick={() => setCompressSettings(s => ({...s, mode: 'lossless'}))} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${compressSettings.mode === 'lossless' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>{t.opt_original}</button>
                    </div>

                    {/* Slider */}
                    {compressSettings.mode === 'lossy' && (
                        <div className="flex items-center gap-3 flex-1 px-2 animate-fade-in max-w-sm">
                            <span className="text-xs font-bold text-slate-400">{t.label_quality}</span>
                            <input type="range" min="1" max="100" value={compressSettings.quality} onChange={(e) => setCompressSettings(s => ({...s, quality: parseInt(e.target.value)}))} 
                                className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500" />
                            <span className="text-sm font-bold text-blue-600 min-w-[30px]">{compressSettings.quality}%</span>
                        </div>
                    )}
                </div>
            </div>

        </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import JSZip from 'jszip';
import UPNG from 'upng-js';

export default function ImageCompressor({ lang }) {
  // --- 状态管理 ---
  const [queue, setQueue] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // 设置项
  const [settings, setSettings] = useState({
    // 尺寸调整相关
    tab: 'pixels',         // 'pixels' | 'percentage'
    width: '',             // 目标宽度 (空代表自动)
    height: '',            // 目标高度 (空代表自动)
    noEnlarge: false,      // 如果原图小于目标，是否保持原样
    percent: 50,           // 百分比缩放值

    // 压缩相关
    enableCompress: true,  // 是否开启压缩
    quality: 90,           // 1-100
  });

  // 内部翻译
  const t = (key) => {
    const dict = {
      'zh-cn': {
        drag_drop: '点击或拖拽上传图片',
        support_hint: '支持 JPG, PNG, WebP · 批量处理',
        queue_title: '处理队列',
        clear_list: '清空列表',
        empty_hint: '等待添加图片...',
        
        // Right Panel
        settings_title: '调整尺寸选项',
        tab_pixels: '按像素',
        tab_percent: '按百分比',
        lbl_width: '宽度 (px)',
        lbl_height: '高度 (px)',
        lbl_percent: '缩放比例 (%)',
        chk_no_enlarge: '如果像素较小则不放大',
        
        sec_compress: '压缩设置',
        chk_compress: '启用压缩',
        lbl_quality: '画质强度',
        val_quality_high: '高画质',
        
        btn_download: '打包下载 (保留原名)',
        
        // Status
        status_pending: '等待',
        status_processing: '处理中...',
        status_done: '完成',
        status_error: '失败',
        
        stat_saved: '已优化体积',
      },
      'en': {
        drag_drop: 'Click or Drag to Upload Images',
        support_hint: 'Supports JPG, PNG, WebP · Batch Processing',
        queue_title: 'Process Queue',
        clear_list: 'Clear List',
        empty_hint: 'Waiting for images...',
        
        settings_title: 'Resize Options',
        tab_pixels: 'By Pixels',
        tab_percent: 'By Percentage',
        lbl_width: 'Width (px)',
        lbl_height: 'Height (px)',
        lbl_percent: 'Percentage (%)',
        chk_no_enlarge: 'Do not enlarge if smaller',
        
        sec_compress: 'Compression',
        chk_compress: 'Enable Compression',
        lbl_quality: 'Quality',
        val_quality_high: 'High',
        
        btn_download: 'Download ZIP (Original Names)',
        
        status_pending: 'Pending',
        status_processing: 'Processing...',
        status_done: 'Done',
        status_error: 'Failed',
        
        stat_saved: 'Size Saved',
      }
    };
    return dict[lang]?.[key] || dict['en'][key];
  };

  // --- 核心逻辑：计算尺寸 + 压缩 ---
  const processImage = async (file) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      img.src = objectUrl;

      img.onload = () => {
        URL.revokeObjectURL(objectUrl);

        const originalW = img.naturalWidth;
        const originalH = img.naturalHeight;
        let targetW = originalW;
        let targetH = originalH;

        // 1. 计算目标尺寸
        if (settings.tab === 'percentage') {
          // A. 按百分比
          const p = Math.max(1, Math.min(100, settings.percent)) / 100;
          targetW = Math.round(originalW * p);
          targetH = Math.round(originalH * p);
        } else {
          // B. 按像素
          const inputW = parseInt(settings.width);
          const inputH = parseInt(settings.height);

          if (inputW && inputH) {
            // 强制宽高 (可能会变形，或者我们可以选择 Fit 模式。这里参考 iLoveIMG 简单逻辑：强制缩放)
            // 更好的做法是：保持纵横比。如果用户输入了 W 和 H，通常意味着强制。
            // 但如果模仿 iLoveIMG 的 "Maintain aspect ratio"，通常只输入一项。
            // 这里我们实现：如果只输入一项，则按比例；如果输入两项，则强制。
             targetW = inputW;
             targetH = inputH;
          } else if (inputW) {
             targetW = inputW;
             targetH = Math.round(originalH * (inputW / originalW));
          } else if (inputH) {
             targetH = inputH;
             targetW = Math.round(originalW * (inputH / originalH));
          }

          // C. 检查“不放大” (No Enlarge)
          if (settings.noEnlarge) {
             if (targetW > originalW || targetH > originalH) {
                 targetW = originalW;
                 targetH = originalH;
             }
          }
        }

        // 2. 绘制到 Canvas (Resize)
        const canvas = document.createElement('canvas');
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, targetW, targetH);

        // 3. 压缩并导出 (Compress)
        const isPng = file.type === 'image/png';
        // 如果未开启压缩，则质量为 1.0 (接近原画)；开启则使用 settings.quality
        const quality0to1 = settings.enableCompress ? (settings.quality / 100) : 1.0;

        if (!settings.enableCompress) {
           // 不压缩：尝试尽可能保留原样 (JPG 默认 0.92, 强行给 1.0)
           canvas.toBlob((blob) => resolve(blob), file.type, 1.0);
        } else {
           // 压缩模式
           if (isPng) {
             // PNG 使用 UPNG
             try {
               const rgbaData = ctx.getImageData(0, 0, targetW, targetH).data.buffer;
               // 映射 quality (1-100) -> cnum (0-256)
               const cnum = Math.floor(quality0to1 * 256); 
               const pngBuffer = UPNG.encode([rgbaData], targetW, targetH, cnum);
               resolve(new Blob([pngBuffer], {type: 'image/png'}));
             } catch (e) {
               canvas.toBlob((blob) => resolve(blob), 'image/png');
             }
           } else {
             // JPG / WebP
             canvas.toBlob((blob) => resolve(blob), file.type, quality0to1);
           }
        }
      };

      img.onerror = (e) => {
        URL.revokeObjectURL(objectUrl);
        reject(e);
      };
    });
  };

  // --- 队列调度 (自动处理) ---
  useEffect(() => {
    if (processing) return;
    const nextItem = queue.find(i => i.status === 'pending');
    if (nextItem) {
      setProcessing(true);
      processOneItem(nextItem);
    }
  }, [queue, processing]);

  const processOneItem = async (item) => {
    setQueue(prev => prev.map(i => i.id === item.id ? { ...i, status: 'processing' } : i));
    try {
      const blob = await processImage(item.file);
      setQueue(prev => prev.map(i => i.id === item.id ? { 
        ...i, 
        status: 'done', 
        blob: blob, 
        resultSize: blob.size 
      } : i));
    } catch (error) {
      console.error(error);
      setQueue(prev => prev.map(i => i.id === item.id ? { ...i, status: 'error' } : i));
    } finally {
      setProcessing(false);
    }
  };

  // --- 交互事件 ---
  const handleFiles = (files) => {
    const validFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
    const newItems = validFiles.map(file => ({
        id: Math.random().toString(36).substr(2, 9),
        file: file,
        status: 'pending',
        blob: null,
        resultSize: 0
    }));
    setQueue(prev => [...prev, ...newItems]);
  };
  
  // 重新处理所有 (当设置改变时，将已完成的重置为 pending)
  // 为了用户体验，我们做个简单的 debounce 或者只在用户点击“应用”时处理？
  // 这里为了简单直观：设置改变时，不自动重置，而是用户需要重新上传？
  // 不，更好的体验是：设置改变后，只有新加入的图片受影响？
  // 参考 iLoveIMG：上传 -> 设置 -> 点击“处理”。
  // 但我们目前的架构是“自动处理”。
  // 妥协方案：用户修改设置后，手动点击一个“重新处理”按钮？或者我们简单点：
  // 每次修改关键设置，把所有 item 状态设回 pending。
  useEffect(() => {
     if (queue.length > 0 && !processing) {
         // 只有当有文件且没在处理时，才允许重置状态
         // 这是一个激进的策略：只要改了任何设置，所有图片重做
         // 为了防止 slider 滑动时频繁触发，最好加 debounce，这里简化处理
         setQueue(prev => prev.map(i => ({...i, status: 'pending'})));
     }
  }, [settings.tab, settings.width, settings.height, settings.percent, settings.noEnlarge, settings.enableCompress, settings.quality]);


  const onDragOver = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
  const onDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
  const onDrop = (e) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(false);
    if (e.dataTransfer.files?.length > 0) handleFiles(e.dataTransfer.files);
  };

  const handleDownloadAll = async () => {
    const validItems = queue.filter(i => i.status === 'done' && i.blob);
    if (validItems.length === 0) return;

    const zip = new JSZip();
    // 不用文件夹，直接平铺
    validItems.forEach((item) => {
        zip.file(item.file.name, item.blob);
    });

    try {
        const content = await zip.generateAsync({type: "blob"});
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = `resized_images_${Date.now()}.zip`;
        link.click();
    } catch (e) {
        alert("Zip failed: " + e.message);
    }
  };

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const doneItems = queue.filter(i => i.status === 'done');
  const totalSaved = doneItems.reduce((acc, i) => acc + Math.max(0, i.file.size - i.resultSize), 0);
  const totalProgress = queue.length === 0 ? 0 : Math.round((doneItems.length / queue.length) * 100);

  return (
    <div className="flex flex-col lg:flex-row h-[800px] lg:h-[700px] overflow-hidden bg-white rounded-2xl shadow-xl border border-slate-100">
        
        {/* 左侧：文件列表与上传 */}
        <div className="flex-1 flex flex-col bg-slate-50/50 overflow-hidden relative">
            
            {/* 顶部工具条 */}
            <div className="px-4 py-3 border-b border-slate-200 bg-white flex justify-between items-center shadow-sm z-10">
                 <button onClick={() => document.getElementById('addFile').click()} className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition shadow-blue-500/30 shadow-lg flex items-center gap-2">
                    <i className="fa-solid fa-plus"></i> Add Images
                 </button>
                 <input type="file" id="addFile" className="hidden" accept="image/*" multiple onChange={(e) => {handleFiles(e.target.files); e.target.value=''}} />
                 
                 <div className="flex gap-3">
                     <span className="text-xs font-bold text-slate-400">{queue.length} Images</span>
                     {queue.length > 0 && (
                        <button onClick={() => setQueue([])} className="text-xs text-red-500 hover:text-red-700 font-bold hover:bg-red-50 px-2 py-1 rounded transition">
                            {t('clear_list')}
                        </button>
                     )}
                 </div>
            </div>

            {/* 中间：列表或空状态 */}
            <div 
                className={`flex-1 overflow-y-auto p-4 space-y-3 custom-scroll ${isDragging ? 'bg-blue-50 ring-2 ring-inset ring-blue-500' : ''}`}
                onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
            >
                {queue.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-300">
                        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-slate-100">
                             <i className="fa-regular fa-image text-4xl text-slate-200"></i>
                        </div>
                        <p className="text-sm font-bold text-slate-400">{t('drag_drop')}</p>
                    </div>
                ) : (
                    queue.map(item => (
                        <div key={item.id} className="flex items-center gap-4 p-3 bg-white rounded-xl border border-slate-200 shadow-sm animate-fade-in-up">
                             {/* 缩略图模拟 */}
                             <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 font-bold text-xs border border-slate-200 shrink-0">
                                {item.file.name.split('.').pop().toUpperCase()}
                             </div>
                             
                             <div className="min-w-0 flex-1">
                                 <p className="text-xs font-bold text-slate-700 truncate">{item.file.name}</p>
                                 <div className="flex items-center gap-2 mt-1">
                                     <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 font-mono">{formatSize(item.file.size)}</span>
                                     <i className="fa-solid fa-arrow-right text-[8px] text-slate-300"></i>
                                     {item.status === 'done' ? (
                                         <span className="text-[10px] bg-green-100 px-1.5 py-0.5 rounded text-green-600 font-mono font-bold">{formatSize(item.resultSize)}</span>
                                     ) : (
                                         <span className="text-[10px] text-slate-300">...</span>
                                     )}
                                 </div>
                             </div>

                             <div className="shrink-0 text-right">
                                 {item.status === 'processing' && <i className="fa-solid fa-spinner fa-spin text-blue-500"></i>}
                                 {item.status === 'done' && <i className="fa-solid fa-check text-green-500"></i>}
                                 {item.status === 'error' && <i className="fa-solid fa-triangle-exclamation text-red-500"></i>}
                                 {item.status === 'pending' && <i className="fa-regular fa-clock text-slate-300"></i>}
                             </div>
                        </div>
                    ))
                )}
            </div>
        </div>

        {/* 右侧：iLoveIMG 风格设置面板 */}
        <div className="w-full lg:w-[340px] bg-white border-l border-slate-200 flex flex-col shadow-xl z-20">
            
            {/* Header */}
            <div className="p-5 border-b border-slate-100">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide flex items-center gap-2">
                    <i className="fa-solid fa-sliders text-blue-600"></i> {t('settings_title')}
                </h3>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-8 custom-scroll">
                
                {/* 1. Tabs */}
                <div>
                    <div className="flex p-1 bg-slate-100 rounded-xl mb-4">
                        <button 
                            onClick={() => setSettings(s => ({...s, tab: 'pixels'}))}
                            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${settings.tab === 'pixels' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            {t('tab_pixels')}
                        </button>
                        <button 
                            onClick={() => setSettings(s => ({...s, tab: 'percentage'}))}
                            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${settings.tab === 'percentage' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            {t('tab_percent')}
                        </button>
                    </div>

                    {settings.tab === 'pixels' ? (
                        <div className="space-y-4 animate-fade-in-up">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 mb-1 block">{t('lbl_width')}</label>
                                    <input 
                                        type="number" placeholder="Auto"
                                        value={settings.width}
                                        onChange={(e) => setSettings(s => ({...s, width: e.target.value}))}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 mb-1 block">{t('lbl_height')}</label>
                                    <input 
                                        type="number" placeholder="Auto"
                                        value={settings.height}
                                        onChange={(e) => setSettings(s => ({...s, height: e.target.value}))}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                                    />
                                </div>
                            </div>
                            
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <div className={`w-4 h-4 rounded border flex items-center justify-center transition ${settings.noEnlarge ? 'bg-blue-600 border-blue-600' : 'border-slate-300 bg-white'}`}>
                                    {settings.noEnlarge && <i className="fa-solid fa-check text-[10px] text-white"></i>}
                                </div>
                                <input type="checkbox" className="hidden" checked={settings.noEnlarge} onChange={(e) => setSettings(s => ({...s, noEnlarge: e.target.checked}))} />
                                <span className="text-xs font-medium text-slate-600 group-hover:text-blue-600 transition">{t('chk_no_enlarge')}</span>
                            </label>
                        </div>
                    ) : (
                        <div className="space-y-4 animate-fade-in-up">
                             <div className="grid grid-cols-3 gap-2">
                                 {[25, 50, 75].map(p => (
                                     <button 
                                        key={p}
                                        onClick={() => setSettings(s => ({...s, percent: p}))}
                                        className={`py-2 text-xs font-bold rounded-lg border transition ${settings.percent === p ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                                     >{p}%</button>
                                 ))}
                             </div>
                             <div className="relative">
                                 <input 
                                    type="number" 
                                    value={settings.percent}
                                    onChange={(e) => setSettings(s => ({...s, percent: parseInt(e.target.value)}))}
                                    className="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold focus:border-blue-500 outline-none"
                                 />
                                 <span className="absolute right-3 top-2 text-xs font-bold text-slate-400">%</span>
                             </div>
                        </div>
                    )}
                </div>

                <hr className="border-slate-100" />

                {/* 2. Compression */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                         <h4 className="text-xs font-bold text-slate-500 uppercase">{t('sec_compress')}</h4>
                         <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked={settings.enableCompress} onChange={(e) => setSettings(s => ({...s, enableCompress: e.target.checked}))} className="sr-only peer" />
                            <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>

                    {settings.enableCompress && (
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 animate-fade-in-up">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-bold text-slate-600">{t('lbl_quality')}</span>
                                <span className="text-xs font-black text-blue-600">{settings.quality}%</span>
                            </div>
                            <input 
                                type="range" min="1" max="100" 
                                value={settings.quality}
                                onChange={(e) => setSettings(s => ({...s, quality: parseInt(e.target.value)}))}
                                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                            <div className="flex justify-between mt-1">
                                <span className="text-[10px] text-slate-400">Low</span>
                                <span className="text-[10px] text-slate-400">{t('val_quality_high')}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom: Download */}
            <div className="p-5 border-t border-slate-100 bg-slate-50">
                 {/* Progress Bar */}
                 {queue.length > 0 && (
                     <div className="mb-4">
                        <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1">
                            <span>{totalProgress === 100 ? t('status_done') : t('status_processing')}</span>
                            <span>{totalProgress}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${totalProgress}%` }}></div>
                        </div>
                        <div className="text-right mt-1 text-[10px] font-mono text-green-600">
                             Saved: {formatSize(totalSaved)}
                        </div>
                     </div>
                 )}

                 <button 
                    onClick={handleDownloadAll}
                    disabled={doneItems.length === 0}
                    className="w-full py-4 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-all shadow-xl shadow-slate-300 flex items-center justify-center gap-2 active:scale-95"
                >
                    {doneItems.length > 0 ? (
                        <>
                           <i className="fa-solid fa-download"></i> {t('btn_download')}
                        </>
                    ) : (
                        t('status_pending')
                    )}
                </button>
            </div>
        </div>
    </div>
  );
}
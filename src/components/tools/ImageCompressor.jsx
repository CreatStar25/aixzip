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
    // 尺寸调整
    tab: 'pixels',         
    width: '',             
    height: '',            
    noEnlarge: true,       
    percent: 75,           

    // 压缩设置
    enableCompress: true,  
    quality: 90,
    
    // 隐私设置 (默认开启)
    stripMetadata: true, 
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
        val_quality_high: '高画质 (视觉无损)',
        val_quality_low: '高压缩比',
        hint_smart: '推荐 90%：在不影响视觉观感的前提下最大化压缩体积。',

        sec_privacy: '隐私设置',
        chk_strip_metadata: '移除元数据 (EXIF/GPS)',
        hint_strip_metadata: '已启用: 将自动清除地理位置和相机拍摄参数。',
        
        btn_download: '打包下载 (保留原名)',
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
        val_quality_high: 'High Quality',
        val_quality_low: 'High Compression',
        hint_smart: '90% is recommended for visually lossless compression.',

        sec_privacy: 'Privacy',
        chk_strip_metadata: 'Strip Metadata (EXIF/GPS)',
        hint_strip_metadata: 'Active: Location and camera info will be removed.',
        
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

  // --- 核心算法 ---
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

        // 1. Resize Logic
        if (settings.tab === 'percentage') {
          const p = Math.max(1, Math.min(100, settings.percent)) / 100;
          targetW = Math.round(originalW * p);
          targetH = Math.round(originalH * p);
        } else {
          const inputW = parseInt(settings.width);
          const inputH = parseInt(settings.height);

          if (inputW && inputH) {
             targetW = inputW;
             targetH = inputH;
          } else if (inputW) {
             targetW = inputW;
             targetH = Math.round(originalH * (inputW / originalW));
          } else if (inputH) {
             targetH = inputH;
             targetW = Math.round(originalW * (inputH / originalH));
          }

          if (settings.noEnlarge) {
             if (targetW > originalW || targetH > originalH) {
                 targetW = originalW;
                 targetH = originalH;
             }
          }
        }

        // 2. Draw to Canvas (This implicitly STRIPS metadata)
        const canvas = document.createElement('canvas');
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, targetW, targetH);

        // 3. Compress & Export
        if (!settings.enableCompress) {
           canvas.toBlob((blob) => resolve(blob), file.type, 1.0);
           return;
        }

        const isPng = file.type === 'image/png';
        const qualityDecimal = settings.quality / 100;

        if (isPng) {
            // PNG (UPNG.js Quantization)
            try {
               const rgbaData = ctx.getImageData(0, 0, targetW, targetH).data.buffer;
               let cnum = 0; 
               if (settings.quality <= 99) {
                   cnum = Math.max(16, Math.min(256, Math.floor((settings.quality / 100) * 256 * 1.2)));
                   if (cnum > 256) cnum = 256;
               }
               const pngBuffer = UPNG.encode([rgbaData], targetW, targetH, cnum);
               resolve(new Blob([pngBuffer], {type: 'image/png'}));
            } catch (e) {
               console.error("UPNG Error", e);
               canvas.toBlob(b => resolve(b), 'image/png');
            }
        } else {
            // JPG/WebP
            canvas.toBlob((blob) => resolve(blob), file.type, qualityDecimal);
        }
      };

      img.onerror = (e) => {
        URL.revokeObjectURL(objectUrl);
        reject(e);
      };
    });
  };

  // --- Queue Management ---
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

  useEffect(() => {
      if (queue.length > 0 && !processing) {
          const doneOrError = queue.some(i => i.status === 'done' || i.status === 'error');
          if (doneOrError) {
              setQueue(prev => prev.map(i => ({...i, status: 'pending'})));
          }
      }
  }, [settings.tab, settings.width, settings.height, settings.percent, settings.noEnlarge, settings.enableCompress, settings.quality]);

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
    validItems.forEach((item) => {
        zip.file(item.file.name, item.blob);
    });

    try {
        const content = await zip.generateAsync({type: "blob"});
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = `optimized_images_${Date.now()}.zip`;
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
        
        {/* Left: Files & Upload */}
        <div className="flex-1 flex flex-col bg-slate-50/50 overflow-hidden relative">
            {/* Toolbar */}
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

            {/* File List */}
            <div 
                className={`flex-1 overflow-y-auto p-4 space-y-3 custom-scroll ${isDragging ? 'bg-blue-50 ring-2 ring-inset ring-blue-500' : ''}`}
                onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
            >
                {queue.length === 0 ? (
                    // ✨ 修复优化：上传区域现在可点击且覆盖全区域
                    <div 
                        className="h-full flex flex-col items-center justify-center text-slate-300 cursor-pointer relative"
                        onClick={() => document.getElementById('addFile').click()} // 显式绑定点击
                    >
                        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-slate-100 pointer-events-none">
                             <i className="fa-regular fa-image text-4xl text-slate-200"></i>
                        </div>
                        <p className="text-sm font-bold text-slate-400 pointer-events-none">{t('drag_drop')}</p>
                    </div>
                ) : (
                    queue.map(item => (
                        <div key={item.id} className="flex items-center gap-4 p-3 bg-white rounded-xl border border-slate-200 shadow-sm animate-fade-in-up">
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

        {/* Right: Settings */}
        <div className="w-full lg:w-[340px] bg-white border-l border-slate-200 flex flex-col shadow-xl z-20">
            <div className="p-5 border-b border-slate-100">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide flex items-center gap-2">
                    <i className="fa-solid fa-sliders text-blue-600"></i> {t('settings_title')}
                </h3>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-8 custom-scroll">
                
                {/* 1. Resize Options */}
                <div>
                    <div className="flex p-1 bg-slate-100 rounded-xl mb-4">
                        <button onClick={() => setSettings(s => ({...s, tab: 'pixels'}))} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${settings.tab === 'pixels' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>{t('tab_pixels')}</button>
                        <button onClick={() => setSettings(s => ({...s, tab: 'percentage'}))} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${settings.tab === 'percentage' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>{t('tab_percent')}</button>
                    </div>

                    {settings.tab === 'pixels' ? (
                        <div className="space-y-4 animate-fade-in-up">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 mb-1 block">{t('lbl_width')}</label>
                                    <input type="number" placeholder="Auto" value={settings.width} onChange={(e) => setSettings(s => ({...s, width: e.target.value}))} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 mb-1 block">{t('lbl_height')}</label>
                                    <input type="number" placeholder="Auto" value={settings.height} onChange={(e) => setSettings(s => ({...s, height: e.target.value}))} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition" />
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
                                     <button key={p} onClick={() => setSettings(s => ({...s, percent: p}))} className={`py-2 text-xs font-bold rounded-lg border transition ${settings.percent === p ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>{p}%</button>
                                 ))}
                             </div>
                             <div className="relative">
                                 <input type="number" value={settings.percent} onChange={(e) => setSettings(s => ({...s, percent: parseInt(e.target.value)}))} className="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold focus:border-blue-500 outline-none" />
                                 <span className="absolute right-3 top-2 text-xs font-bold text-slate-400">%</span>
                             </div>
                        </div>
                    )}
                </div>

                <hr className="border-slate-100" />

                {/* 2. Compression Settings */}
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
                            <input type="range" min="1" max="100" value={settings.quality} onChange={(e) => setSettings(s => ({...s, quality: parseInt(e.target.value)}))} className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                            <div className="flex justify-between mt-1">
                                <span className="text-[10px] text-slate-400">{t('val_quality_low')}</span>
                                <span className="text-[10px] text-slate-400">{t('val_quality_high')}</span>
                            </div>
                            <p className="text-[10px] text-blue-500 mt-2 bg-blue-50 p-2 rounded leading-tight">{t('hint_smart')}</p>
                        </div>
                    )}
                </div>

                <hr className="border-slate-100" />

                {/* 3. Privacy Settings */}
                <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">{t('sec_privacy')}</h4>
                    <div className="bg-green-50 p-3 rounded-xl border border-green-100 flex items-start gap-3">
                        <div className="text-green-600 mt-0.5"><i className="fa-solid fa-shield-halved"></i></div>
                        <div>
                            <div className="text-xs font-bold text-slate-700 flex items-center gap-2">
                                {t('chk_strip_metadata')}
                                <i className="fa-solid fa-check-circle text-green-500"></i>
                            </div>
                            <p className="text-[10px] text-slate-500 mt-1 leading-tight">{t('hint_strip_metadata')}</p>
                        </div>
                    </div>
                </div>
                
                {/* ✨ 优化：下载按钮上移至设置流中，不再固定底部，方便一眼看到 */}
                <div className="pt-4">
                    {queue.length > 0 && (
                        <div className="mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                           <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1">
                               <span>{totalProgress === 100 ? t('status_done') : t('status_processing')}</span>
                               <span>{totalProgress}%</span>
                           </div>
                           <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                               <div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${totalProgress}%` }}></div>
                           </div>
                           <div className="text-right mt-1 text-[10px] font-mono text-green-600">
                                {t('stat_saved')}: {formatSize(totalSaved)}
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
            {/* Removed fixed bottom footer */}
        </div>
    </div>
  );
}
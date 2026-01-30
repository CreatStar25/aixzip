import React, { useState, useEffect } from 'react';
import JSZip from 'jszip';
import UPNG from 'upng-js';

const ASSETS_BASE = "https://raw.githubusercontent.com/journey-ad/gemini-watermark-remover/main/src/assets";

export default function WatermarkRemover({ lang }) {
  const [queue, setQueue] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [resources, setResources] = useState({ bg48: null, bg96: null, ready: false });
  const [settings, setSettings] = useState({
    mode: 'lossy',
    quality: 90,
    prefix: '' 
  });
  const [isDragging, setIsDragging] = useState(false); // 新增拖拽状态

  // 简单的内部翻译 (组件内部 UI)
  const t = {
    drag_drop: lang === 'zh-cn' ? '点击或拖拽上传图片' : 'Click or Drag to Upload Images',
    support_hint: lang === 'zh-cn' ? '支持 JPG, PNG, WebP · 支持批量上传' : 'Supports JPG, PNG, WebP · Batch Processing',
    queue_title: lang === 'zh-cn' ? '处理队列' : 'Process Queue',
    clear_list: lang === 'zh-cn' ? '清空列表' : 'Clear List',
    empty_hint: lang === 'zh-cn' ? '等待添加图片...' : 'Waiting for images...',
    settings_title: lang === 'zh-cn' ? '输出设置' : 'Output Settings',
    mode_smart: lang === 'zh-cn' ? '智能压缩' : 'Smart Compress',
    mode_lossless: lang === 'zh-cn' ? '无损模式' : 'Lossless',
    quality_label: lang === 'zh-cn' ? '画质强度' : 'Quality',
    rename_label: lang === 'zh-cn' ? '批量重命名 (可选)' : 'Batch Rename',
    rename_placeholder: lang === 'zh-cn' ? '例如: 毕业照' : 'e.g. Vacation',
    rename_hint: lang === 'zh-cn' ? '留空则保持原名，输入则自动编号' : 'Empty to keep original name',
    stats_saved: lang === 'zh-cn' ? '已优化体积' : 'Size Saved',
    btn_download: lang === 'zh-cn' ? '批量打包下载' : 'Download All as ZIP',
    status_pending: lang === 'zh-cn' ? '等待中' : 'Pending',
    status_processing: lang === 'zh-cn' ? '处理中...' : 'Processing...',
    status_done: lang === 'zh-cn' ? '完成' : 'Done',
    status_error: lang === 'zh-cn' ? '失败' : 'Failed',
    algo_loading: lang === 'zh-cn' ? '正在加载算法资源...' : 'Loading AI resources...',
  };

  useEffect(() => {
    const loadImg = (src) => new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });

    Promise.all([
      loadImg(`${ASSETS_BASE}/bg_48.png`),
      loadImg(`${ASSETS_BASE}/bg_96.png`)
    ]).then(([bg48, bg96]) => {
      setResources({ bg48, bg96, ready: true });
    }).catch(err => {
      console.error("Failed to load assets", err);
      alert(lang === 'zh-cn' ? '资源加载失败' : 'Failed to load resources');
    });
  }, []);

  const processImage = async (file) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      const reader = new FileReader();
      
      reader.onload = (e) => {
        img.src = e.target.result;
        img.onload = () => {
            const cvs = document.createElement('canvas');
            cvs.width = img.naturalWidth;
            cvs.height = img.naturalHeight;
            const ctx = cvs.getContext('2d', { willReadFrequently: true });
            ctx.drawImage(img, 0, 0);

            const cfg = (img.width > 1024 && img.height > 1024) 
                ? { size: 96, margin: 64, bg: resources.bg96 } 
                : { size: 48, margin: 32, bg: resources.bg48 };
            
            const x = img.width - cfg.margin - cfg.size;
            const y = img.height - cfg.margin - cfg.size;

            if (x >= 0 && y >= 0) {
                const imgData = ctx.getImageData(x, y, cfg.size, cfg.size);
                const data = imgData.data;
                const tCvs = document.createElement('canvas');
                tCvs.width = cfg.size; tCvs.height = cfg.size;
                tCvs.getContext('2d').drawImage(cfg.bg, 0, 0);
                const bgData = tCvs.getContext('2d').getImageData(0, 0, cfg.size, cfg.size).data;

                for (let i = 0; i < data.length; i += 4) {
                    const alpha = Math.min(Math.max(bgData[i], bgData[i+1], bgData[i+2]) / 255.0, 0.99);
                    if (alpha > 0) {
                        for(let c=0; c<3; c++) {
                            data[i+c] = Math.max(0, Math.min(255, (data[i+c] - alpha * 255) / (1 - alpha)));
                        }
                    }
                }
                ctx.putImageData(imgData, x, y);
            }

            const isPng = file.type === 'image/png';
            if (isPng && settings.mode === 'lossy') {
                try {
                    const rgbaData = ctx.getImageData(0, 0, img.naturalWidth, img.naturalHeight).data.buffer;
                    const cnum = Math.floor((settings.quality / 100) * 256); 
                    const pngBuffer = UPNG.encode([rgbaData], img.naturalWidth, img.naturalHeight, cnum);
                    resolve(new Blob([pngBuffer], {type: 'image/png'}));
                } catch (err) {
                    cvs.toBlob(b => resolve(b), 'image/png');
                }
            } else {
                const q = settings.mode === 'lossless' ? 1.0 : (settings.quality / 100);
                cvs.toBlob((blob) => {
                    if(blob) resolve(blob);
                    else reject(new Error("Export failed"));
                }, file.type, q);
            }
        };
        img.onerror = reject;
      };
      reader.readAsDataURL(file);
    });
  };

  useEffect(() => {
    if (processing || !resources.ready) return;
    const nextItem = queue.find(i => i.status === 'pending');
    if (nextItem) {
        setProcessing(true);
        processItem(nextItem);
    }
  }, [queue, processing, resources.ready]);

  const processItem = async (item) => {
    setQueue(prev => prev.map(i => i.id === item.id ? { ...i, status: 'processing' } : i));
    try {
        const blob = await processImage(item.file);
        setQueue(prev => prev.map(i => i.id === item.id ? { ...i, status: 'done', blob, resultSize: blob.size } : i));
    } catch (error) {
        setQueue(prev => prev.map(i => i.id === item.id ? { ...i, status: 'error' } : i));
    } finally {
        setProcessing(false);
    }
  };

  const handleFiles = (files) => {
    if (!resources.ready) return;
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

  // --- 修复拖拽问题 ---
  // 阻止浏览器默认打开行为 (在容器上处理)
  const onDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  const onDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files);
        e.dataTransfer.clearData();
    }
  };

  const handleUploadClick = (e) => {
    handleFiles(e.target.files);
    e.target.value = '';
  };

  const handleDownloadSingle = (item) => {
    if (!item.blob) return;
    const link = document.createElement('a');
    link.href = URL.createObjectURL(item.blob);
    link.download = `clean_${item.file.name}`;
    link.click();
  };

  const handleDownloadAll = async () => {
    const validItems = queue.filter(i => i.status === 'done' && i.blob);
    if (validItems.length === 0) return;
    validItems.sort((a, b) => a.file.lastModified - b.file.lastModified);

    const zip = new JSZip();
    const prefix = settings.prefix.trim();
    
    // --- 修改点：文件夹命名 ---
    // 如果有前缀，就用前缀做文件夹名；如果没有，就用 default，但不加 cleaned 后缀
    const folderName = prefix || 'images'; 
    const folder = zip.folder(folderName);

    validItems.forEach((item, index) => {
        let fileName = item.file.name;
        if (prefix) {
            let ext = item.file.type.split('/')[1];
            if (ext === 'jpeg') ext = 'jpg';
            fileName = `${prefix}_${index + 1}.${ext}`;
        }
        folder.file(fileName, item.blob);
    });

    try {
        const content = await zip.generateAsync({type: "blob"});
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = prefix ? `${prefix}.zip` : `batch_images_${Date.now()}.zip`;
        link.click();
    } catch (e) {
        alert("Zip creation failed: " + e.message);
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
        
        {/* 左侧：上传与列表区 */}
        <div className="flex-1 flex flex-col p-4 md:p-6 bg-slate-50/50 gap-4 overflow-hidden">
            
            {/* 上传区域：加高 + 拖拽修复 */}
            <div 
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                className={`flex flex-col items-center justify-center w-full h-48 md:h-64 border-2 border-dashed rounded-2xl transition-all relative overflow-hidden bg-white ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-blue-400'}`}
            >
                <input 
                    type="file" 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" 
                    accept="image/png, image/jpeg, image/webp" 
                    multiple 
                    onChange={handleUploadClick} 
                    disabled={!resources.ready}
                />
                
                <div className="flex flex-col items-center justify-center relative z-10 pointer-events-none">
                    <i className={`fa-solid fa-cloud-arrow-up text-4xl md:text-5xl mb-4 transition-colors ${isDragging ? 'text-blue-600' : 'text-slate-400'}`}></i>
                    <p className="text-base font-bold text-slate-700">{t.drag_drop}</p>
                    <p className="text-xs text-slate-400 mt-2">{t.support_hint}</p>
                </div>
                
                {!resources.ready && (
                    <div className="absolute inset-0 bg-white/90 flex items-center justify-center z-30">
                        <p className="text-sm font-bold text-slate-500 flex items-center gap-2">
                            <i className="fa-solid fa-spinner fa-spin"></i> {t.algo_loading}
                        </p>
                    </div>
                )}
            </div>

            {/* 列表区域 */}
            <div className="flex-1 bg-white border border-slate-200 rounded-2xl flex flex-col overflow-hidden shadow-sm">
                <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.queue_title} ({queue.length})</span>
                    {queue.length > 0 && (
                        <button onClick={() => setQueue([])} className="text-xs text-red-500 hover:text-red-600 font-medium px-2 py-1 hover:bg-red-50 rounded transition">
                            {t.clear_list}
                        </button>
                    )}
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scroll">
                    {queue.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-300 pb-10">
                            <i className="fa-regular fa-image text-4xl mb-3 opacity-30"></i>
                            <p className="text-xs font-medium">{t.empty_hint}</p>
                        </div>
                    ) : (
                        queue.map(item => (
                            <div key={item.id} className="flex items-center justify-between p-3 bg-white hover:bg-slate-50 rounded-xl border border-slate-100 transition-colors">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className={`w-10 h-10 border rounded-lg flex flex-col items-center justify-center text-[10px] font-bold leading-none flex-shrink-0 ${item.file.type.includes('png') ? 'bg-purple-50 text-purple-600 border-purple-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                                        {item.file.type.split('/')[1].toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-bold text-slate-700 truncate max-w-[150px]">{item.file.name}</p>
                                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                                            {formatSize(item.file.size)} 
                                            {item.status === 'done' && (
                                                <span className="text-green-600 ml-1">
                                                    → {formatSize(item.resultSize)}
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    {item.status === 'pending' && <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded">{t.status_pending}</span>}
                                    {item.status === 'processing' && <span className="text-xs text-blue-600 flex items-center gap-1"><i className="fa-solid fa-spinner fa-spin"></i> {t.status_processing}</span>}
                                    {item.status === 'error' && <span className="text-xs text-red-500">{t.status_error}</span>}
                                    {item.status === 'done' && (
                                        <button onClick={() => handleDownloadSingle(item)} className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition flex items-center justify-center">
                                            <i className="fa-solid fa-download text-xs"></i>
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>

        {/* 右侧：设置面板 */}
        <div className="w-full lg:w-80 bg-white border-l border-slate-100 p-6 flex flex-col gap-6 shadow-sm z-20 overflow-y-auto">
            {/* 统计卡片 */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20">
                <div className="text-xs font-medium opacity-80 mb-1">{t.stats_saved}</div>
                <div className="text-3xl font-bold tracking-tight">{formatSize(totalSaved)}</div>
                <div className="mt-4 h-1.5 bg-black/20 rounded-full overflow-hidden">
                    <div className="h-full bg-white transition-all duration-500" style={{ width: `${totalProgress}%` }}></div>
                </div>
            </div>

            <div className="space-y-6">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">{t.settings_title}</h3>
                
                <div className="flex bg-slate-100 p-1 rounded-xl">
                    <button onClick={() => setSettings(s => ({...s, mode: 'lossy'}))} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${settings.mode === 'lossy' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>{t.mode_smart}</button>
                    <button onClick={() => setSettings(s => ({...s, mode: 'lossless'}))} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${settings.mode === 'lossless' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>{t.mode_lossless}</button>
                </div>

                {settings.mode === 'lossy' && (
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-500">{t.quality_label}</span>
                            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{settings.quality}%</span>
                        </div>
                        <input type="range" min="50" max="99" value={settings.quality} onChange={(e) => setSettings(s => ({...s, quality: parseInt(e.target.value)}))} className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                    </div>
                )}

                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 flex justify-between">
                        {t.rename_label}
                        <span className="text-[10px] text-blue-500 font-normal bg-blue-50 px-1.5 rounded">Auto Sort</span>
                    </label>
                    <div className="relative">
                        <input type="text" placeholder={t.rename_placeholder} value={settings.prefix} onChange={(e) => setSettings(s => ({...s, prefix: e.target.value}))} className="w-full pl-3 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition" />
                        <span className="absolute right-3 top-2.5 text-slate-400 text-xs font-mono">_#</span>
                    </div>
                    <p className="text-[10px] text-slate-400">{t.rename_hint}</p>
                </div>
            </div>

            <div className="mt-auto pt-4 border-t border-slate-100">
                <button onClick={handleDownloadAll} disabled={doneItems.length === 0} className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-100 disabled:text-slate-400 text-white rounded-xl font-bold transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-2 active:scale-95">
                    <i className="fa-solid fa-file-zipper"></i>
                    {t.btn_download}
                </button>
            </div>
        </div>
    </div>
  );
}
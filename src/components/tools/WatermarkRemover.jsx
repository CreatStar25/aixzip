import React, { useState, useEffect, useRef } from 'react';
import JSZip from 'jszip';
import UPNG from 'upng-js';

const ASSETS_BASE = "https://raw.githubusercontent.com/journey-ad/gemini-watermark-remover/main/src/assets";

export default function WatermarkRemover({ lang }) {
  // --- State ---
  const [queue, setQueue] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [resources, setResources] = useState({ bg48: null, bg96: null, ready: false });
  const [settings, setSettings] = useState({
    mode: 'lossy',
    quality: 99,
    prefix: '' 
  });
  const [isDragging, setIsDragging] = useState(false);
  
  // ✨ 新增：控制清空确认弹窗的显示
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // --- I18n ---
  const t = {
    drag_text: lang === 'zh-cn' ? '点击或拖拽上传图片' : 'Click or Drag Images Here',
    drag_hint: lang === 'zh-cn' ? '支持 JPG, PNG, WebP · 自动批量处理' : 'Supports JPG, PNG, WebP · Auto Batch Processing',
    loading_algo: lang === 'zh-cn' ? '正在加载 AI 算法...' : 'Loading AI Engine...',
    
    label_quality: lang === 'zh-cn' ? '输出画质' : 'Quality',
    opt_smart: lang === 'zh-cn' ? '智能处理' : 'Smart',
    opt_original: lang === 'zh-cn' ? '原画模式' : 'Original',
    
    label_rename: lang === 'zh-cn' ? '批量重命名' : 'Batch Rename',
    placeholder_rename: lang === 'zh-cn' ? '例如: 毕业照' : 'e.g. Photo',
    
    btn_download: lang === 'zh-cn' ? '打包下载' : 'Download All',
    btn_download_one: lang === 'zh-cn' ? '下载此张' : 'Download',
    btn_processing: lang === 'zh-cn' ? '处理中...' : 'Processing...',
    clear_list: lang === 'zh-cn' ? '清空列表' : 'Clear',
    
    hint_recommend: lang === 'zh-cn' ? '视觉无损 + 显著减小体积 (推荐)' : 'Visually Lossless + Small Size',
    hint_100: lang === 'zh-cn' ? '完全无损 (体积较大)' : 'Lossless (Large Size)',
    hint_lossy: lang === 'zh-cn' ? '有损压缩 + 极致体积' : 'Lossy Compression',
    
    title: lang === 'zh-cn' ? 'Gemini 智能去水印' : 'Gemini Smart Cleaner',
    
    // ✨ 弹窗文案
    modal_title: lang === 'zh-cn' ? '确认清空列表?' : 'Clear All Items?',
    modal_desc: lang === 'zh-cn' ? '所有已处理的图片都将丢失，此操作无法撤销。' : 'All processed images will be lost. This action cannot be undone.',
    modal_cancel: lang === 'zh-cn' ? '取消' : 'Cancel',
    modal_confirm: lang === 'zh-cn' ? '确认清空' : 'Clear All',
    leave_warning: lang === 'zh-cn' ? '您有正在处理或未下载的图片，离开页面将导致数据丢失。' : 'You have unsaved images. Leaving this page will lose your progress.'
  };

  // --- 1. 初始化资源 ---
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
    });
  }, []);

  // --- ✨ 2. 安全防护：防止意外关闭页面 ---
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      // 只要队列里有东西，就阻拦
      if (queue.length > 0) {
        e.preventDefault();
        e.returnValue = t.leave_warning; // 大部分现代浏览器会忽略自定义文本，显示默认提示，但这行必须有
        return t.leave_warning;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [queue, t.leave_warning]);


  // --- 3. 核心处理逻辑 ---
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

            // A. 水印检测与去除
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

                // 智能检测
                let significantMaskPixels = 0;
                let impossiblePixels = 0;
                let n = 0; let sum_i = 0; let sum_m = 0; let sum_im = 0;
                const tolerance = 15;

                for (let i = 0; i < data.length; i += 4) {
                    const val_i = (data[i] + data[i+1] + data[i+2]) / 3;
                    const val_m = (bgData[i] + bgData[i+1] + bgData[i+2]) / 3;

                    if (val_m > 20) {
                        significantMaskPixels++;
                        if (val_i < val_m - tolerance) impossiblePixels++;
                        n++; sum_i += val_i; sum_m += val_m; sum_im += val_i * val_m;
                    }
                }

                const isPhysicallyPossible = significantMaskPixels > 0 && (impossiblePixels / significantMaskPixels) < 0.2;
                const hasWatermark = isPhysicallyPossible && (n * sum_im - sum_i * sum_m) > 10000; 

                if (hasWatermark) {
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
            }

            // B. 导出
            const isPng = file.type === 'image/png';
            if (settings.mode === 'lossy') {
                if (isPng) {
                    try {
                        const rgbaData = ctx.getImageData(0, 0, img.naturalWidth, img.naturalHeight).data.buffer;
                        const cnum = settings.quality >= 100 ? 0 : Math.floor((settings.quality / 100) * 256);
                        const pngBuffer = UPNG.encode([rgbaData], img.naturalWidth, img.naturalHeight, cnum);
                        resolve(new Blob([pngBuffer], {type: 'image/png'}));
                    } catch (err) {
                        cvs.toBlob(b => resolve(b), 'image/png');
                    }
                } else {
                    const q = settings.quality / 100;
                    cvs.toBlob(b => resolve(b), file.type, q);
                }
            } else {
                cvs.toBlob((blob) => {
                    if(blob) resolve(blob);
                    else reject(new Error("Export failed"));
                }, file.type, 1.0);
            }
        };
        img.onerror = reject;
      };
      reader.readAsDataURL(file);
    });
  };

  // --- 4. 队列调度 (✨ 优化：强制串行 + 呼吸时间) ---
  useEffect(() => {
    // 如果正在处理，或者资源没准备好，直接跳过
    if (processing || !resources.ready) return;

    // 寻找下一个待处理任务
    const nextItem = queue.find(i => i.status === 'pending');
    
    if (nextItem) {
        // ✨ 关键优化：使用 setTimeout 将任务推入下一个事件循环
        // 给浏览器 UI 线程留出 100ms 的"呼吸时间"来重绘界面、响应点击等
        // 防止连续处理大量图片导致浏览器假死
        const timer = setTimeout(() => {
            setProcessing(true);
            processItem(nextItem);
        }, 100); 

        return () => clearTimeout(timer);
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
        setProcessing(false); // 处理完成，触发 useEffect 进行下一张
    }
  };

  // --- 5. 交互处理 ---
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
    validItems.sort((a, b) => a.file.lastModified - b.file.lastModified);

    const zip = new JSZip();
    const prefix = settings.prefix.trim();
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
        link.download = prefix ? `${prefix}.zip` : `cleaned_images_${Date.now()}.zip`;
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

  const doneItems = queue.filter(i => i.status === 'done');

  // --- UI Render ---
  return (
    <div className="flex flex-col gap-4 relative">
        
        {/* ✨ 确认清空弹窗 (Custom Modal) */}
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
                        <button 
                            onClick={() => setShowClearConfirm(false)}
                            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition"
                        >
                            {t.modal_cancel}
                        </button>
                        <button 
                            onClick={() => { setQueue([]); setShowClearConfirm(false); }}
                            className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 shadow-lg shadow-red-500/30 transition"
                        >
                            {t.modal_confirm}
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* 上方：上传与预览区 */}
        <div 
            className={`bg-white rounded-3xl shadow-sm border border-slate-100 min-h-[300px] flex flex-col relative transition-all duration-200 overflow-hidden
                ${isDragging ? 'ring-4 ring-emerald-100 border-emerald-400' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
            onDrop={(e) => { 
                e.preventDefault(); setIsDragging(false); 
                if(e.dataTransfer.files) handleFiles(e.dataTransfer.files); 
            }}
        >
            <input 
                type="file" id="fileInput" 
                className="hidden" multiple accept="image/*" 
                onChange={(e) => { handleFiles(e.target.files); e.target.value = ''; }}
            />

            {/* 顶部标题栏 */}
            {queue.length > 0 && (
                <div className="px-5 py-3 border-b border-slate-50 flex justify-between items-center bg-white/80 backdrop-blur-sm sticky top-0 z-10">
                    <span className="text-sm font-bold text-slate-500">{t.title} ({queue.length})</span>
                    {/* ✨ 修改：点击清空时，不直接清空，而是显示确认弹窗 */}
                    <button onClick={() => setShowClearConfirm(true)} className="text-xs text-red-400 hover:text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-full transition">
                        <i className="fa-solid fa-trash-can mr-1"></i> {t.clear_list}
                    </button>
                </div>
            )}

            {/* 内容区 */}
            <div className="flex-1 p-4 overflow-y-auto max-h-[500px] custom-scroll">
                {queue.length === 0 ? (
                    <div 
                        onClick={() => document.getElementById('fileInput').click()}
                        className="h-full flex flex-col items-center justify-center cursor-pointer py-10 group min-h-[250px]"
                    >
                        <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-3xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-emerald-100 transition-all duration-300 shadow-sm">
                            <i className="fa-solid fa-cloud-arrow-up text-2xl"></i>
                        </div>
                        <h3 className="text-lg font-bold text-slate-700 mb-1">{t.drag_text}</h3>
                        <p className="text-slate-400 text-xs">{t.drag_hint}</p>
                        {!resources.ready && (
                            <span className="mt-4 px-4 py-1 bg-slate-100 text-slate-500 text-xs rounded-full animate-pulse">
                                {t.loading_algo}
                            </span>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                        {queue.map(item => (
                            <div key={item.id} className="relative group bg-slate-50 rounded-xl p-2 border border-slate-100 hover:border-emerald-300 hover:shadow-md transition-all">
                                <div className="aspect-square bg-white rounded-lg flex items-center justify-center mb-2 text-slate-300 relative overflow-hidden">
                                    {item.status === 'done' && item.blob ? (
                                        <img src={URL.createObjectURL(item.blob)} className="w-full h-full object-cover opacity-80" alt="" />
                                    ) : (
                                        <i className="fa-regular fa-image text-2xl"></i>
                                    )}
                                    
                                    {/* 右上角操作区 */}
                                    <div className="absolute top-1 right-1 flex gap-1 z-10">
                                        {/* 下载按钮 (仅完成显示) */}
                                        {item.status === 'done' && (
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleDownloadSingle(item); }}
                                                className="w-5 h-5 bg-white rounded-full flex items-center justify-center text-emerald-600 shadow-sm hover:scale-110 hover:bg-emerald-50 transition-transform cursor-pointer border border-emerald-100"
                                                title={t.btn_download_one}
                                            >
                                                <i className="fa-solid fa-download text-[10px]"></i>
                                            </button>
                                        )}

                                        {/* 状态图标 */}
                                        {item.status === 'processing' && <i className="fa-solid fa-spinner fa-spin text-emerald-500 drop-shadow-md"></i>}
                                        {item.status === 'done' && (
                                            <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-white text-[9px] shadow-sm">
                                                <i className="fa-solid fa-check"></i>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="text-center">
                                    <p className="text-[10px] font-bold text-slate-700 truncate w-full mb-0.5">{item.file.name}</p>
                                    <p className="text-[9px] text-slate-400 font-mono">
                                        {item.status === 'done' 
                                            ? <span className="text-emerald-600 font-bold">↓ {formatSize(Math.max(0, item.file.size - item.resultSize))}</span>
                                            : formatSize(item.file.size)
                                        }
                                    </p>
                                </div>
                            </div>
                        ))}
                        <div 
                            onClick={() => document.getElementById('fileInput').click()}
                            className="aspect-square rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:border-emerald-400 hover:bg-emerald-50 transition-colors text-slate-300 hover:text-emerald-500"
                        >
                            <i className="fa-solid fa-plus text-xl mb-1"></i>
                            <span className="text-[10px] font-bold">Add</span>
                        </div>
                    </div>
                )}
            </div>
        </div>

        {/* 底部操作栏 */}
        <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100 p-4 flex flex-col md:flex-row items-center md:items-end justify-between gap-4">
            
            {/* 左侧：压缩设置 */}
            <div className="flex-1 w-full md:w-auto flex flex-col gap-1.5">
                <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t.label_quality}</span>
                    {settings.mode === 'lossy' && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${settings.quality === 99 ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-500'}`}>
                            {settings.quality === 100 ? t.hint_100 : (settings.quality >= 99 ? t.hint_recommend : t.hint_lossy)}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-3 bg-slate-50 p-1.5 rounded-xl border border-slate-100">
                    <div className="flex bg-white rounded-lg p-1 shadow-sm border border-slate-100">
                        <button onClick={() => setSettings(s => ({...s, mode: 'lossy'}))} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${settings.mode === 'lossy' ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}>{t.opt_smart}</button>
                        <button onClick={() => setSettings(s => ({...s, mode: 'lossless'}))} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${settings.mode === 'lossless' ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}>{t.opt_original}</button>
                    </div>
                    {settings.mode === 'lossy' && (
                        <div className="flex items-center gap-2 flex-1 px-1 animate-fade-in">
                            <input type="range" min="1" max="100" value={settings.quality} onChange={(e) => setSettings(s => ({...s, quality: parseInt(e.target.value)}))} className="w-20 md:w-28 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
                            <span className="text-sm font-bold text-emerald-600 min-w-[32px]">{settings.quality}%</span>
                        </div>
                    )}
                </div>
            </div>

            {/* 中间：重命名 */}
            <div className="flex-1 w-full md:w-auto flex flex-col gap-1.5">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t.label_rename}</span>
                <div className="relative">
                    <input type="text" placeholder={t.placeholder_rename} value={settings.prefix} onChange={(e) => setSettings(s => ({...s, prefix: e.target.value}))} className="w-full pl-3 pr-8 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition shadow-inner" />
                    <span className="absolute right-3 top-3.5 text-slate-400 text-xs font-mono select-none">_#</span>
                </div>
            </div>

            {/* 右侧：下载按钮 */}
            <div className="w-full md:w-auto flex-shrink-0 pt-4 md:pt-0">
                <button onClick={handleDownloadAll} disabled={doneItems.length === 0} className="w-full md:w-auto px-6 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/30 transition-all active:scale-95 flex items-center justify-center gap-2">
                    {processing ? (
                        <> <i className="fa-solid fa-spinner fa-spin"></i> {t.btn_processing} </>
                    ) : (
                        <> <i className="fa-solid fa-download"></i> {t.btn_download} {doneItems.length > 0 && <span className="bg-emerald-600 px-1.5 py-0.5 rounded-full text-xs opacity-90">{doneItems.length}</span>} </>
                    )}
                </button>
            </div>

        </div>
    </div>
  );
}
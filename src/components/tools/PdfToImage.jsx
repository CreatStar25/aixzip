import React, { useState, useRef, useEffect, useCallback } from 'react';
import JSZip from 'jszip';

// Worker URL
const workerUrl = '/pdf-worker.mjs';

// --- Internal i18n ---
const LOCALE = {
  'en': {
    title: 'PDF to Image',
    drag_text: 'Click or Drag PDF files here',
    drag_hint: 'Supports PDF files · Auto Batch Processing',
    loading_algo: 'Loading PDF Engine...',
    
    label_quality: 'Output Quality',
    opt_mode_page: 'Convert Pages',
    opt_mode_extract: 'Extract Images',
    
    label_rename: 'Batch Rename',
    placeholder_rename: 'e.g. MySlides',
    
    btn_download: 'Download All',
    btn_download_one: 'Download',
    btn_processing: 'Processing...',
    clear_list: 'Clear List',
    
    hint_recommend: 'Recommended (90%)',
    hint_high: 'High Quality (99%)',
    
    modal_title: 'Clear All Items?',
    modal_desc: 'All processed images will be lost. This action cannot be undone.',
    modal_cancel: 'Cancel',
    modal_confirm: 'Clear All',
    leave_warning: 'You have unsaved images. Leaving this page will lose your progress.',
    
    err_file_type: 'Only PDF files are supported',
    add_more: 'Add'
  },
  'zh-cn': {
    title: 'PDF 转图片',
    drag_text: '点击或拖拽 PDF 文件到这里',
    drag_hint: '支持 PDF 文件 · 自动批量处理',
    loading_algo: '正在加载 PDF 引擎...',
    
    label_quality: '输出画质',
    opt_mode_page: '页面转图',
    opt_mode_extract: '提取图片',
    
    label_rename: '批量重命名',
    placeholder_rename: '例如: 幻灯片',
    
    btn_download: '打包下载',
    btn_download_one: '下载此文件',
    btn_processing: '处理中...',
    clear_list: '清空列表',
    
    hint_recommend: '推荐 (90%)',
    hint_high: '高清 (99%)',
    
    modal_title: '确认清空列表?',
    modal_desc: '所有已处理的图片都将丢失，此操作无法撤销。',
    modal_cancel: '取消',
    modal_confirm: '确认清空',
    leave_warning: '您有正在处理或未下载的图片，离开页面将导致数据丢失。',
    
    err_file_type: '仅支持 PDF 文件',
    add_more: '添加'
  },
  'ja': {
    title: 'PDF 画像変換',
    drag_text: 'PDFをクリックまたはドラッグ',
    drag_hint: 'PDFファイル対応 · 自動一括処理',
    loading_algo: 'PDFエンジンを読み込み中...',
    
    label_quality: '出力画質',
    opt_mode_page: 'ページ変換',
    opt_mode_extract: '画像抽出',
    
    label_rename: '一括リネーム',
    placeholder_rename: '例: 会議資料',
    
    btn_download: '一括ダウンロード',
    btn_download_one: 'ダウンロード',
    btn_processing: '処理中...',
    clear_list: 'リストをクリア',
    
    hint_recommend: '推奨 (90%)',
    hint_high: '高品質 (99%)',
    
    modal_title: 'リストをクリアしますか？',
    modal_desc: '処理された画像はすべて失われます。この操作は取り消せません。',
    modal_cancel: 'キャンセル',
    modal_confirm: 'クリア',
    leave_warning: '処理中です。ページを離れると進捗が失われます。',
    
    err_file_type: 'PDFファイルのみ対応しています',
    add_more: '追加'
  }
};

export default function PdfToImage({ lang }) {
  // --- State ---
  const [files, setFiles] = useState([]); // Array of { id, file, status, pageCount, ... }
  const [previews, setPreviews] = useState([]); // Array of generated images { id, src, name, ... }
  const [processing, setProcessing] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  
  // Settings
  const [convertMode, setConvertMode] = useState('page'); // 'page' | 'extract'
  const [quality, setQuality] = useState(90); // 90 or 99
  const [imageFormat, setImageFormat] = useState('jpeg'); // 'jpeg' | 'png'
  const [zipFilename, setZipFilename] = useState('');
  
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const pdfJsRef = useRef(null);
  const [engineReady, setEngineReady] = useState(false);

  // Get translations
  const t = LOCALE[lang] || LOCALE['en'];

  // --- Initialize PDF.js ---
  useEffect(() => {
    const initPdfJs = async () => {
      if (pdfJsRef.current) return;
      try {
        const pdfjsLib = await import('pdfjs-dist/build/pdf.min.mjs');
        pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;
        pdfJsRef.current = pdfjsLib;
        setEngineReady(true);
        console.log("PDF.js initialized");
      } catch (error) {
        console.error("Failed to load PDF.js", error);
      }
    };
    initPdfJs();
  }, []);

  // --- Prevent Accidental Navigation ---
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (files.length > 0) {
        e.preventDefault();
        e.returnValue = t.leave_warning;
        return t.leave_warning;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [files, t.leave_warning]);

  // --- File Handling ---
  const handleFiles = (newFileObjects) => {
    if (!engineReady) return;
    
    const validFiles = Array.from(newFileObjects)
      .filter(f => f.type === 'application/pdf')
      .map(f => ({
        id: Math.random().toString(36).substr(2, 9),
        file: f,
        name: f.name,
        size: f.size,
        status: 'pending', // pending, processing, done, error
        pageCount: 0
      }));

    if (validFiles.length > 0) {
      setFiles(prev => [...prev, ...validFiles]);
    } else if (newFileObjects.length > 0) {
      alert(t.err_file_type);
    }
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
  }, [engineReady, t]);

  // --- Processing Queue ---
  useEffect(() => {
    if (processing || !engineReady || files.length === 0) return;

    // Find next pending file
    const nextFile = files.find(f => f.status === 'pending');
    if (nextFile) {
      const timer = setTimeout(() => {
        setProcessing(true);
        processFile(nextFile);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [files, processing, engineReady]);

  // --- Core Processing Logic ---
  const processFile = async (fileObj) => {
    // Update status to processing
    setFiles(prev => prev.map(f => f.id === fileObj.id ? { ...f, status: 'processing' } : f));

    try {
      const pdfjsLib = pdfJsRef.current;
      const arrayBuffer = await fileObj.file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      // Update page count
      setFiles(prev => prev.map(f => f.id === fileObj.id ? { ...f, pageCount: pdf.numPages } : f));

      const newPreviews = [];
      const q = 0.8; // Preview quality

      if (convertMode === 'page') {
        for (let p = 1; p <= pdf.numPages; p++) {
          const page = await pdf.getPage(p);
          const viewport = page.getViewport({ scale: 0.6 }); // Small scale for preview
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          await page.render({ canvasContext: context, viewport: viewport }).promise;
          
          const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', q));
          newPreviews.push({
            id: `${fileObj.id}_p${p}`,
            src: URL.createObjectURL(blob),
            name: `${fileObj.file.name}_page_${p}`,
            originalFileId: fileObj.id,
            blob: blob // Store blob for single download (preview quality)
          });
        }
      } else {
        // Extract mode
        for (let p = 1; p <= pdf.numPages; p++) {
          try {
            const page = await pdf.getPage(p);
            const ops = await page.getOperatorList();
            let imgCount = 0;
            for (let j = 0; j < ops.fn.length; j++) {
              if (ops.fn[j] === pdfjsLib.OPS.paintImageXObject) {
                const imgName = ops.args[j][0];
                try {
                  const imgObj = await page.objs.get(imgName);
                  if (imgObj && imgObj.width > 50 && imgObj.height > 50) {
                    const imgCanvas = document.createElement('canvas');
                    imgCanvas.width = imgObj.width;
                    imgCanvas.height = imgObj.height;
                    const ctx = imgCanvas.getContext('2d');
                    const imgData = ctx.createImageData(imgObj.width, imgObj.height);
                    imgData.data.set(imgObj.data);
                    ctx.putImageData(imgData, 0, 0);
                    
                    const blob = await new Promise(resolve => imgCanvas.toBlob(resolve, 'image/jpeg', q));
                    newPreviews.push({
                      id: `${fileObj.id}_p${p}_i${imgCount}`,
                      src: URL.createObjectURL(blob),
                      name: `${fileObj.file.name}_img_${p}_${imgCount}`,
                      originalFileId: fileObj.id,
                      blob: blob
                    });
                    imgCount++;
                  }
                } catch(e) {}
              }
            }
          } catch(e) {}
        }
      }

      setPreviews(prev => [...prev, ...newPreviews]);
      setFiles(prev => prev.map(f => f.id === fileObj.id ? { ...f, status: 'done' } : f));
    } catch (err) {
      console.error("Error processing file", err);
      setFiles(prev => prev.map(f => f.id === fileObj.id ? { ...f, status: 'error' } : f));
    } finally {
      setProcessing(false);
    }
  };

  // --- Mode Change ---
  const handleModeChange = (newMode) => {
    if (newMode === convertMode) return;
    setConvertMode(newMode);
    setPreviews([]);
    setFiles(prev => prev.map(f => ({ ...f, status: 'pending' })));
  };

  // --- Download Logic ---
  const handleDownloadAll = async () => {
    if (previews.length === 0) return;
    setProcessing(true);
    
    try {
      const zip = new JSZip();
      const folderName = zipFilename.trim() || `pdf_images_${Date.now()}`;
      const rootFolder = zip.folder(folderName);
      
      const pdfjsLib = pdfJsRef.current;
      let globalCount = 0;

      // Re-process files for high quality if needed, or use previews if they are good enough?
      // User wants high quality. Previews are low quality (scale 0.6).
      // So we must re-render pages at high scale.
      
      for (const fileObj of files) {
        if (fileObj.status !== 'done') continue;
        
        const arrayBuffer = await fileObj.file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const baseName = fileObj.file.name.replace('.pdf', '');

        if (convertMode === 'page') {
           for (let p = 1; p <= pdf.numPages; p++) {
             const page = await pdf.getPage(p);
             const scale = quality > 95 ? 2.5 : 1.5; // High vs Rec
             const viewport = page.getViewport({ scale: scale });
             const canvas = document.createElement('canvas');
             const context = canvas.getContext('2d');
             canvas.height = viewport.height;
             canvas.width = viewport.width;
             await page.render({ canvasContext: context, viewport: viewport }).promise;
             
             const q = quality / 100;
             const blob = await new Promise(resolve => canvas.toBlob(resolve, `image/${imageFormat}`, q));
             
             // Rename logic
             let fileName;
             if (zipFilename.trim()) {
               fileName = `${zipFilename}_${globalCount + 1}.${imageFormat === 'jpeg' ? 'jpg' : 'png'}`;
             } else {
               fileName = `${baseName}_page_${p}.${imageFormat === 'jpeg' ? 'jpg' : 'png'}`;
             }
             
             rootFolder.file(fileName, blob);
             globalCount++;
           }
        } else {
          // Extract mode - extract raw images again or use what we found?
          // Extracting again is safer for blob creation
          for (let p = 1; p <= pdf.numPages; p++) {
             const page = await pdf.getPage(p);
             const ops = await page.getOperatorList();
             let imgCount = 0;
             for (let j = 0; j < ops.fn.length; j++) {
               if (ops.fn[j] === pdfjsLib.OPS.paintImageXObject) {
                 const imgName = ops.args[j][0];
                 try {
                   const imgObj = await page.objs.get(imgName);
                   if (imgObj && imgObj.width > 50 && imgObj.height > 50) {
                     const imgCanvas = document.createElement('canvas');
                     imgCanvas.width = imgObj.width;
                     imgCanvas.height = imgObj.height;
                     const ctx = imgCanvas.getContext('2d');
                     const imgData = ctx.createImageData(imgObj.width, imgObj.height);
                     imgData.data.set(imgObj.data);
                     ctx.putImageData(imgData, 0, 0);
                     
                     const q = quality / 100;
                     const blob = await new Promise(resolve => imgCanvas.toBlob(resolve, `image/${imageFormat}`, q));
                     
                     let fileName;
                     if (zipFilename.trim()) {
                       fileName = `${zipFilename}_${globalCount + 1}.${imageFormat === 'jpeg' ? 'jpg' : 'png'}`;
                     } else {
                       fileName = `${baseName}_img_${p}_${imgCount}.${imageFormat === 'jpeg' ? 'jpg' : 'png'}`;
                     }
                     
                     rootFolder.file(fileName, blob);
                     globalCount++;
                     imgCount++;
                   }
                 } catch(e){}
               }
             }
          }
        }
      }

      const content = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = `${folderName}.zip`;
      link.click();

    } catch (err) {
      console.error("Download failed", err);
      alert("Error generating ZIP");
    } finally {
      setProcessing(false);
    }
  };

  const handleDownloadSingle = (previewItem) => {
    if (!previewItem.blob) return;
    const link = document.createElement('a');
    link.href = previewItem.src;
    link.download = previewItem.name + '.jpg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-4 relative">
      
      {/* Clear Confirm Modal */}
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
                onClick={() => { setFiles([]); setPreviews([]); setShowClearConfirm(false); }}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 shadow-lg shadow-red-500/30 transition"
              >
                {t.modal_confirm}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload & Preview Area */}
      <div 
        className={`bg-white rounded-3xl shadow-sm border border-slate-100 min-h-[300px] flex flex-col relative transition-all duration-200 overflow-hidden
          ${isDragging ? 'ring-4 ring-blue-100 border-blue-400' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
        onDrop={handleDrop}
      >
        <input 
          type="file" id="fileInput" ref={fileInputRef}
          className="hidden" multiple accept=".pdf"
          onChange={(e) => { if(e.target.files) handleFiles(e.target.files); e.target.value = ''; }}
        />

        {/* Sticky Header */}
        {files.length > 0 && (
          <div className="px-5 py-3 border-b border-slate-50 flex justify-between items-center bg-white/80 backdrop-blur-sm sticky top-0 z-10">
             <span className="text-sm font-bold text-slate-500">{t.title} ({previews.length})</span>
             <button onClick={() => setShowClearConfirm(true)} className="text-xs text-red-400 hover:text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-full transition">
                <i className="fa-solid fa-trash-can mr-1"></i> {t.clear_list}
             </button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 p-4 overflow-y-auto max-h-[500px] custom-scroll">
           {files.length === 0 ? (
             <div 
               onClick={() => fileInputRef.current?.click()}
               className="h-full flex flex-col items-center justify-center cursor-pointer py-10 group min-h-[250px]"
             >
               <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-3xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-blue-100 transition-all duration-300 shadow-sm">
                 <i className="fa-solid fa-cloud-arrow-up text-2xl"></i>
               </div>
               <h3 className="text-lg font-bold text-slate-700 mb-1">{t.drag_text}</h3>
               <p className="text-slate-400 text-xs">{t.drag_hint}</p>
               {!engineReady && (
                 <span className="mt-4 px-4 py-1 bg-slate-100 text-slate-500 text-xs rounded-full animate-pulse">
                   {t.loading_algo}
                 </span>
               )}
             </div>
           ) : (
             <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {previews.map((item, idx) => (
                  <div key={item.id} className="relative group bg-slate-50 rounded-xl p-2 border border-slate-100 hover:border-blue-300 hover:shadow-md transition-all">
                     <div className="aspect-[3/4] bg-white rounded-lg flex items-center justify-center mb-2 text-slate-300 relative overflow-hidden">
                        <img src={item.src} className="w-full h-full object-contain" alt="" />
                        
                        {/* Top Right Actions */}
                        <div className="absolute top-1 right-1 flex gap-1 z-10">
                           <button 
                             onClick={(e) => { e.stopPropagation(); handleDownloadSingle(item); }}
                             className="w-5 h-5 bg-white rounded-full flex items-center justify-center text-blue-600 shadow-sm hover:scale-110 hover:bg-blue-50 transition-transform cursor-pointer border border-blue-100"
                             title={t.btn_download_one}
                           >
                             <i className="fa-solid fa-download text-[10px]"></i>
                           </button>
                        </div>
                     </div>
                     <div className="text-center">
                       <p className="text-[10px] font-bold text-slate-700 truncate w-full mb-0.5">{item.name}</p>
                     </div>
                  </div>
                ))}
                
                {/* Processing Indicator or Add Button */}
                {processing ? (
                   <div className="aspect-[3/4] bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center animate-pulse">
                      <i className="fa-solid fa-spinner fa-spin text-blue-400 text-2xl mb-2"></i>
                      <span className="text-xs text-slate-400 font-medium">{t.btn_processing}</span>
                   </div>
                ) : (
                   <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-[3/4] rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors text-slate-300 hover:text-blue-500"
                   >
                      <i className="fa-solid fa-plus text-xl mb-1"></i>
                      <span className="text-[10px] font-bold">{t.add_more}</span>
                   </div>
                )}
             </div>
           )}
        </div>
      </div>

      {/* Bottom Action Bar */}
      {files.length > 0 && (
         <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100 p-4 flex flex-col md:flex-row items-center md:items-end justify-between gap-4">
            
            {/* Left: Quality & Mode */}
            <div className="flex-1 w-full md:w-auto flex flex-col gap-1.5">
               <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t.label_quality}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${quality === 99 ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-500'}`}>
                     {quality === 99 ? t.hint_high : t.hint_recommend}
                  </span>
               </div>
               <div className="flex items-center gap-3 bg-slate-50 p-1.5 rounded-xl border border-slate-100">
                  {/* Mode Switch */}
                  <div className="flex bg-white rounded-lg p-1 shadow-sm border border-slate-100">
                     <button onClick={() => handleModeChange('page')} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${convertMode === 'page' ? 'bg-blue-500 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}>{t.opt_mode_page}</button>
                     <button onClick={() => handleModeChange('extract')} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${convertMode === 'extract' ? 'bg-blue-500 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}>{t.opt_mode_extract}</button>
                  </div>
                  
                  {/* Quality Slider (Mocked as toggle for now to match 90/99 requirement, or use range if preferred. User said "same as gemini". Gemini has range 1-100. But PDF quality is usually 0-1. Let's use range 1-100) */}
                  <div className="flex items-center gap-2 flex-1 px-1">
                      <input 
                        type="range" min="10" max="100" step="10"
                        value={quality} 
                        onChange={(e) => setQuality(parseInt(e.target.value))} 
                        className="w-20 md:w-28 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500" 
                      />
                      <span className="text-sm font-bold text-blue-600 min-w-[32px]">{quality}%</span>
                  </div>
               </div>
            </div>

            {/* Middle: Rename */}
            <div className="flex-1 w-full md:w-auto flex flex-col gap-1.5">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t.label_rename}</span>
                <div className="relative">
                    <input 
                      type="text" 
                      placeholder={t.placeholder_rename} 
                      value={zipFilename} 
                      onChange={(e) => setZipFilename(e.target.value)} 
                      className="w-full pl-3 pr-8 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition shadow-inner" 
                    />
                    <span className="absolute right-3 top-3.5 text-slate-400 text-xs font-mono select-none">_#</span>
                </div>
            </div>

            {/* Right: Download */}
            <div className="w-full md:w-auto flex-shrink-0 pt-4 md:pt-0">
                <button 
                  onClick={handleDownloadAll} 
                  disabled={previews.length === 0 || processing} 
                  className="w-full md:w-auto px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-500/30 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                    {processing ? (
                        <> <i className="fa-solid fa-spinner fa-spin"></i> {t.btn_processing} </>
                    ) : (
                        <> <i className="fa-solid fa-download"></i> {t.btn_download} {previews.length > 0 && <span className="bg-blue-600 px-1.5 py-0.5 rounded-full text-xs opacity-90">{previews.length}</span>} </>
                    )}
                </button>
            </div>

         </div>
      )}

    </div>
  );
}

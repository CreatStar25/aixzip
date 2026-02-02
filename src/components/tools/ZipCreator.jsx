import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import JSZip from 'jszip';

// --- Helper: Generate Unique Path (Prevent Duplicates) ---
// 递归检测并生成如 "file (1).txt" 的唯一路径
const getUniquePath = (existingPathsSet, fullPath) => {
  if (!existingPathsSet.has(fullPath)) return fullPath;

  const lastDotIndex = fullPath.lastIndexOf('.');
  const lastSlashIndex = fullPath.lastIndexOf('/');
  
  let name, ext;

  if (lastDotIndex === -1 || lastDotIndex < lastSlashIndex) {
    name = fullPath;
    ext = '';
  } else {
    name = fullPath.substring(0, lastDotIndex);
    ext = fullPath.substring(lastDotIndex);
  }

  let counter = 1;
  let newPath = `${name} (${counter})${ext}`;

  while (existingPathsSet.has(newPath)) {
    counter++;
    newPath = `${name} (${counter})${ext}`;
  }

  return newPath;
};

export default function ZipCreator({ lang }) {
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [zipName, setZipName] = useState('archive');
  const [resultStats, setResultStats] = useState(null);

  const fileInputRef = useRef(null);
  const folderInputRef = useRef(null);

  // --- Page Leave Protection ---
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (files.length > 0) {
        e.preventDefault();
        e.returnValue = ''; 
        return '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [files]);

  // --- Translations (24 Languages) ---
  const t = (key) => {
    const dict = {
      'en': {
        drag_drop: 'Click or Drag files/folders here',
        support_hint: 'Supports folders & recursive scanning',
        file_list: 'File List',
        clear_list: 'Clear List',
        lbl_filename: 'Filename (Optional)',
        btn_create: 'Start Compressing',
        status_processing: 'Archiving...',
        status_done: 'Complete!',
        add_files: 'Add Files',
        add_folder: 'Add Folder',
        stat_original: 'Original',
        stat_compressed: 'Compressed',
        stat_saved: 'Reduced by',
        encoding_hint: 'UTF-8 encoding (Win/Mac compatible).'
      },
      'zh-cn': {
        drag_drop: '点击或拖拽文件/文件夹到这里',
        support_hint: '支持文件夹拖拽 & 递归扫描',
        file_list: '文件列表',
        clear_list: '清空列表',
        lbl_filename: '文件名 (可选)',
        btn_create: '开始压缩',
        status_processing: '正在打包...',
        status_done: '压缩完成！',
        add_files: '添加文件',
        add_folder: '添加文件夹',
        stat_original: '原始体积',
        stat_compressed: '压缩后',
        stat_saved: '体积减少',
        encoding_hint: 'UTF-8 编码（兼容 Win/Mac）。'
      },
      'zh-tw': {
        drag_drop: '點擊或拖曳檔案/資料夾到這裡',
        support_hint: '支援資料夾拖曳 & 遞迴掃描',
        file_list: '檔案列表',
        clear_list: '清空列表',
        lbl_filename: '檔名 (可選)',
        btn_create: '開始壓縮',
        status_processing: '正在打包...',
        status_done: '壓縮完成！',
        add_files: '添加檔案',
        add_folder: '添加資料夾',
        stat_original: '原始體積',
        stat_compressed: '壓縮後',
        stat_saved: '體積減少',
        encoding_hint: 'UTF-8 編碼（相容 Win/Mac）。'
      },
      'es': {
        drag_drop: 'Haga clic o arrastre archivos aquí',
        support_hint: 'Soporta carpetas y escaneo recursivo',
        file_list: 'Archivos',
        clear_list: 'Borrar todo',
        lbl_filename: 'Nombre (Opcional)',
        btn_create: 'Comprimir',
        status_processing: 'Archivando...',
        status_done: '¡Completado!',
        add_files: 'Añadir Archivos',
        add_folder: 'Añadir Carpeta',
        stat_original: 'Original',
        stat_compressed: 'Comprimido',
        stat_saved: 'Reducido',
        encoding_hint: 'Codificación UTF-8 (Compatible Win/Mac).'
      },
      'ar': {
        drag_drop: 'انقر أو اسحب الملفات/المجلدات هنا',
        support_hint: 'يدعم المجلدات والمسح المتكرر',
        file_list: 'قائمة الملفات',
        clear_list: 'مسح القائمة',
        lbl_filename: 'اسم الملف (اختياري)',
        btn_create: 'بدء الضغط',
        status_processing: 'جاري الأرشفة...',
        status_done: 'اكتمل!',
        add_files: 'إضافة ملفات',
        add_folder: 'إضافة مجلد',
        stat_original: 'الأصلي',
        stat_compressed: 'المضغوط',
        stat_saved: 'تم التوفير',
        encoding_hint: 'ترميز UTF-8 (متوافق مع Win/Mac).'
      },
      'pt': {
        drag_drop: 'Clique ou arraste arquivos aqui',
        support_hint: 'Suporta pastas e verificação recursiva',
        file_list: 'Arquivos',
        clear_list: 'Limpar',
        lbl_filename: 'Nome (Opcional)',
        btn_create: 'Comprimir',
        status_processing: 'Arquivando...',
        status_done: 'Concluído!',
        add_files: 'Add Arquivos',
        add_folder: 'Add Pasta',
        stat_original: 'Original',
        stat_compressed: 'Comprimido',
        stat_saved: 'Reduzido',
        encoding_hint: 'Codificação UTF-8 (Compatível Win/Mac).'
      },
      'id': {
        drag_drop: 'Klik atau Tarik file/folder ke sini',
        support_hint: 'Mendukung folder & pemindaian rekursif',
        file_list: 'Daftar File',
        clear_list: 'Bersihkan',
        lbl_filename: 'Nama File (Opsional)',
        btn_create: 'Mulai Kompres',
        status_processing: 'Memproses...',
        status_done: 'Selesai!',
        add_files: 'Tambah File',
        add_folder: 'Tambah Folder',
        stat_original: 'Asli',
        stat_compressed: 'Kompresi',
        stat_saved: 'Berkurang',
        encoding_hint: 'Encoding UTF-8 (Kompatibel Win/Mac).'
      },
      'ms': {
        drag_drop: 'Klik atau Seret fail/folder di sini',
        support_hint: 'Menyokong folder & imbasan rekursif',
        file_list: 'Senarai Fail',
        clear_list: 'Kosongkan',
        lbl_filename: 'Nama Fail (Pilihan)',
        btn_create: 'Mula Mampat',
        status_processing: 'Mengarkib...',
        status_done: 'Selesai!',
        add_files: 'Tambah Fail',
        add_folder: 'Tambah Folder',
        stat_original: 'Asal',
        stat_compressed: 'Dimampatkan',
        stat_saved: 'Kurang',
        encoding_hint: 'Pengekodan UTF-8 (Serasi Win/Mac).'
      },
      'fr': {
        drag_drop: 'Cliquez ou glissez fichiers ici',
        support_hint: 'Dossiers et scan récursif supportés',
        file_list: 'Fichiers',
        clear_list: 'Effacer',
        lbl_filename: 'Nom (Optionnel)',
        btn_create: 'Compresser',
        status_processing: 'Archivage...',
        status_done: 'Terminé !',
        add_files: 'Ajouter Fichiers',
        add_folder: 'Ajouter Dossier',
        stat_original: 'Original',
        stat_compressed: 'Compressé',
        stat_saved: 'Réduit de',
        encoding_hint: 'Encodage UTF-8 (Compatible Win/Mac).'
      },
      'ru': {
        drag_drop: 'Нажмите или перетащите файлы сюда',
        support_hint: 'Поддержка папок и рекурсии',
        file_list: 'Файлы',
        clear_list: 'Очистить',
        lbl_filename: 'Имя (Опционально)',
        btn_create: 'Сжать',
        status_processing: 'Архивация...',
        status_done: 'Готово!',
        add_files: 'Добавить файлы',
        add_folder: 'Добавить папку',
        stat_original: 'Исх. размер',
        stat_compressed: 'Сжатый',
        stat_saved: 'Сжато на',
        encoding_hint: 'Кодировка UTF-8 (Совм. с Win/Mac).'
      },
      'hi': {
        drag_drop: 'फ़ाइलें/फ़ोल्डर यहाँ क्लिक करें या खींचें',
        support_hint: 'फ़ोल्डर और पुनरावर्ती स्कैन का समर्थन',
        file_list: 'फ़ाइल सूची',
        clear_list: 'साफ़ करें',
        lbl_filename: 'फ़ाइल नाम (वैकल्पिक)',
        btn_create: 'संपीड़ित करें',
        status_processing: 'प्रक्रिया जारी...',
        status_done: 'पूरा हुआ!',
        add_files: 'फ़ाइलें जोड़ें',
        add_folder: 'फ़ोल्डर जोड़ें',
        stat_original: 'मूल',
        stat_compressed: 'संपीड़ित',
        stat_saved: 'बचत',
        encoding_hint: 'UTF-8 एन्कोडिंग (Win/Mac संगत)।'
      },
      'ja': {
        drag_drop: 'ファイル/フォルダをここにドロップ',
        support_hint: 'フォルダと再帰スキャンに対応',
        file_list: 'ファイルリスト',
        clear_list: 'クリア',
        lbl_filename: 'ファイル名 (任意)',
        btn_create: '圧縮開始',
        status_processing: '処理中...',
        status_done: '完了！',
        add_files: 'ファイル追加',
        add_folder: 'フォルダ追加',
        stat_original: '元サイズ',
        stat_compressed: '圧縮後',
        stat_saved: '削減率',
        encoding_hint: 'UTF-8エンコード (Win/Mac互換)。'
      },
      'de': {
        drag_drop: 'Dateien/Ordner hierher ziehen',
        support_hint: 'Unterstützt Ordner & Rekursion',
        file_list: 'Dateien',
        clear_list: 'Leeren',
        lbl_filename: 'Dateiname (Optional)',
        btn_create: 'Komprimieren',
        status_processing: 'Verarbeite...',
        status_done: 'Fertig!',
        add_files: 'Dateien +',
        add_folder: 'Ordner +',
        stat_original: 'Original',
        stat_compressed: 'Komprimiert',
        stat_saved: 'Reduziert',
        encoding_hint: 'UTF-8 Kodierung (Win/Mac kompatibel).'
      },
      'ko': {
        drag_drop: '파일/폴더를 여기로 드래그',
        support_hint: '폴더 및 재귀 스캔 지원',
        file_list: '파일 목록',
        clear_list: '지우기',
        lbl_filename: '파일명 (선택)',
        btn_create: '압축 시작',
        status_processing: '압축 중...',
        status_done: '완료!',
        add_files: '파일 추가',
        add_folder: '폴더 추가',
        stat_original: '원본',
        stat_compressed: '압축 후',
        stat_saved: '절약',
        encoding_hint: 'UTF-8 인코딩 (Win/Mac 호환).'
      },
      'tr': {
        drag_drop: 'Dosyaları/klasörleri buraya sürükleyin',
        support_hint: 'Klasör ve özyinelemeli tarama desteği',
        file_list: 'Dosyalar',
        clear_list: 'Temizle',
        lbl_filename: 'Dosya Adı (İsteğe bağlı)',
        btn_create: 'Sıkıştır',
        status_processing: 'Arşivleniyor...',
        status_done: 'Tamamlandı!',
        add_files: 'Dosya Ekle',
        add_folder: 'Klasör Ekle',
        stat_original: 'Orijinal',
        stat_compressed: 'Sıkıştırılmış',
        stat_saved: 'Tasarruf',
        encoding_hint: 'UTF-8 kodlaması (Win/Mac uyumlu).'
      },
      'vi': {
        drag_drop: 'Nhấp hoặc Kéo thả tệp/thư mục',
        support_hint: 'Hỗ trợ thư mục & quét đệ quy',
        file_list: 'Danh sách',
        clear_list: 'Xóa',
        lbl_filename: 'Tên tệp (Tùy chọn)',
        btn_create: 'Nén Ngay',
        status_processing: 'Đang xử lý...',
        status_done: 'Hoàn tất!',
        add_files: 'Thêm Tệp',
        add_folder: 'Thêm Thư mục',
        stat_original: 'Gốc',
        stat_compressed: 'Đã nén',
        stat_saved: 'Giảm',
        encoding_hint: 'Mã hóa UTF-8 (Tương thích Win/Mac).'
      },
      'th': {
        drag_drop: 'คลิกหรือลากไฟล์/โฟลเดอร์มาที่นี่',
        support_hint: 'รองรับโฟลเดอร์และการสแกนแบบวนซ้ำ',
        file_list: 'รายการไฟล์',
        clear_list: 'ล้าง',
        lbl_filename: 'ชื่อไฟล์ (ไม่บังคับ)',
        btn_create: 'เริ่มบีบอัด',
        status_processing: 'กำลังดำเนินการ...',
        status_done: 'เสร็จสิ้น!',
        add_files: 'เพิ่มไฟล์',
        add_folder: 'เพิ่มโฟลเดอร์',
        stat_original: 'ขนาดเดิม',
        stat_compressed: 'บีบอัดแล้ว',
        stat_saved: 'ลดลง',
        encoding_hint: 'เข้ารหัส UTF-8 (รองรับ Win/Mac)'
      },
      'it': {
        drag_drop: 'Clicca o trascina file/cartelle qui',
        support_hint: 'Supporta cartelle e scansione ricorsiva',
        file_list: 'File',
        clear_list: 'Pulisci',
        lbl_filename: 'Nome (Opzionale)',
        btn_create: 'Comprimi',
        status_processing: 'Archiviazione...',
        status_done: 'Completato!',
        add_files: 'Agg. File',
        add_folder: 'Agg. Cartella',
        stat_original: 'Originale',
        stat_compressed: 'Compresso',
        stat_saved: 'Ridotto',
        encoding_hint: 'Codifica UTF-8 (Compatibile Win/Mac).'
      },
      'fa': {
        drag_drop: 'فایل‌ها/پوشه‌ها را اینجا بکشید',
        support_hint: 'پشتیبانی از پوشه‌ها',
        file_list: 'لیست فایل',
        clear_list: 'پاک کردن',
        lbl_filename: 'نام فایل (اختیاری)',
        btn_create: 'فشرده‌سازی',
        status_processing: 'در حال انجام...',
        status_done: 'انجام شد!',
        add_files: 'افزودن فایل',
        add_folder: 'افزودن پوشه',
        stat_original: 'اصلی',
        stat_compressed: 'فشرده',
        stat_saved: 'کاهش',
        encoding_hint: 'کدگذاری UTF-8 (سازگار با Win/Mac).'
      },
      'nl': {
        drag_drop: 'Klik of sleep bestanden hierheen',
        support_hint: 'Ondersteunt mappen & recursie',
        file_list: 'Bestanden',
        clear_list: 'Wissen',
        lbl_filename: 'Naam (Optioneel)',
        btn_create: 'Comprimeren',
        status_processing: 'Verwerken...',
        status_done: 'Voltooid!',
        add_files: 'Bestanden +',
        add_folder: 'Map +',
        stat_original: 'Origineel',
        stat_compressed: 'Gecomprimeerd',
        stat_saved: 'Verminderd',
        encoding_hint: 'UTF-8 codering (Win/Mac compatibel).'
      },
      'pl': {
        drag_drop: 'Kliknij lub przeciągnij pliki tutaj',
        support_hint: 'Obsługa folderów i rekurencji',
        file_list: 'Pliki',
        clear_list: 'Wyczyść',
        lbl_filename: 'Nazwa (Opcjonalne)',
        btn_create: 'Kompresuj',
        status_processing: 'Archiwizacja...',
        status_done: 'Gotowe!',
        add_files: 'Dodaj Pliki',
        add_folder: 'Dodaj Folder',
        stat_original: 'Oryginał',
        stat_compressed: 'Skompresowany',
        stat_saved: 'Zmniejszono',
        encoding_hint: 'Kodowanie UTF-8 (Zgodne z Win/Mac).'
      },
      'sv': {
        drag_drop: 'Klicka eller dra filer hit',
        support_hint: 'Stöder mappar & rekursion',
        file_list: 'Filer',
        clear_list: 'Rensa',
        lbl_filename: 'Filnamn (Valfritt)',
        btn_create: 'Komprimera',
        status_processing: 'Arkiverar...',
        status_done: 'Klart!',
        add_files: 'Lägg till filer',
        add_folder: 'Lägg till mapp',
        stat_original: 'Original',
        stat_compressed: 'Komprimerad',
        stat_saved: 'Minskad',
        encoding_hint: 'UTF-8 kodning (Win/Mac kompatibel).'
      },
      'uk': {
        drag_drop: 'Натисніть або перетягніть файли сюди',
        support_hint: 'Підтримка папок та рекурсії',
        file_list: 'Файли',
        clear_list: 'Очистити',
        lbl_filename: 'Ім\'я (Необов\'язково)',
        btn_create: 'Стиснути',
        status_processing: 'Обробка...',
        status_done: 'Готово!',
        add_files: 'Додати файли',
        add_folder: 'Додати папку',
        stat_original: 'Оригінал',
        stat_compressed: 'Стиснутий',
        stat_saved: 'Зменшено',
        encoding_hint: 'Кодування UTF-8 (Сумісне з Win/Mac).'
      },
      'ro': {
        drag_drop: 'Faceți clic sau trageți fișiere aici',
        support_hint: 'Suportă dosare și scanare recursivă',
        file_list: 'Fișiere',
        clear_list: 'Șterge',
        lbl_filename: 'Nume (Opțional)',
        btn_create: 'Comprimă',
        status_processing: 'Se arhivează...',
        status_done: 'Gata!',
        add_files: 'Adaugă Fișiere',
        add_folder: 'Adaugă Dosar',
        stat_original: 'Original',
        stat_compressed: 'Comprimat',
        stat_saved: 'Redus',
        encoding_hint: 'Codare UTF-8 (Compatibil Win/Mac).'
      }
    };
    const langKey = dict[lang] ? lang : 'en';
    return dict[langKey]?.[key] || dict['en'][key];
  };

  // --- Render Label Helper ---
  const renderFilenameLabel = (text) => {
    const splitRegex = /[（\(]/;
    const parts = text.split(splitRegex);
    if (parts.length > 1) {
      const mainText = parts[0].trim();
      const subText = parts.slice(1).join('(').replace(/[）\)]$/, ''); 
      return (
        <div className="flex flex-col items-start justify-center leading-none py-1 min-w-[80px]">
          <span className="text-sm font-bold text-slate-700 whitespace-nowrap">{mainText}</span>
          <span className="text-[10px] text-slate-400 font-medium mt-0.5">({subText})</span>
        </div>
      );
    }
    return <span className="text-sm font-bold text-slate-700 whitespace-nowrap">{text}</span>;
  };

  // --- 核心：添加文件逻辑 (含重名检测) ---
  const addFilesToState = useCallback((newFilesList) => {
    setFiles(prevFiles => {
      // 1. 建立当前存在的文件路径 Set，用于快速查重
      const existingPaths = new Set(prevFiles.map(f => f.path));
      const filesToAdd = [];

      // 2. 遍历新文件，生成唯一路径
      for (const fileItem of newFilesList) {
        const uniquePath = getUniquePath(existingPaths, fileItem.path);
        
        // 将新路径加入 Set，防止本批次内部也有重名
        existingPaths.add(uniquePath);

        filesToAdd.push({
          file: fileItem.file,
          id: Math.random().toString(36).substr(2, 9),
          path: uniquePath
        });
      }

      // 3. 合并
      return [...prevFiles, ...filesToAdd];
    });
    setResultStats(null);
  }, []);

  // --- File Traversal ---
  const traverseFileTree = async (item, path = '') => {
    if (item.isFile) {
      return new Promise((resolve) => {
        item.file((file) => {
          resolve([{
            file,
            path: path + file.name 
          }]);
        });
      });
    } else if (item.isDirectory) {
      const dirReader = item.createReader();
      return new Promise((resolve) => {
        dirReader.readEntries(async (entries) => {
          let entriesPromises = [];
          for (let entry of entries) {
            entriesPromises.push(traverseFileTree(entry, path + item.name + "/"));
          }
          const results = await Promise.all(entriesPromises);
          resolve(results.flat());
        });
      });
    }
    return [];
  };

  const handleDroppedItems = async (items) => {
    const promises = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i].webkitGetAsEntry();
      if (item) promises.push(traverseFileTree(item));
    }
    const results = await Promise.all(promises);
    addFilesToState(results.flat());
  };

  const handleInputFiles = (fileList) => {
    const rawFiles = Array.from(fileList).map(file => ({
      file,
      path: file.webkitRelativePath || file.name
    }));
    addFilesToState(rawFiles);
  };

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.items) {
      handleDroppedItems(e.dataTransfer.items);
    } else if (e.dataTransfer.files) {
      handleInputFiles(e.dataTransfer.files);
    }
  }, [addFilesToState]);

  // --- ZIP Logic ---
  const createZip = async () => {
    if (files.length === 0) return;
    setProcessing(true);
    setProgress(0);
    setResultStats(null);

    try {
      const zip = new JSZip();
      files.forEach(({ file, path }) => zip.file(path, file));

      const content = await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 },
        platform: 'UNIX'
      }, (metadata) => setProgress(metadata.percent));

      const originalSize = files.reduce((acc, curr) => acc + curr.file.size, 0);
      setResultStats({ originalSize, compressedSize: content.size });

      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = `${zipName || 'archive'}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setProcessing(false);
      setProgress(100);
    } catch (error) {
      console.error('ZIP Error:', error);
      setProcessing(false);
      alert('Failed to create archive.');
    }
  };

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleRename = useCallback((node, newName) => {
    if (!newName) return;
    if (node.type === 'folder') {
      const parts = node.path.split('/');
      parts.pop(); parts.pop();
      const parentPath = parts.length > 0 ? parts.join('/') + '/' : '';
      const oldPrefix = node.path;
      const newPrefix = parentPath + newName + '/';
      setFiles(prev => prev.map(f => f.path.startsWith(oldPrefix) ? { ...f, path: f.path.replace(oldPrefix, newPrefix) } : f));
    } else {
      const lastSlashIndex = node.path.lastIndexOf('/');
      const parentPath = lastSlashIndex >= 0 ? node.path.substring(0, lastSlashIndex + 1) : '';
      const newPath = parentPath + newName;
      setFiles(prev => prev.map(f => f.id === node.id ? { ...f, path: newPath } : f));
    }
    setResultStats(null);
  }, []);

  const handleDelete = useCallback((node) => {
    if (node.type === 'folder') {
      setFiles(prev => prev.filter(f => !f.path.startsWith(node.path)));
    } else {
      setFiles(prev => prev.filter(f => f.id !== node.id));
    }
    setResultStats(null);
  }, []);

  const totalSize = files.reduce((acc, curr) => acc + curr.file.size, 0);

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6">
      
      <div 
        className={`relative rounded-3xl transition-all duration-300 overflow-hidden bg-white ${isDragging ? 'ring-4 ring-blue-500 bg-blue-50' : 'border border-slate-200 shadow-sm hover:shadow-md'} ${files.length === 0 ? 'p-10 text-center cursor-pointer border-4 border-dashed border-slate-200 hover:border-blue-400 hover:bg-slate-50' : 'flex flex-col h-[500px]'}`}
        onDrop={onDrop}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
        onClick={() => files.length === 0 && fileInputRef.current.click()}
      >
        {files.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="w-24 h-24 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-4xl mb-6"><i className="fa-solid fa-folder-plus"></i></div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">{t('drag_drop')}</h3>
            <p className="text-slate-500 font-medium mb-8">{t('support_hint')}</p>
            <div className="flex gap-4" onClick={(e) => e.stopPropagation()}>
               <button onClick={() => fileInputRef.current.click()} className="px-6 py-2 bg-white border border-slate-300 rounded-lg font-medium hover:border-blue-500 hover:text-blue-600 transition-colors">{t('add_files')}</button>
               <button onClick={() => folderInputRef.current.click()} className="px-6 py-2 bg-white border border-slate-300 rounded-lg font-medium hover:border-blue-500 hover:text-blue-600 transition-colors">{t('add_folder')}</button>
            </div>
          </div>
        ) : (
          <>
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center flex-shrink-0">
               <div className="flex items-center gap-4">
                 <span className="font-bold text-slate-700">{t('file_list')} ({files.length})</span>
                 <span className="text-sm text-slate-500">{formatSize(totalSize)}</span>
               </div>
               <div className="flex gap-2">
                 <button onClick={() => fileInputRef.current.click()} className="px-3 py-1.5 bg-white border border-slate-200 rounded-md text-sm font-medium hover:text-blue-600 hover:border-blue-400"><i className="fa-solid fa-plus"></i> {t('add_files')}</button>
                 <button onClick={() => folderInputRef.current.click()} className="px-3 py-1.5 bg-white border border-slate-200 rounded-md text-sm font-medium hover:text-blue-600 hover:border-blue-400"><i className="fa-solid fa-folder-plus"></i> {t('add_folder')}</button>
                 <button onClick={() => { setFiles([]); setResultStats(null); }} className="px-3 py-1.5 text-red-500 hover:bg-red-50 rounded-md text-sm font-medium">{t('clear_list')}</button>
               </div>
            </div>
            
            <FileTree files={files} onRename={handleRename} onDelete={handleDelete} formatSize={formatSize} />
            
            {isDragging && (
               <div className="absolute inset-0 bg-blue-50/90 flex items-center justify-center z-10 border-4 border-blue-500 border-dashed rounded-3xl">
                  <div className="text-2xl font-bold text-blue-600 pointer-events-none">{t('drag_drop')}</div>
               </div>
            )}
          </>
        )}
        <input type="file" ref={fileInputRef} className="hidden" multiple onChange={(e) => handleInputFiles(e.target.files)} />
        <input type="file" ref={folderInputRef} className="hidden" webkitdirectory="true" directory="true" multiple onChange={(e) => handleInputFiles(e.target.files)} />
      </div>

      <div className="mt-6 w-full space-y-6">
        <div className="flex flex-col md:flex-row gap-4 items-stretch">
          <div className="bg-white p-2 pl-3 rounded-xl border border-slate-200 flex items-center gap-3 shadow-sm flex-1 transition-shadow hover:shadow-md h-[72px]">
             {renderFilenameLabel(t('lbl_filename'))}
             <div className="flex-1 flex items-center gap-2 min-w-0 h-full">
                <input type="text" value={zipName} onChange={(e) => setZipName(e.target.value)} className="w-full h-12 px-3 rounded-lg bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 font-medium min-w-0" placeholder="archive" />
                <span className="text-slate-400 font-bold text-sm pr-1">.zip</span>
             </div>
          </div>
          {/* ✨ 优化：固定宽度 + 居中对齐 */}
          <button onClick={createZip} disabled={processing || files.length === 0} className={`w-full md:w-72 h-[72px] rounded-xl font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-2 px-4 flex-shrink-0 ${processing ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-blue-500/30 hover:-translate-y-1'}`}>
            {processing ? (
              <><i className="fa-solid fa-circle-notch fa-spin"></i><div className="flex flex-col leading-none text-left"><span className="text-xs opacity-80">Processing</span><span>{progress.toFixed(0)}%</span></div></>
            ) : (
              <><i className="fa-solid fa-file-zipper text-xl"></i> {t('btn_create')}</>
            )}
          </button>
        </div>

        {resultStats && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-6 animation-fade-in flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-2xl"><i className="fa-solid fa-check"></i></div>
              <div><h4 className="font-bold text-green-800 text-lg">{t('status_done')}</h4><p className="text-green-600 text-sm">{t('encoding_hint')}</p></div>
            </div>
            <div className="flex flex-wrap justify-end gap-x-8 gap-y-2 text-center sm:text-right">
              <div><div className="text-xs font-bold text-slate-400 uppercase whitespace-nowrap">{t('stat_original')}</div><div className="font-mono text-slate-600 line-through whitespace-nowrap">{formatSize(resultStats.originalSize)}</div></div>
              <div><div className="text-xs font-bold text-green-600 uppercase whitespace-nowrap">{t('stat_compressed')}</div><div className="font-mono text-green-700 font-bold text-lg whitespace-nowrap">{formatSize(resultStats.compressedSize)}</div></div>
              <div><div className="text-xs font-bold text-blue-500 uppercase whitespace-nowrap">{t('stat_saved')}</div><div className="font-mono text-blue-600 font-bold text-lg whitespace-nowrap">-{((1 - resultStats.compressedSize / resultStats.originalSize) * 100).toFixed(1)}%</div></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// --- Tree Helper Functions (Stable) ---
const buildTree = (files) => {
  const root = {};
  files.forEach(file => {
    const parts = file.path.split('/');
    let currentLevel = root;
    parts.forEach((part, index) => {
      const isFile = index === parts.length - 1;
      const pathSoFar = parts.slice(0, index + 1).join('/');
      if (!currentLevel[part]) {
        currentLevel[part] = {
          name: part,
          path: isFile ? pathSoFar : pathSoFar + '/',
          type: isFile ? 'file' : 'folder',
          children: {},
          id: isFile ? file.id : `folder-${pathSoFar}`,
          fileData: isFile ? file : null
        };
      }
      if (!isFile) currentLevel = currentLevel[part].children;
    });
  });
  const convertToArray = (nodes) => {
    return Object.values(nodes)
      .sort((a, b) => {
        if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
        return a.name.localeCompare(b.name);
      })
      .map(node => ({ ...node, children: convertToArray(node.children) }));
  };
  return convertToArray(root);
};

// --- Tree Components ---
const FileTree = ({ files, onRename, onDelete, formatSize }) => {
  const treeData = useMemo(() => buildTree(files), [files]);
  return (
    <div className="flex-1 overflow-y-auto p-2 space-y-1 bg-slate-50/30">
       {treeData.map(node => (
         <FileTreeItem key={node.id} node={node} depth={0} onRename={onRename} onDelete={onDelete} formatSize={formatSize} />
       ))}
    </div>
  );
};

// ✨ React.memo Optimization
const FileTreeItem = React.memo(({ node, depth, onRename, onDelete, formatSize }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(node.name);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    const trimmed = editName.trim();
    if (trimmed && trimmed !== node.name && !trimmed.includes('/')) onRename(node, trimmed);
    else setEditName(node.name);
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') {
      setEditName(node.name);
      setIsEditing(false);
    }
  };

  const getSize = (n) => {
    if (n.type === 'file') return n.fileData.file.size;
    return n.children.reduce((acc, child) => acc + getSize(child), 0);
  };

  const totalSize = useMemo(() => getSize(node), [node]);

  return (
    <div className="select-none">
      <div 
        className={`group flex items-center gap-2 p-2 rounded-lg hover:bg-blue-50 transition-colors ${isEditing ? 'bg-blue-50 ring-2 ring-blue-200' : ''}`}
        style={{ paddingLeft: `${depth * 1.5 + 0.5}rem` }}
      >
        <div 
          className={`w-6 h-6 flex items-center justify-center text-slate-400 cursor-pointer hover:text-blue-500 transition-transform ${node.type !== 'folder' ? 'invisible' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
        >
           <i className={`fa-solid fa-chevron-right text-xs transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}></i>
        </div>

        <div className={`text-lg ${node.type === 'folder' ? 'text-yellow-400' : 'text-blue-400'}`}>
           <i className={`fa-solid ${node.type === 'folder' ? (isOpen ? 'fa-folder-open' : 'fa-folder') : 'fa-file'}`}></i>
        </div>

        <div className="flex-1 min-w-0 group/edit relative flex items-center gap-2">
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyDown}
              className="w-full px-1 py-0.5 text-sm font-medium text-slate-700 bg-white border border-blue-300 rounded outline-none"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <>
                <span className="text-sm font-medium text-slate-700 hover:text-blue-600 cursor-pointer truncate" onClick={() => setIsEditing(true)} title="Click to rename">
                  {node.name}
                </span>
                <i className="fa-solid fa-pen text-slate-300 text-[10px] opacity-0 group-hover/edit:opacity-100 transition-opacity cursor-pointer hover:text-blue-500" onClick={() => setIsEditing(true)}></i>
            </>
          )}
        </div>

        <div className="text-xs text-slate-400 font-mono">{formatSize(totalSize)}</div>

        <button onClick={() => onDelete(node)} className="w-6 h-6 flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 rounded transition-all opacity-0 group-hover:opacity-100" title="Delete">
          <i className="fa-solid fa-xmark"></i>
        </button>
      </div>

      {node.type === 'folder' && isOpen && (
        <div className="border-l border-slate-100 ml-[1.2rem]">
          {node.children.map(child => (
            <FileTreeItem key={child.id} node={child} depth={depth + 1} onRename={onRename} onDelete={onDelete} formatSize={formatSize} />
          ))}
        </div>
      )}
    </div>
  );
});
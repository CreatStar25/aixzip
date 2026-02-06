import { getEntry } from 'astro:content';

// 1. 从 URL 获取当前语言
export function getLangFromUrl(url: URL) {
  const [, lang] = url.pathname.split('/');
  if (lang && lang.length > 0 && !lang.startsWith('image') && !lang.startsWith('pdf')) {
    return lang;
  }
  return 'en';
}

// 2. ✨ 新增：获取全局 UI 数据 (Nav + UI strings)
export async function getI18nData(lang: string) {
  // 优先加载当前语言，失败则回退到 'en'
  let entry = await getEntry('i18n', lang);
  if (!entry) {
    entry = await getEntry('i18n', 'en');
  }
  
  if (!entry) {
    throw new Error(`[i18n] Critical Error: Base config (src/content/i18n/en.json) is missing!`);
  }
  
  return entry.data;
}

// 3. ✨ 新增：Helper Hook，用于在组件中快速获取翻译函数 t('key')
export async function useTranslations(lang: string) {
  const data = await getI18nData(lang);
  // Also load English data for fallback
  const enData = lang === 'en' ? data : await getI18nData('en');
  
  return function t(key: string): string {
    return data.ui[key] || enData.ui[key] || key;
  };
}
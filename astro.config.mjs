// astro.config.mjs
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind'; // <--- 1. 必须引入这个
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://aixzip.com', // 替换你的域名
  integrations: [
    tailwind(),
    react(),
    sitemap({
      i18n: {
        defaultLocale: 'en',
        locales: {
          en: 'en', 'zh-cn': 'zh-cn', 'zh-tw': 'zh-tw', es: 'es', ar: 'ar', 
          pt: 'pt', id: 'id', ms: 'ms', fr: 'fr', ru: 'ru', hi: 'hi', 
          ja: 'ja', de: 'de', ko: 'ko', tr: 'tr', vi: 'vi', th: 'th', 
          it: 'it', fa: 'fa', nl: 'nl', pl: 'pl', sv: 'sv', uk: 'uk', ro: 'ro', ur: 'ur'
        },
      },
    }),
  ],
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'zh-cn', 'zh-tw', 'es', 'ar', 'pt', 'id', 'ms', 'fr', 'ru', 'hi', 'ja', 'de', 'ko', 'tr', 'vi', 'th', 'it', 'fa', 'nl', 'pl', 'sv', 'uk', 'ro', 'ur'],
    routing: {
      prefixDefaultLocale: false, // 英文不带 /en 前缀，其他语言带前缀
    },
  },
});

import { defineCollection, z } from 'astro:content';

// 1. 工具详情集合 (保持原样)
const toolsCollection = defineCollection({
  type: 'data',
  schema: z.object({
    seo: z.object({
      title: z.string(),
      keywords: z.string(),
      description: z.string(),
    }),
    hero: z.object({
      title: z.string(),
      subtitle: z.string(),
    }),
    steps: z.array(z.object({ title: z.string(), desc: z.string() })).optional(),
    features: z.array(z.object({ title: z.string(), desc: z.string() })).optional(),
    testimonials: z.array(z.object({ text: z.string(), author: z.string() })).optional(),
    faq: z.array(z.object({ q: z.string(), a: z.string() })).optional(),
  }),
});

// ✨ 2. 新增：全局 UI 集合 (替代 ui.ts)
const i18nCollection = defineCollection({
  type: 'data',
  schema: z.object({
    // 导航菜单结构
    nav: z.record(
      z.object({
        title: z.string(),
        items: z.array(z.object({
          name: z.string(),
          href: z.string(),
        }))
      })
    ),
    // 通用 UI 词条 (扁平化 Key-Value)
    ui: z.record(z.string()), 
  })
});

export const collections = {
  'tools': toolsCollection,
  'i18n': i18nCollection, // 注册新集合
};
// src/content/config.ts
import { defineCollection, z } from 'astro:content';

const toolsCollection = defineCollection({
  type: 'data', // 纯数据集合 (JSON)
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
    // 营销板块 (可选，有的简单工具可能不需要)
    steps: z.array(z.object({
      title: z.string(),
      desc: z.string(),
    })).optional(),
    features: z.array(z.object({
      title: z.string(),
      desc: z.string(),
    })).optional(),
    testimonials: z.array(z.object({
      text: z.string(),
      author: z.string(),
    })).optional(),
    faq: z.array(z.object({
      q: z.string(),
      a: z.string(),
    })).optional(),
  }),
});

export const collections = {
  'tools': toolsCollection,
};
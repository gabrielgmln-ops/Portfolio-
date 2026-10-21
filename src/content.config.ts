import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { criarProjetoSchema, marcoSchema } from './lib/validacao';

const projetos = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/projetos' }),
  schema: criarProjetoSchema(),
});

const marcos = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/marcos' }),
  schema: marcoSchema,
});

export const collections = { projetos, marcos };

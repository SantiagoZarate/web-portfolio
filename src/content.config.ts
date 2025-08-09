import { glob } from "astro/loaders";
import { defineCollection } from "astro:content";
import { z } from "zod";

const noteSchema = z.object({
  slug: z.string(),
  title: z.string(),
  category: z.string(),
  date: z.date(),
  description: z.string(),
});

export type Note = z.infer<typeof noteSchema>;

const notes = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/data/notes" }),
  schema: noteSchema,
});

export const collections = { notes };

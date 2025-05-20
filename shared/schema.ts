import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Document schema
export const DocumentSchema = z.object({
  id: z.string(),
  name: z.string(),
  size: z.number(),
  type: z.string(),
  pages: z.number().optional(),
  words: z.number().optional(),
  chunks: z.number().optional(),
  embeddings: z.number().optional(),
  createdAt: z.date(),
});

export type Document = z.infer<typeof DocumentSchema>;

// Text chunk schema
export const TextChunkSchema = z.object({
  id: z.string(),
  documentId: z.string(),
  text: z.string(),
  metadata: z.object({
    pageNumber: z.number().optional(),
    location: z.number().optional(),
  }).optional(),
  embedding: z.array(z.number()).optional(),
});

export type TextChunk = z.infer<typeof TextChunkSchema>;

// Query schema
export const QuerySchema = z.object({
  id: z.string(),
  documentId: z.string(),
  text: z.string(),
  createdAt: z.date(),
});

export type Query = z.infer<typeof QuerySchema>;

// Answer schema
export const SourceSchema = z.object({
  chunkId: z.string(),
  text: z.string(),
  pageNumber: z.number().optional(),
  score: z.number().optional(),
});

export const AnswerSchema = z.object({
  id: z.string(),
  queryId: z.string(),
  text: z.string(),
  sources: z.array(SourceSchema),
  createdAt: z.date(),
});

export type Source = z.infer<typeof SourceSchema>;
export type Answer = z.infer<typeof AnswerSchema>;

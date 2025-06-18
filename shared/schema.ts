import { pgTable, text, serial, integer, boolean, timestamp, jsonb, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table for basic authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// Course content from TDS website
export const courseContent = pgTable("course_content", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  url: text("url").notNull().unique(),
  contentType: text("content_type").notNull(), // 'lecture', 'assignment', 'resource'
  scrapedAt: timestamp("scraped_at").defaultNow(),
  lastUpdated: timestamp("last_updated").defaultNow(),
  metadata: jsonb("metadata"), // Additional structured data
});

// Discourse forum posts
export const discoursePosts = pgTable("discourse_posts", {
  id: serial("id").primaryKey(),
  discourseId: integer("discourse_id").notNull().unique(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  url: text("url").notNull(),
  author: text("author"),
  categoryId: integer("category_id"),
  topicId: integer("topic_id"),
  postNumber: integer("post_number"),
  createdAt: timestamp("created_at"),
  scrapedAt: timestamp("scraped_at").defaultNow(),
  metadata: jsonb("metadata"),
});

// Vector embeddings for semantic search
export const vectorEmbeddings = pgTable("vector_embeddings", {
  id: serial("id").primaryKey(),
  contentId: integer("content_id").notNull(),
  contentType: text("content_type").notNull(), // 'course' or 'discourse'
  embedding: text("embedding").notNull(), // JSON array of numbers
  chunkIndex: integer("chunk_index").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// API questions and responses for analytics
export const apiQuestions = pgTable("api_questions", {
  id: serial("id").primaryKey(),
  question: text("question").notNull(),
  answer: text("answer"),
  links: jsonb("links"), // Array of {url, text} objects
  hasImage: boolean("has_image").default(false),
  responseTime: real("response_time"), // in seconds
  success: boolean("success").default(true),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow(),
});

// System configuration
export const systemConfig = pgTable("system_config", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  description: text("description"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Scraping jobs and status
export const scrapingJobs = pgTable("scraping_jobs", {
  id: serial("id").primaryKey(),
  jobType: text("job_type").notNull(), // 'course_content' or 'discourse'
  status: text("status").notNull(), // 'pending', 'running', 'completed', 'failed'
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  itemsProcessed: integer("items_processed").default(0),
  errorMessage: text("error_message"),
  metadata: jsonb("metadata"),
});

// Schema exports for forms
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertCourseContentSchema = createInsertSchema(courseContent).omit({
  id: true,
  scrapedAt: true,
});

export const insertDiscoursePostSchema = createInsertSchema(discoursePosts).omit({
  id: true,
  scrapedAt: true,
});

export const apiRequestSchema = z.object({
  question: z.string().min(1, "Question is required"),
  image: z.string().optional(), // base64 encoded image
});

export const apiResponseSchema = z.object({
  answer: z.string(),
  links: z.array(z.object({
    url: z.string().url(),
    text: z.string(),
  })),
});

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type CourseContent = typeof courseContent.$inferSelect;
export type InsertCourseContent = z.infer<typeof insertCourseContentSchema>;
export type DiscoursePost = typeof discoursePosts.$inferSelect;
export type InsertDiscoursePost = z.infer<typeof insertDiscoursePostSchema>;
export type VectorEmbedding = typeof vectorEmbeddings.$inferSelect;
export type ApiQuestion = typeof apiQuestions.$inferSelect;
export type SystemConfig = typeof systemConfig.$inferSelect;
export type ScrapingJob = typeof scrapingJobs.$inferSelect;
export type ApiRequest = z.infer<typeof apiRequestSchema>;
export type ApiResponse = z.infer<typeof apiResponseSchema>;

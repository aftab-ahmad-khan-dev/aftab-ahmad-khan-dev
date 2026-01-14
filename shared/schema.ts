import { pgTable, text, serial, varchar, boolean, text as textColumn } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  shortDescription: text("short_description").notNull(),
  problem: text("problem").notNull(),
  solution: text("solution").notNull(),
  feedback: text("feedback"),
  techStack: text("tech_stack").array().notNull(), // Array of strings
  liveLink: text("live_link"),
  imageUrl: text("image_url").notNull(),
  category: text("category").notNull(), // SaaS, E-commerce, AI, etc.
  isFeatured: boolean("is_featured").default(false),
});

export const insertProjectSchema = createInsertSchema(projects);

export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;

// Contact form schema for validation (even if handled client-side with EmailJS)
export const contactFormSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;

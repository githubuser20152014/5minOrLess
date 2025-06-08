import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Status enum for milestones and tasks
export const statusValues = ["Not Started", "In Progress", "Deferred", "Blocked", "Complete"] as const;
export type Status = typeof statusValues[number];

export const projects = pgTable("projects", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  dueDate: text("due_date"),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const milestones = pgTable("milestones", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull(),
  name: text("name").notNull(),
  status: text("status").notNull().default("Not Started"),
  dueDate: text("due_date"),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const tasks = pgTable("tasks", {
  id: text("id").primaryKey(),
  milestoneId: text("milestone_id").notNull(),
  name: text("name").notNull(),
  status: text("status").notNull().default("Not Started"),
  dueDate: text("due_date"),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
});

export const insertMilestoneSchema = createInsertSchema(milestones).omit({
  id: true,
  createdAt: true,
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
});

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type InsertMilestone = z.infer<typeof insertMilestoneSchema>;
export type InsertTask = z.infer<typeof insertTaskSchema>;

export type Project = typeof projects.$inferSelect;
export type Milestone = typeof milestones.$inferSelect;
export type Task = typeof tasks.$inferSelect;

export interface ProjectWithMilestones extends Project {
  milestones: MilestoneWithTasks[];
}

export interface MilestoneWithTasks extends Milestone {
  tasks: Task[];
}

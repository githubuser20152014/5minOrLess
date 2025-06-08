import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProjectSchema, insertMilestoneSchema, insertTaskSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Projects
  app.get("/api/projects", async (req, res) => {
    try {
      const projects = await storage.getProjects();
      res.json(projects);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch projects" });
    }
  });

  app.get("/api/projects/:id", async (req, res) => {
    try {
      const project = await storage.getProject(req.params.id);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch project" });
    }
  });

  app.post("/api/projects", async (req, res) => {
    try {
      const validatedProject = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(validatedProject);
      res.status(201).json(project);
    } catch (error) {
      res.status(400).json({ error: "Invalid project data" });
    }
  });

  app.patch("/api/projects/:id", async (req, res) => {
    try {
      const updateData = insertProjectSchema.partial().parse(req.body);
      const project = await storage.updateProject(req.params.id, updateData);
      res.json(project);
    } catch (error) {
      res.status(400).json({ error: "Invalid project data" });
    }
  });

  app.delete("/api/projects/:id", async (req, res) => {
    try {
      await storage.deleteProject(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete project" });
    }
  });

  // Milestones
  app.post("/api/milestones", async (req, res) => {
    try {
      const validatedMilestone = insertMilestoneSchema.parse(req.body);
      const milestone = await storage.createMilestone(validatedMilestone);
      res.status(201).json(milestone);
    } catch (error) {
      res.status(400).json({ error: "Invalid milestone data" });
    }
  });

  app.patch("/api/milestones/:id", async (req, res) => {
    try {
      const updateData = insertMilestoneSchema.partial().parse(req.body);
      const milestone = await storage.updateMilestone(req.params.id, updateData);
      res.json(milestone);
    } catch (error) {
      res.status(400).json({ error: "Invalid milestone data" });
    }
  });

  app.delete("/api/milestones/:id", async (req, res) => {
    try {
      await storage.deleteMilestone(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete milestone" });
    }
  });

  // Tasks
  app.post("/api/tasks", async (req, res) => {
    try {
      const validatedTask = insertTaskSchema.parse(req.body);
      const task = await storage.createTask(validatedTask);
      res.status(201).json(task);
    } catch (error) {
      res.status(400).json({ error: "Invalid task data" });
    }
  });

  app.patch("/api/tasks/:id", async (req, res) => {
    try {
      const updateData = insertTaskSchema.partial().parse(req.body);
      const task = await storage.updateTask(req.params.id, updateData);
      res.json(task);
    } catch (error) {
      res.status(400).json({ error: "Invalid task data" });
    }
  });

  app.delete("/api/tasks/:id", async (req, res) => {
    try {
      await storage.deleteTask(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete task" });
    }
  });

  app.post("/api/tasks/reorder", async (req, res) => {
    try {
      const { milestoneId, taskIds } = req.body;
      await storage.reorderTasks(milestoneId, taskIds);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to reorder tasks" });
    }
  });

  app.post("/api/tasks/move", async (req, res) => {
    try {
      const { taskId, newMilestoneId, newOrder } = req.body;
      await storage.moveTask(taskId, newMilestoneId, newOrder);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to move task" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

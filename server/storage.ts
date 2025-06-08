import { projects, milestones, tasks, type Project, type Milestone, type Task, type InsertProject, type InsertMilestone, type InsertTask, type ProjectWithMilestones, type MilestoneWithTasks } from "@shared/schema";

export interface IStorage {
  // Projects
  getProjects(): Promise<ProjectWithMilestones[]>;
  getProject(id: string): Promise<ProjectWithMilestones | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, project: Partial<InsertProject>): Promise<Project>;
  deleteProject(id: string): Promise<void>;

  // Milestones
  getMilestones(projectId: string): Promise<MilestoneWithTasks[]>;
  createMilestone(milestone: InsertMilestone): Promise<Milestone>;
  updateMilestone(id: string, milestone: Partial<InsertMilestone>): Promise<Milestone>;
  deleteMilestone(id: string): Promise<void>;

  // Tasks
  getTasks(milestoneId: string): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: string, task: Partial<InsertTask>): Promise<Task>;
  deleteTask(id: string): Promise<void>;
  reorderTasks(milestoneId: string, taskIds: string[]): Promise<void>;
  moveTask(taskId: string, newMilestoneId: string, newOrder: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private projects: Map<string, Project>;
  private milestones: Map<string, Milestone>;
  private tasks: Map<string, Task>;
  private currentId: number;

  constructor() {
    this.projects = new Map();
    this.milestones = new Map();
    this.tasks = new Map();
    this.currentId = 1;
  }

  private generateId(): string {
    return `id_${this.currentId++}`;
  }

  async getProjects(): Promise<ProjectWithMilestones[]> {
    const projectsList = Array.from(this.projects.values());
    const result: ProjectWithMilestones[] = [];

    for (const project of projectsList) {
      const projectMilestones = await this.getMilestones(project.id);
      result.push({
        ...project,
        milestones: projectMilestones,
      });
    }

    return result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  async getProject(id: string): Promise<ProjectWithMilestones | undefined> {
    const project = this.projects.get(id);
    if (!project) return undefined;

    const projectMilestones = await this.getMilestones(id);
    return {
      ...project,
      milestones: projectMilestones,
    };
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = this.generateId();
    const project: Project = {
      ...insertProject,
      id,
      createdAt: new Date(),
    };
    this.projects.set(id, project);
    return project;
  }

  async updateProject(id: string, updateData: Partial<InsertProject>): Promise<Project> {
    const project = this.projects.get(id);
    if (!project) throw new Error('Project not found');

    const updatedProject = { ...project, ...updateData };
    this.projects.set(id, updatedProject);
    return updatedProject;
  }

  async deleteProject(id: string): Promise<void> {
    // Delete all milestones and tasks for this project
    const projectMilestones = Array.from(this.milestones.values()).filter(m => m.projectId === id);
    for (const milestone of projectMilestones) {
      await this.deleteMilestone(milestone.id);
    }
    this.projects.delete(id);
  }

  async getMilestones(projectId: string): Promise<MilestoneWithTasks[]> {
    const projectMilestones = Array.from(this.milestones.values())
      .filter(m => m.projectId === projectId)
      .sort((a, b) => a.order - b.order);

    const result: MilestoneWithTasks[] = [];
    for (const milestone of projectMilestones) {
      const milestoneTasks = await this.getTasks(milestone.id);
      result.push({
        ...milestone,
        tasks: milestoneTasks,
      });
    }

    return result;
  }

  async createMilestone(insertMilestone: InsertMilestone): Promise<Milestone> {
    const id = this.generateId();
    const milestone: Milestone = {
      ...insertMilestone,
      id,
      createdAt: new Date(),
    };
    this.milestones.set(id, milestone);
    return milestone;
  }

  async updateMilestone(id: string, updateData: Partial<InsertMilestone>): Promise<Milestone> {
    const milestone = this.milestones.get(id);
    if (!milestone) throw new Error('Milestone not found');

    const updatedMilestone = { ...milestone, ...updateData };
    this.milestones.set(id, updatedMilestone);
    return updatedMilestone;
  }

  async deleteMilestone(id: string): Promise<void> {
    // Delete all tasks for this milestone
    const milestoneTasks = Array.from(this.tasks.values()).filter(t => t.milestoneId === id);
    for (const task of milestoneTasks) {
      this.tasks.delete(task.id);
    }
    this.milestones.delete(id);
  }

  async getTasks(milestoneId: string): Promise<Task[]> {
    return Array.from(this.tasks.values())
      .filter(t => t.milestoneId === milestoneId)
      .sort((a, b) => a.order - b.order);
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = this.generateId();
    const task: Task = {
      ...insertTask,
      id,
      createdAt: new Date(),
    };
    this.tasks.set(id, task);
    return task;
  }

  async updateTask(id: string, updateData: Partial<InsertTask>): Promise<Task> {
    const task = this.tasks.get(id);
    if (!task) throw new Error('Task not found');

    const updatedTask = { ...task, ...updateData };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  async deleteTask(id: string): Promise<void> {
    this.tasks.delete(id);
  }

  async reorderTasks(milestoneId: string, taskIds: string[]): Promise<void> {
    taskIds.forEach((taskId, index) => {
      const task = this.tasks.get(taskId);
      if (task && task.milestoneId === milestoneId) {
        this.tasks.set(taskId, { ...task, order: index });
      }
    });
  }

  async moveTask(taskId: string, newMilestoneId: string, newOrder: number): Promise<void> {
    const task = this.tasks.get(taskId);
    if (!task) throw new Error('Task not found');

    this.tasks.set(taskId, {
      ...task,
      milestoneId: newMilestoneId,
      order: newOrder,
    });
  }
}

export const storage = new MemStorage();

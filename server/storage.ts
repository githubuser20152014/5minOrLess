import { projects, milestones, tasks, type Project, type Milestone, type Task, type InsertProject, type InsertMilestone, type InsertTask, type ProjectWithMilestones, type MilestoneWithTasks } from "@shared/schema";

export interface IStorage {
  // Projects
  getProjects(): Promise<ProjectWithMilestones[]>;
  getProject(id: string): Promise<ProjectWithMilestones | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, project: Partial<InsertProject>): Promise<Project>;
  deleteProject(id: string): Promise<void>;
  reorderProjects(projectIds: string[]): Promise<void>;

  // Milestones
  getMilestones(projectId: string): Promise<MilestoneWithTasks[]>;
  createMilestone(milestone: InsertMilestone): Promise<Milestone>;
  updateMilestone(id: string, milestone: Partial<InsertMilestone>): Promise<Milestone>;
  deleteMilestone(id: string): Promise<void>;
  reorderMilestones(projectId: string, milestoneIds: string[]): Promise<void>;

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
    
    // Add some sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Create sample projects
    const project1: Project = {
      id: "project_1",
      name: "Website Redesign",
      details: "Complete overhaul of company website with modern design and improved UX",
      dueDate: "2024-12-31",
      order: 0,
      createdAt: new Date("2024-01-01"),
    };

    const project2: Project = {
      id: "project_2", 
      name: "Mobile App Development",
      details: "Native mobile application for iOS and Android platforms",
      dueDate: "2024-11-15",
      order: 1,
      createdAt: new Date("2024-01-15"),
    };

    this.projects.set(project1.id, project1);
    this.projects.set(project2.id, project2);

    // Create sample milestones for project 1
    const milestone1: Milestone = {
      id: "milestone_1",
      projectId: "project_1",
      name: "Planning",
      details: "Initial project planning and requirements gathering phase",
      dueDate: "2024-06-30",
      order: 0,
      createdAt: new Date("2024-01-02"),
    };

    const milestone2: Milestone = {
      id: "milestone_2",
      projectId: "project_1", 
      name: "Design",
      details: "UI/UX design and wireframe creation",
      dueDate: "2024-09-30",
      order: 1,
      createdAt: new Date("2024-01-03"),
    };

    const milestone3: Milestone = {
      id: "milestone_3",
      projectId: "project_1",
      name: "Development",
      details: "Frontend and backend implementation",
      dueDate: null,
      order: 2,
      createdAt: new Date("2024-01-04"),
    };

    // Create sample milestones for project 2
    const milestone4: Milestone = {
      id: "milestone_4",
      projectId: "project_2",
      name: "Research & Planning",
      details: "Market research and technical planning for mobile app",
      dueDate: "2024-07-15",
      order: 0,
      createdAt: new Date("2024-01-16"),
    };

    const milestone5: Milestone = {
      id: "milestone_5",
      projectId: "project_2",
      name: "MVP Development",
      details: "Core features development for minimum viable product",
      dueDate: null,
      order: 1,
      createdAt: new Date("2024-01-17"),
    };

    this.milestones.set(milestone1.id, milestone1);
    this.milestones.set(milestone2.id, milestone2);
    this.milestones.set(milestone3.id, milestone3);
    this.milestones.set(milestone4.id, milestone4);
    this.milestones.set(milestone5.id, milestone5);

    // Create sample tasks
    const tasks: Task[] = [
      {
        id: "task_1",
        milestoneId: "milestone_1",
        name: "Define project requirements",
        details: "Gather and document all functional and non-functional requirements",
        completed: true,
        dueDate: "2024-06-15",
        order: 0,
        createdAt: new Date("2024-01-05"),
      },
      {
        id: "task_2", 
        milestoneId: "milestone_1",
        name: "Create project timeline",
        details: "Develop detailed project schedule with milestones and dependencies",
        completed: true,
        dueDate: null,
        order: 1,
        createdAt: new Date("2024-01-06"),
      },
      {
        id: "task_3",
        milestoneId: "milestone_1",
        name: "Stakeholder approval",
        details: "Present requirements and timeline to stakeholders for final approval",
        completed: false,
        dueDate: "2024-06-25",
        order: 2,
        createdAt: new Date("2024-01-07"),
      },
      {
        id: "task_4",
        milestoneId: "milestone_2",
        name: "Create wireframes",
        details: "Design low-fidelity wireframes for all key pages and user flows",
        completed: false,
        dueDate: "2024-07-15",
        order: 0,
        createdAt: new Date("2024-01-08"),
      },
      {
        id: "task_5",
        milestoneId: "milestone_2",
        name: "Design mockups",
        details: "Create high-fidelity visual designs based on approved wireframes",
        completed: false,
        dueDate: null,
        order: 1,
        createdAt: new Date("2024-01-09"),
      },
      {
        id: "task_6",
        milestoneId: "milestone_3",
        name: "Set up development environment",
        details: "Configure development tools, repositories, and deployment pipeline",
        completed: false,
        dueDate: null,
        order: 0,
        createdAt: new Date("2024-01-10"),
      },
      {
        id: "task_7",
        milestoneId: "milestone_4",
        name: "Market research",
        details: "Analyze competitor apps and identify market opportunities",
        completed: true,
        dueDate: null,
        order: 0,
        createdAt: new Date("2024-01-18"),
      },
      {
        id: "task_8",
        milestoneId: "milestone_4",
        name: "User persona development",
        details: "Create detailed user personas based on target audience research",
        completed: false,
        dueDate: "2024-07-10",
        order: 1,
        createdAt: new Date("2024-01-19"),
      },
      {
        id: "task_9",
        milestoneId: "milestone_5",
        name: "Create app architecture",
        details: "Design technical architecture and select technology stack",
        completed: false,
        dueDate: null,
        order: 0,
        createdAt: new Date("2024-01-20"),
      },
    ];

    tasks.forEach(task => {
      this.tasks.set(task.id, task);
    });

    this.currentId = 10; // Set current ID to avoid conflicts
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

    return result.sort((a, b) => a.order - b.order);
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
      dueDate: insertProject.dueDate || null,
      order: insertProject.order || 0,
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
      dueDate: insertMilestone.dueDate || null,
      order: insertMilestone.order || 0,
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
      dueDate: insertTask.dueDate || null,
      order: insertTask.order || 0,
      completed: insertTask.completed || false,
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

  async reorderProjects(projectIds: string[]): Promise<void> {
    // Update each project's order based on the new ordering
    projectIds.forEach((projectId, index) => {
      const project = this.projects.get(projectId);
      if (project) {
        this.projects.set(projectId, {
          ...project,
          order: index,
        });
      }
    });
  }

  async reorderMilestones(projectId: string, milestoneIds: string[]): Promise<void> {
    // Update each milestone's order based on the new ordering
    milestoneIds.forEach((milestoneId, index) => {
      const milestone = this.milestones.get(milestoneId);
      if (milestone && milestone.projectId === projectId) {
        this.milestones.set(milestoneId, {
          ...milestone,
          order: index,
        });
      }
    });
  }
}

export const storage = new MemStorage();

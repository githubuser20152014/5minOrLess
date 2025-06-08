import type { ProjectWithMilestones } from "@shared/schema";

const STORAGE_KEY = "taskflow_projects";

export const localStorageManager = {
  save: (projects: ProjectWithMilestones[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    } catch (error) {
      console.error("Failed to save to localStorage:", error);
    }
  },

  load: (): ProjectWithMilestones[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Failed to load from localStorage:", error);
      return [];
    }
  },

  clear: () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Failed to clear localStorage:", error);
    }
  },
};

import { create } from 'zustand';
import { Project } from '../types';
import { dbService, SessionRecord } from '../services/db.service';
import { generateId } from '../lib/utils';

interface ProjectStore {
  projects: Project[];
  activeProject: Project | null;
  projectSessions: SessionRecord[];
  isLoading: boolean;
  error: string | null;

  // Actions
  loadProjects: () => Promise<void>;
  loadProject: (id: string) => Promise<void>;
  loadProjectSessions: (id: string) => Promise<void>;
  createProject: (data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Project>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  setActiveProject: (project: Project | null) => void;
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
  projects: [],
  activeProject: null,
  projectSessions: [],
  isLoading: false,
  error: null,

  loadProjects: async () => {
    set({ isLoading: true, error: null });
    try {
      const projects = await dbService.getAllProjects();
      set({ projects, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to load projects', isLoading: false });
      console.error(error);
    }
  },

  loadProject: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const project = await dbService.getProject(id);
      if (project) {
        set({ activeProject: project, isLoading: false });
      } else {
        set({ activeProject: null, error: 'Project not found', isLoading: false });
      }
    } catch (error) {
      set({ activeProject: null, error: 'Failed to load project', isLoading: false });
      console.error(error);
    }
  },

  loadProjectSessions: async (id: string) => {
    try {
      const sessions = await dbService.getSessionsByProject(id);
      set({ projectSessions: sessions });
    } catch (error) {
      console.error('Failed to load project sessions', error);
    }
  },

  createProject: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const now = new Date().toISOString();
      const newProject: Project = {
        ...data,
        id: generateId(),
        createdAt: now,
        updatedAt: now,
      };
      await dbService.saveProject(newProject);
      const { projects } = get();
      set({ projects: [newProject, ...projects], isLoading: false });
      return newProject;
    } catch (error) {
      set({ error: 'Failed to create project', isLoading: false });
      console.error(error);
      throw error;
    }
  },

  updateProject: async (id: string, updates: Partial<Project>) => {
    set({ isLoading: true, error: null });
    try {
      const project = await dbService.getProject(id);
      if (!project) throw new Error('Project not found');

      const updatedProject: Project = {
        ...project,
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      await dbService.saveProject(updatedProject);
      
      const { projects, activeProject } = get();
      set({
        projects: projects.map(p => p.id === id ? updatedProject : p),
        activeProject: activeProject?.id === id ? updatedProject : activeProject,
        isLoading: false
      });
    } catch (error) {
      set({ error: 'Failed to update project', isLoading: false });
      console.error(error);
    }
  },

  deleteProject: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await dbService.deleteProject(id);
      const { projects, activeProject } = get();
      set({
        projects: projects.filter(p => p.id !== id),
        activeProject: activeProject?.id === id ? null : activeProject,
        isLoading: false
      });
    } catch (error) {
      set({ error: 'Failed to delete project', isLoading: false });
      console.error(error);
    }
  },

  setActiveProject: (project) => {
    set({ activeProject: project });
  }
}));

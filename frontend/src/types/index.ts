// Type definitions for EPCENTRA Tracker

// Re-export all types from sub-modules
export * from './organization';
export * from './rbac';
export * from './project';
export * from './task';
export * from './timeline';

// Updated User type
export interface User {
  id: string;
  email: string;
  displayName: string;
  role?: string;
  photoURL?: string;
  bio?: string;
  timezone?: string;
  language?: string;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

// User preferences
export interface UserPreferences {
  userId: string;
  theme: 'light' | 'dark' | 'system';
  notifications: {
    email: boolean;
    push: boolean;
    taskAssigned: boolean;
    taskUpdated: boolean;
    mentions: boolean;
    comments: boolean;
  };
  defaultOrganization?: string;
  defaultProject?: string;
}

// Legacy types for backward compatibility (will be removed)
export type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'blocked';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type Phase = 
  | 'Phase 1: Foundation & DMS'
  | 'Phase 2: Template Engine'
  | 'Phase 3: Formula Engine'
  | 'Phase 4: Master Data & Projects'
  | 'Phase 5: Core Modules'
  | 'Phase 6: EPCC Modules'
  | 'Phase 7: Advanced Features';

// Dashboard Stats (will be dynamically calculated)
export interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  blockedTasks: number;
  totalHours: number;
  completionPercentage: number;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  byAssignee: Record<string, number>;
  userWorkload: Record<string, number>;
}

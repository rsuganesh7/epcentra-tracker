// Type definitions for EPCENTRA Tracker

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

export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'admin' | 'developer' | 'qa' | 'devops' | 'viewer';
  createdAt: Date;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  phase: Phase;
  week: number;
  startDate: Date;
  endDate: Date;
  estimatedHours: number;
  actualHours?: number;
  assignedTo: string[]; // User IDs
  dependencies: string[]; // Task IDs
  tags: string[];
  progress: number; // 0-100
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  blockedReason?: string;
}

export interface Comment {
  id: string;
  taskId: string;
  userId: string;
  text: string;
  createdAt: Date;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  targetDate: Date;
  phase: Phase;
  isCompleted: boolean;
  completedAt?: Date;
  criteria: string[];
}

export interface TimeEntry {
  id: string;
  taskId: string;
  userId: string;
  hours: number;
  date: Date;
  description: string;
  createdAt: Date;
}

export interface Activity {
  id: string;
  type: 'task_created' | 'task_updated' | 'task_completed' | 'comment_added' | 'user_assigned';
  userId: string;
  taskId?: string;
  description: string;
  createdAt: Date;
}

export interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  blockedTasks: number;
  totalHours: number;
  completionPercentage: number;
  phaseProgress: Record<Phase, number>;
  userWorkload: Record<string, number>;
}

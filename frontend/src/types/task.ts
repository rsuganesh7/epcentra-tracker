import type { Phase } from './index';

export type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'blocked';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Subtask {
  id: string;
  title: string;
  status: TaskStatus;
}

export interface Task {
  id: string;
  organizationId?: string;
  projectId?: string;
  title: string;
  description: string;
  status: TaskStatus;
  statusId?: string;
  priority: TaskPriority;
  priorityId?: string;
  phase?: Phase;
  week?: number;
  startDate: Date;
  endDate: Date;
  estimatedHours?: number;
  actualHours?: number;
  assignedTo: string[];
  dependencies: string[];
  tags: string[];
  progress: number;
  subtasks: Subtask[];
  blockedReason?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

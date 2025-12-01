// Task Types (Updated for customization)

export interface Task {
  id: string;
  organizationId: string;
  projectId: string;
  key: string; // e.g., "PROJ-123"
  title: string;
  description: string;
  statusId: string; // Reference to WorkflowStatus
  priorityId: string; // Reference to Priority
  type: TaskType;
  
  // Assignment
  assignees: string[]; // User IDs
  reporter: string; // User ID
  
  // Timeline
  startDate?: Date;
  dueDate?: Date;
  estimatedHours?: number;
  actualHours?: number;
  
  // Hierarchy
  parentTaskId?: string; // For subtasks
  epic?: string; // Epic ID
  sprint?: string; // Sprint ID
  
  // Metadata
  labels: string[]; // Label IDs
  attachments: Attachment[];
  watchers: string[]; // User IDs
  customFields: Record<string, any>;
  
  // Progress
  progress: number; // 0-100
  
  // Audit
  createdBy: string;
  createdAt: Date;
  updatedBy: string;
  updatedAt: Date;
  completedAt?: Date;
}

export type TaskType = 
  | 'task'
  | 'bug'
  | 'feature'
  | 'epic'
  | 'story'
  | 'improvement'
  | 'spike';

export interface Subtask {
  id: string;
  taskId: string;
  title: string;
  statusId: string;
  assignee?: string;
  order: number;
  createdAt: Date;
}

export interface Comment {
  id: string;
  taskId: string;
  userId: string;
  text: string;
  mentions: string[]; // User IDs
  attachments: Attachment[];
  createdAt: Date;
  updatedAt?: Date;
  editedAt?: Date;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  uploadedBy: string;
  uploadedAt: Date;
}

export interface TimeEntry {
  id: string;
  taskId: string;
  userId: string;
  hours: number;
  date: Date;
  description?: string;
  billable: boolean;
  createdAt: Date;
}

export interface Activity {
  id: string;
  organizationId: string;
  projectId?: string;
  taskId?: string;
  userId: string;
  type: ActivityType;
  description: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export type ActivityType =
  | 'task_created'
  | 'task_updated'
  | 'task_deleted'
  | 'task_assigned'
  | 'task_status_changed'
  | 'task_priority_changed'
  | 'comment_added'
  | 'comment_edited'
  | 'comment_deleted'
  | 'attachment_added'
  | 'attachment_removed'
  | 'time_logged'
  | 'user_mentioned'
  | 'subtask_added'
  | 'subtask_completed';

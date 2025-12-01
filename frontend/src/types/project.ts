// Project and Customizable Workflow Types

export interface Project {
  id: string;
  organizationId: string;
  name: string;
  key: string; // Short identifier (e.g., "PROJ", "DEV")
  description?: string;
  icon?: string;
  color?: string;
  visibility: 'private' | 'team' | 'organization' | 'public';
  status: 'active' | 'archived' | 'on-hold';
  startDate?: Date;
  endDate?: Date;
  lead: string; // User ID
  members: string[]; // User IDs
  teams: string[]; // Team IDs
  settings: ProjectSettings;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectSettings {
  workflow: string; // Workflow ID
  defaultAssignee?: string;
  allowSubtasks: boolean;
  allowTimeTracking: boolean;
  allowAttachments: boolean;
  requireEstimates: boolean;
  autoAssignCreator: boolean;
  notifyOnTaskUpdate: boolean;
}

export interface Workflow {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  isDefault: boolean;
  statuses: WorkflowStatus[];
  transitions: WorkflowTransition[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkflowStatus {
  id: string;
  name: string;
  category: 'todo' | 'in-progress' | 'done';
  color: string;
  order: number;
  description?: string;
}

export interface WorkflowTransition {
  id: string;
  fromStatusId: string;
  toStatusId: string;
  name: string;
  requiredRole?: string[];
  conditions?: TransitionCondition[];
}

export interface TransitionCondition {
  type: 'field-required' | 'approval-required' | 'subtasks-completed' | 'time-logged';
  value?: any;
}

export interface Priority {
  id: string;
  organizationId: string;
  name: string;
  level: number; // 1 (lowest) to 5 (highest)
  color: string;
  icon?: string;
  isDefault: boolean;
}

export interface Label {
  id: string;
  organizationId: string;
  projectId?: string; // Optional: project-specific labels
  name: string;
  color: string;
  description?: string;
}

export interface CustomField {
  id: string;
  organizationId: string;
  projectId?: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'select' | 'multi-select' | 'user' | 'checkbox';
  required: boolean;
  options?: string[]; // For select/multi-select
  defaultValue?: any;
  order: number;
}

// Timeline, Milestone, and Sprint Types

export interface Milestone {
  id: string;
  organizationId: string;
  projectId: string;
  name: string;
  description?: string;
  startDate?: Date;
  dueDate: Date;
  status: 'planning' | 'in-progress' | 'completed' | 'cancelled';
  progress: number; // 0-100
  tasks: string[]; // Task IDs
  completedAt?: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Sprint {
  id: string;
  organizationId: string;
  projectId: string;
  name: string;
  goal?: string;
  startDate: Date;
  endDate: Date;
  status: 'planning' | 'active' | 'completed';
  tasks: string[]; // Task IDs
  capacity?: {
    teamCapacity: number; // Total hours available
    committedPoints: number; // Story points committed
  };
  completedAt?: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Epic {
  id: string;
  organizationId: string;
  projectId: string;
  key: string; // e.g., "PROJ-EP-1"
  name: string;
  description?: string;
  color: string;
  startDate?: Date;
  dueDate?: Date;
  status: string; // Status ID
  progress: number; // 0-100
  tasks: string[]; // Task IDs
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Roadmap {
  id: string;
  organizationId: string;
  projectId?: string; // Optional: can be org-wide
  name: string;
  description?: string;
  visibility: 'private' | 'team' | 'organization' | 'public';
  timeframe: {
    startDate: Date;
    endDate: Date;
    viewBy: 'week' | 'month' | 'quarter' | 'year';
  };
  items: RoadmapItem[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RoadmapItem {
  id: string;
  type: 'milestone' | 'epic' | 'release' | 'custom';
  referenceId?: string; // ID of the actual milestone/epic
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  color: string;
  progress: number;
  dependencies: string[]; // Other RoadmapItem IDs
  status: string;
  order: number;
}

export interface Release {
  id: string;
  organizationId: string;
  projectId: string;
  version: string; // e.g., "1.0.0", "2023.Q4"
  name: string;
  description?: string;
  releaseDate: Date;
  status: 'planning' | 'in-progress' | 'released' | 'cancelled';
  tasks: string[];
  epics: string[];
  releaseNotes?: string;
  releasedAt?: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

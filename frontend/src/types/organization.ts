// Organization and Multi-tenancy Types

export interface Organization {
  id: string;
  name: string;
  slug: string; // URL-friendly identifier
  description?: string;
  logoURL?: string;
  role?: OrganizationRole; // convenience for frontend selection
  settings: OrganizationSettings;
  subscription?: {
    plan: 'free' | 'starter' | 'professional' | 'enterprise';
    maxUsers: number;
    maxProjects: number;
    features: string[];
  };
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrganizationSettings {
  timezone: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  weekStart: 'monday' | 'sunday';
  currency: string;
  language: string;
  allowPublicProjects: boolean;
  requireApprovalForTasks: boolean;
  defaultTaskPriority: string;
}

export interface OrganizationMember {
  id: string;
  organizationId: string;
  userId: string;
  role: OrganizationRole;
  teams: string[]; // Team IDs
  invitedBy: string;
  joinedAt: Date;
  status: 'active' | 'invited' | 'suspended';
  permissions: string[]; // Permission identifiers
}

export type OrganizationRole = 
  | 'owner'
  | 'admin'
  | 'manager'
  | 'member'
  | 'guest';

export interface Team {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  members: string[]; // User IDs
  lead: string; // User ID
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

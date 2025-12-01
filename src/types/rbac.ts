// Role-Based Access Control (RBAC) Types

export type Resource = 
  | 'organization'
  | 'project'
  | 'task'
  | 'milestone'
  | 'team'
  | 'user'
  | 'workflow'
  | 'status'
  | 'priority'
  | 'label'
  | 'comment'
  | 'attachment'
  | 'timeEntry';

export type Action = 
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'assign'
  | 'comment'
  | 'manage';

export interface Permission {
  resource: Resource;
  actions: Action[];
  scope?: 'all' | 'team' | 'own'; // all = entire org, team = assigned teams, own = created by user
}

export interface Role {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  isSystem: boolean; // System roles cannot be deleted
  permissions: Permission[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// Predefined system roles with permissions
export const SYSTEM_ROLES: Record<string, Permission[]> = {
  owner: [
    { resource: 'organization', actions: ['read', 'update', 'delete', 'manage'] },
    { resource: 'project', actions: ['create', 'read', 'update', 'delete', 'manage'], scope: 'all' },
    { resource: 'task', actions: ['create', 'read', 'update', 'delete', 'assign', 'comment'], scope: 'all' },
    { resource: 'milestone', actions: ['create', 'read', 'update', 'delete'], scope: 'all' },
    { resource: 'team', actions: ['create', 'read', 'update', 'delete', 'manage'], scope: 'all' },
    { resource: 'user', actions: ['create', 'read', 'update', 'delete', 'manage'], scope: 'all' },
    { resource: 'workflow', actions: ['create', 'read', 'update', 'delete', 'manage'], scope: 'all' },
    { resource: 'status', actions: ['create', 'read', 'update', 'delete'], scope: 'all' },
    { resource: 'priority', actions: ['create', 'read', 'update', 'delete'], scope: 'all' },
    { resource: 'label', actions: ['create', 'read', 'update', 'delete'], scope: 'all' },
  ],
  admin: [
    { resource: 'organization', actions: ['read', 'update'] },
    { resource: 'project', actions: ['create', 'read', 'update', 'delete', 'manage'], scope: 'all' },
    { resource: 'task', actions: ['create', 'read', 'update', 'delete', 'assign', 'comment'], scope: 'all' },
    { resource: 'milestone', actions: ['create', 'read', 'update', 'delete'], scope: 'all' },
    { resource: 'team', actions: ['create', 'read', 'update', 'delete', 'manage'], scope: 'all' },
    { resource: 'user', actions: ['read', 'update', 'manage'], scope: 'all' },
    { resource: 'workflow', actions: ['create', 'read', 'update', 'delete'], scope: 'all' },
  ],
  manager: [
    { resource: 'project', actions: ['create', 'read', 'update', 'manage'], scope: 'team' },
    { resource: 'task', actions: ['create', 'read', 'update', 'delete', 'assign', 'comment'], scope: 'team' },
    { resource: 'milestone', actions: ['create', 'read', 'update', 'delete'], scope: 'team' },
    { resource: 'team', actions: ['read', 'update'], scope: 'team' },
    { resource: 'user', actions: ['read'], scope: 'all' },
  ],
  member: [
    { resource: 'project', actions: ['read'], scope: 'team' },
    { resource: 'task', actions: ['create', 'read', 'update', 'comment'], scope: 'team' },
    { resource: 'task', actions: ['update', 'delete'], scope: 'own' },
    { resource: 'milestone', actions: ['read'], scope: 'team' },
    { resource: 'team', actions: ['read'], scope: 'team' },
    { resource: 'user', actions: ['read'], scope: 'all' },
  ],
  guest: [
    { resource: 'project', actions: ['read'], scope: 'team' },
    { resource: 'task', actions: ['read', 'comment'], scope: 'team' },
    { resource: 'team', actions: ['read'], scope: 'team' },
    { resource: 'user', actions: ['read'], scope: 'all' },
  ],
};

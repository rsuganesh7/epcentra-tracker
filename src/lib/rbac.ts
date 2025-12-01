// RBAC Helper Functions

import { Permission, Action, Resource, SYSTEM_ROLES } from '../types/rbac';
import { OrganizationMember, OrganizationRole } from '../types/organization';

/**
 * Check if a user has permission to perform an action on a resource
 */
export function hasPermission(
  member: OrganizationMember,
  resource: Resource,
  action: Action,
  context?: {
    createdBy?: string;
    teamIds?: string[];
  }
): boolean {
  // Get permissions for the user's role
  const rolePermissions = SYSTEM_ROLES[member.role as keyof typeof SYSTEM_ROLES] || [];
  
  // Combine with custom permissions
  const allPermissions = [...rolePermissions, ...member.permissions];
  
  // Check each permission
  for (const permission of allPermissions) {
    if (permission.resource !== resource) continue;
    if (!permission.actions.includes(action)) continue;
    
    // Check scope
    if (!permission.scope || permission.scope === 'all') {
      return true;
    }
    
    if (permission.scope === 'team' && context?.teamIds) {
      const hasTeamOverlap = member.teams.some(teamId => 
        context.teamIds!.includes(teamId)
      );
      if (hasTeamOverlap) return true;
    }
    
    if (permission.scope === 'own' && context?.createdBy) {
      if (context.createdBy === member.userId) return true;
    }
  }
  
  return false;
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: OrganizationRole): Permission[] {
  return SYSTEM_ROLES[role] || [];
}

/**
 * Check if user is owner or admin
 */
export function isOwnerOrAdmin(role: OrganizationRole): boolean {
  return role === 'owner' || role === 'admin';
}

/**
 * Check if user can manage the resource
 */
export function canManage(
  member: OrganizationMember,
  resource: Resource
): boolean {
  return hasPermission(member, resource, 'manage');
}

/**
 * Filter permissions by resource
 */
export function getResourcePermissions(
  permissions: Permission[],
  resource: Resource
): Permission | undefined {
  return permissions.find(p => p.resource === resource);
}

/**
 * Check if user has any of the specified actions on a resource
 */
export function hasAnyPermission(
  member: OrganizationMember,
  resource: Resource,
  actions: Action[],
  context?: {
    createdBy?: string;
    teamIds?: string[];
  }
): boolean {
  return actions.some(action => 
    hasPermission(member, resource, action, context)
  );
}

/**
 * Get allowed actions for a user on a resource
 */
export function getAllowedActions(
  member: OrganizationMember,
  resource: Resource,
  context?: {
    createdBy?: string;
    teamIds?: string[];
  }
): Action[] {
  const rolePermissions = SYSTEM_ROLES[member.role as keyof typeof SYSTEM_ROLES] || [];
  const allPermissions = [...rolePermissions, ...member.permissions];
  
  const allowedActions = new Set<Action>();
  
  for (const permission of allPermissions) {
    if (permission.resource !== resource) continue;
    
    const hasScope = 
      !permission.scope || 
      permission.scope === 'all' ||
      (permission.scope === 'team' && context?.teamIds?.some(id => member.teams.includes(id))) ||
      (permission.scope === 'own' && context?.createdBy === member.userId);
    
    if (hasScope) {
      permission.actions.forEach(action => allowedActions.add(action));
    }
  }
  
  return Array.from(allowedActions);
}

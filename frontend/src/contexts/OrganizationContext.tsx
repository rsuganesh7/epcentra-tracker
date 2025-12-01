// Organization Context and Hooks

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { Organization, OrganizationMember } from '../types/organization';
import { hasPermission, getAllowedActions } from '../lib/rbac';
import { Resource, Action } from '../types/rbac';
import { api } from '../lib/apiClient';

interface OrganizationContextType {
  currentOrganization: Organization | null;
  organizations: Organization[];
  currentMember: OrganizationMember | null;
  loading: boolean;
  error: string | null;
  switchOrganization: (orgId: string) => Promise<void>;
  hasPermission: (resource: Resource, action: Action, context?: any) => boolean;
  getAllowedActions: (resource: Resource, context?: any) => Action[];
  isOwnerOrAdmin: boolean;
  refetch: () => Promise<void>;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export const useOrganization = () => {
  const context = useContext(OrganizationContext);
  if (!context) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
};

export const OrganizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [currentMember, setCurrentMember] = useState<OrganizationMember | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrganizations = async () => {
    if (!currentUser) {
      setOrganizations([]);
      setCurrentOrganization(null);
      setCurrentMember(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { organizations: orgsFromApi } = await api.organizations.list();

      const orgs: Organization[] = orgsFromApi.map((org: any) => ({
        id: org.id,
        name: org.name,
        slug: org.slug,
        description: org.description,
        settings: org.settings || {},
        role: org.role,
        createdBy: org.createdBy || org.created_by || '',
        createdAt: org.createdAt ? new Date(org.createdAt) : new Date(),
        updatedAt: org.updatedAt ? new Date(org.updatedAt) : new Date(),
      }));

      setOrganizations(orgs);

      const storedOrgId = localStorage.getItem('currentOrganizationId');
      let currentOrg = orgs.find(org => org.id === storedOrgId) || orgs[0] || null;

      if (currentOrg) {
        const membershipRaw = orgsFromApi.find((o: any) => o.id === currentOrg!.id);
        const membership: OrganizationMember | null = membershipRaw
          ? {
              id: `${membershipRaw.id}-${currentUser.id}`,
              organizationId: membershipRaw.id,
              userId: currentUser.id,
              role: membershipRaw.role || 'member',
              teams: membershipRaw.teams || [],
              invitedBy: membershipRaw.createdBy || currentUser.id,
              joinedAt: new Date(),
              status: 'active',
              permissions: [],
            }
          : null;

        setCurrentOrganization(currentOrg);
        setCurrentMember(membership);
        localStorage.setItem('currentOrganizationId', currentOrg.id);
      } else {
        setCurrentOrganization(null);
        setCurrentMember(null);
      }
    } catch (err: any) {
      console.error('Error fetching organizations:', err);
      setError(err.message || 'Failed to load organizations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, [currentUser?.id]);

  const switchOrganization = async (orgId: string) => {
    const org = organizations.find(o => o.id === orgId);
    if (org && currentUser) {
      setCurrentOrganization(org);
      localStorage.setItem('currentOrganizationId', orgId);

      const membership: OrganizationMember = {
        id: `${org.id}-${currentUser.id}`,
        organizationId: org.id,
        userId: currentUser.id,
        role: (organizations.find(o => o.id === orgId) as any)?.role || 'member',
        teams: [],
        invitedBy: currentUser.id,
        joinedAt: new Date(),
        status: 'active',
        permissions: [],
      };
      setCurrentMember(membership);
    }
  };

  const checkPermission = (resource: Resource, action: Action, context?: any): boolean => {
    if (!currentMember) return false;
    return hasPermission(currentMember, resource, action, context);
  };

  const getActions = (resource: Resource, context?: any): Action[] => {
    if (!currentMember) return [];
    return getAllowedActions(currentMember, resource, context);
  };

  const isOwnerOrAdmin = currentMember ? 
    (currentMember.role === 'owner' || currentMember.role === 'admin') : 
    false;

  const value: OrganizationContextType = {
    currentOrganization,
    organizations,
    currentMember,
    loading,
    error,
    switchOrganization,
    hasPermission: checkPermission,
    getAllowedActions: getActions,
    isOwnerOrAdmin,
    refetch: fetchOrganizations,
  };

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
};

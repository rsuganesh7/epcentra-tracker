// Organization Context and Hooks

import React, { createContext, useContext, useEffect, useState } from 'react';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from './AuthContext';
import { Organization, OrganizationMember } from '../types/organization';
import { hasPermission, getAllowedActions } from '../lib/rbac';
import { Resource, Action } from '../types/rbac';

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

      // Fetch user's organization memberships
      const membershipsQuery = query(
        collection(db, 'organizationMembers'),
        where('userId', '==', currentUser.id),
        where('status', '==', 'active')
      );
      
      const membershipsSnapshot = await getDocs(membershipsQuery);
      const membershipDocs = membershipsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as OrganizationMember[];

      // Fetch organizations
      const orgPromises = membershipDocs.map(async (membership) => {
        const orgDoc = await getDoc(doc(db, 'organizations', membership.organizationId));
        if (orgDoc.exists()) {
          return { id: orgDoc.id, ...orgDoc.data() } as Organization;
        }
        return null;
      });

      const orgs = (await Promise.all(orgPromises)).filter(Boolean) as Organization[];
      setOrganizations(orgs);

      // Set current organization (use stored preference or first org)
      const storedOrgId = localStorage.getItem('currentOrganizationId');
      let currentOrg = orgs.find(org => org.id === storedOrgId) || orgs[0] || null;
      
      if (currentOrg) {
        setCurrentOrganization(currentOrg);
        const membership = membershipDocs.find(m => m.organizationId === currentOrg!.id);
        setCurrentMember(membership || null);
        localStorage.setItem('currentOrganizationId', currentOrg.id);
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
    if (org) {
      setCurrentOrganization(org);
      localStorage.setItem('currentOrganizationId', orgId);
      
      // Fetch membership for this org
      const membershipsQuery = query(
        collection(db, 'organizationMembers'),
        where('userId', '==', currentUser!.id),
        where('organizationId', '==', orgId),
        where('status', '==', 'active')
      );
      
      const snapshot = await getDocs(membershipsQuery);
      if (!snapshot.empty) {
        const membershipData = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as OrganizationMember;
        setCurrentMember(membershipData);
      }
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

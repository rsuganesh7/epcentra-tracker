// Project Hooks

import { useState, useEffect } from 'react';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  orderBy
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useOrganization } from '../contexts/OrganizationContext';
import { Project, Workflow, Priority, Label } from '../types';

export function useProjects() {
  const { currentUser } = useAuth();
  const { currentOrganization, currentMember } = useOrganization();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentOrganization || !currentUser) {
      setProjects([]);
      setLoading(false);
      return;
    }

    fetchProjects();
  }, [currentOrganization?.id, currentUser?.id]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);

      const projectsQuery = query(
        collection(db, 'projects'),
        where('organizationId', '==', currentOrganization!.id),
        where('status', '!=', 'archived'),
        orderBy('status'),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(projectsQuery);
      const projectsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Project[];

      // Filter based on visibility and member access
      const accessibleProjects = projectsData.filter(project => {
        if (project.visibility === 'organization' || project.visibility === 'public') {
          return true;
        }
        if (project.visibility === 'team') {
          return project.teams.some(teamId => currentMember?.teams.includes(teamId));
        }
        if (project.visibility === 'private') {
          return project.members.includes(currentUser!.id) || 
                 project.lead === currentUser!.id;
        }
        return false;
      });

      setProjects(accessibleProjects);
    } catch (err: any) {
      console.error('Error fetching projects:', err);
      setError(err.message || 'Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  return { projects, loading, error, refetch: fetchProjects };
}

export function useProject(projectId: string) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) {
      setProject(null);
      setLoading(false);
      return;
    }

    fetchProject();
  }, [projectId]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      setError(null);

      const projectDoc = await getDoc(doc(db, 'projects', projectId));
      if (projectDoc.exists()) {
        setProject({ id: projectDoc.id, ...projectDoc.data() } as Project);
      } else {
        setError('Project not found');
      }
    } catch (err: any) {
      console.error('Error fetching project:', err);
      setError(err.message || 'Failed to fetch project');
    } finally {
      setLoading(false);
    }
  };

  return { project, loading, error, refetch: fetchProject };
}

export async function createProject(
  projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, 'projects'), {
      ...projectData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error: any) {
    console.error('Error creating project:', error);
    throw new Error(error.message || 'Failed to create project');
  }
}

export async function updateProject(
  projectId: string,
  updates: Partial<Project>
): Promise<void> {
  try {
    await updateDoc(doc(db, 'projects', projectId), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error: any) {
    console.error('Error updating project:', error);
    throw new Error(error.message || 'Failed to update project');
  }
}

export async function deleteProject(projectId: string): Promise<void> {
  try {
    // Soft delete by archiving
    await updateDoc(doc(db, 'projects', projectId), {
      status: 'archived',
      updatedAt: serverTimestamp(),
    });
  } catch (error: any) {
    console.error('Error deleting project:', error);
    throw new Error(error.message || 'Failed to delete project');
  }
}

// Workflow Hooks

export function useWorkflows() {
  const { currentOrganization } = useOrganization();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentOrganization) {
      setWorkflows([]);
      setLoading(false);
      return;
    }

    fetchWorkflows();
  }, [currentOrganization?.id]);

  const fetchWorkflows = async () => {
    try {
      setLoading(true);
      setError(null);

      const workflowsQuery = query(
        collection(db, 'workflows'),
        where('organizationId', '==', currentOrganization!.id),
        orderBy('isDefault', 'desc'),
        orderBy('name')
      );

      const snapshot = await getDocs(workflowsQuery);
      const workflowsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Workflow[];

      setWorkflows(workflowsData);
    } catch (err: any) {
      console.error('Error fetching workflows:', err);
      setError(err.message || 'Failed to fetch workflows');
    } finally {
      setLoading(false);
    }
  };

  return { workflows, loading, error, refetch: fetchWorkflows };
}

// Priority Hooks

export function usePriorities() {
  const { currentOrganization } = useOrganization();
  const [priorities, setPriorities] = useState<Priority[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentOrganization) {
      setPriorities([]);
      setLoading(false);
      return;
    }

    fetchPriorities();
  }, [currentOrganization?.id]);

  const fetchPriorities = async () => {
    try {
      setLoading(true);
      setError(null);

      const prioritiesQuery = query(
        collection(db, 'priorities'),
        where('organizationId', '==', currentOrganization!.id),
        orderBy('level')
      );

      const snapshot = await getDocs(prioritiesQuery);
      const prioritiesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Priority[];

      setPriorities(prioritiesData);
    } catch (err: any) {
      console.error('Error fetching priorities:', err);
      setError(err.message || 'Failed to fetch priorities');
    } finally {
      setLoading(false);
    }
  };

  return { priorities, loading, error, refetch: fetchPriorities };
}

// Label Hooks

export function useLabels(projectId?: string) {
  const { currentOrganization } = useOrganization();
  const [labels, setLabels] = useState<Label[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentOrganization) {
      setLabels([]);
      setLoading(false);
      return;
    }

    fetchLabels();
  }, [currentOrganization?.id, projectId]);

  const fetchLabels = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch org-wide labels
      const orgLabelsQuery = query(
        collection(db, 'labels'),
        where('organizationId', '==', currentOrganization!.id),
        where('projectId', '==', null)
      );

      const orgSnapshot = await getDocs(orgLabelsQuery);
      let labelsData = orgSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Label[];

      // Fetch project-specific labels if projectId provided
      if (projectId) {
        const projectLabelsQuery = query(
          collection(db, 'labels'),
          where('organizationId', '==', currentOrganization!.id),
          where('projectId', '==', projectId)
        );

        const projectSnapshot = await getDocs(projectLabelsQuery);
        const projectLabels = projectSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Label[];

        labelsData = [...labelsData, ...projectLabels];
      }

      setLabels(labelsData);
    } catch (err: any) {
      console.error('Error fetching labels:', err);
      setError(err.message || 'Failed to fetch labels');
    } finally {
      setLoading(false);
    }
  };

  return { labels, loading, error, refetch: fetchLabels };
}

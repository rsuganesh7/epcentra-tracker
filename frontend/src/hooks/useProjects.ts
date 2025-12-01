// Project Hooks

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useOrganization } from '../contexts/OrganizationContext';
import { Project, Workflow, Priority, Label } from '../types';

export function useProjects() {
  const { currentUser } = useAuth();
  const { currentOrganization } = useOrganization();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
    setProjects([]);
    setLoading(false);
  }, [currentOrganization?.id, currentUser?.id]);

  const fetchProjects = async () => {
    setError(null);
    setProjects([]);
    setLoading(false);
  };

  return { projects, loading, error, refetch: fetchProjects };
}

export function useProject(projectId: string) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
    setProject(null);
    setLoading(false);
  }, [projectId]);

  const fetchProject = async () => {
    setError(null);
    setProject(null);
    setLoading(false);
  };

  return { project, loading, error, refetch: fetchProject };
}

export async function createProject(
  _projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  throw new Error('Project creation API not implemented yet');
}

export async function updateProject(
  _projectId: string,
  _updates: Partial<Project>
): Promise<void> {
  throw new Error('Project update API not implemented yet');
}

export async function deleteProject(_projectId: string): Promise<void> {
  throw new Error('Project delete API not implemented yet');
}

// Workflow Hooks

export function useWorkflows() {
  const { currentOrganization } = useOrganization();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
    setWorkflows([]);
    setLoading(false);
  }, [currentOrganization?.id]);

  const fetchWorkflows = async () => {
    setError(null);
    setWorkflows([]);
    setLoading(false);
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
    setError(null);
    setPriorities([]);
    setLoading(false);
  }, [currentOrganization?.id]);

  const fetchPriorities = async () => {
    setError(null);
    setPriorities([]);
    setLoading(false);
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
    setError(null);
    setLabels([]);
    setLoading(false);
  }, [currentOrganization?.id, projectId]);

  const fetchLabels = async () => {
    setError(null);
    setLabels([]);
    setLoading(false);
  };

  return { labels, loading, error, refetch: fetchLabels };
}

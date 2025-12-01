import { useEffect, useState } from 'react';
import { api } from '../lib/apiClient';
import { Task } from '../types';
import { useOrganization } from '../contexts/OrganizationContext';

const mapTaskFromApi = (raw: any): Task => ({
  id: raw.id,
  title: raw.title,
  description: raw.description || '',
  status: raw.status || raw.statusId || 'pending',
  statusId: raw.status || raw.statusId || 'pending',
  priority: raw.priority || 'medium',
  priorityId: raw.priority || raw.priorityId,
  phase: raw.phase,
  week: raw.week,
  startDate: raw.startDate ? new Date(raw.startDate) : new Date(),
  endDate: raw.endDate ? new Date(raw.endDate) : new Date(),
  estimatedHours: raw.estimatedHours,
  actualHours: raw.actualHours,
  assignedTo: raw.assignedTo || [],
  dependencies: raw.dependencies || [],
  tags: raw.tags || [],
  progress: raw.progress || 0,
  subtasks: raw.subtasks || [],
  blockedReason: raw.blockedReason,
  createdBy: raw.createdBy || '',
  createdAt: raw.createdAt ? new Date(raw.createdAt) : new Date(),
  updatedAt: raw.updatedAt ? new Date(raw.updatedAt) : new Date(),
  completedAt: raw.completedAt ? new Date(raw.completedAt) : undefined,
});

export const useTasks = (filters?: { phase?: string; status?: string; assignedTo?: string }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentOrganization } = useOrganization();

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const { tasks } = await api.tasks.list(
        currentOrganization?.id ? `?organizationId=${currentOrganization.id}` : ''
      );
      let mapped = tasks.map(mapTaskFromApi);
      if (filters?.phase) {
        mapped = mapped.filter(t => t.phase === filters.phase);
      }
      if (filters?.status) {
        mapped = mapped.filter(t => t.status === filters.status || t.statusId === filters.status);
      }
      if (filters?.assignedTo) {
        mapped = mapped.filter(t => t.assignedTo?.includes(filters.assignedTo!));
      }
      setTasks(mapped);
    } catch (err: any) {
      setError(err.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters?.phase, filters?.status, filters?.assignedTo, currentOrganization?.id]);

  return { tasks, loading, error, refetch: fetchTasks };
};

export const createTask = async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
  const payload = {
    ...task,
    startDate: task.startDate?.toISOString(),
    endDate: task.endDate?.toISOString(),
    completedAt: task.completedAt?.toISOString(),
  };
  const { task: created } = await api.tasks.create(payload);
  return created.id as string;
};

export const updateTask = async (taskId: string, updates: Partial<Task>) => {
  const payload = {
    ...updates,
    startDate: updates.startDate ? updates.startDate.toISOString() : undefined,
    endDate: updates.endDate ? updates.endDate.toISOString() : undefined,
    completedAt: updates.completedAt ? updates.completedAt.toISOString() : undefined,
  };
  await api.tasks.update(taskId, payload);
};

export const deleteTask = async (taskId: string) => {
  await api.tasks.remove(taskId);
};

export const logActivity = async (_activity: any) => {
  // Activity logging not wired yet.
  return;
};

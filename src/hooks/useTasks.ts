import { useState, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  Timestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Task, Comment, TimeEntry, Activity } from '../types';

// Convert Firestore timestamp to Date
const convertTimestamp = (data: any) => {
  const converted = { ...data };
  Object.keys(converted).forEach(key => {
    if (converted[key] instanceof Timestamp) {
      converted[key] = converted[key].toDate();
    }
  });
  return converted;
};

export const useTasks = (filters?: { phase?: string; status?: string; assignedTo?: string }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let q = query(collection(db, 'tasks'), orderBy('createdAt', 'desc'));
    
    if (filters?.phase) {
      q = query(q, where('phase', '==', filters.phase));
    }
    if (filters?.status) {
      q = query(q, where('status', '==', filters.status));
    }
    if (filters?.assignedTo) {
      q = query(q, where('assignedTo', 'array-contains', filters.assignedTo));
    }

    const unsubscribe = onSnapshot(
      q, 
      (snapshot) => {
        const tasksData = snapshot.docs.map(doc => {
          const data = convertTimestamp(doc.data());
          const subtasks = Array.isArray(data.subtasks) ? data.subtasks : [];

          return {
            id: doc.id,
            ...data,
            subtasks
          } as Task;
        });
        setTasks(tasksData);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error fetching tasks:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [filters?.phase, filters?.status, filters?.assignedTo]);

  return { tasks, loading, error };
};

export const useTask = (taskId: string) => {
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!taskId) {
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      doc(db, 'tasks', taskId), 
      (doc) => {
        if (doc.exists()) {
          const data = convertTimestamp(doc.data());
          const subtasks = Array.isArray(data.subtasks) ? data.subtasks : [];

          setTask({
            id: doc.id,
            ...data,
            subtasks
          } as Task);
        }
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error fetching task:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [taskId]);

  return { task, loading, error };
};

export const createTask = async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const docRef = await addDoc(collection(db, 'tasks'), {
      ...task,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    console.log('Task created successfully:', docRef.id);
    return docRef.id;
  } catch (error: any) {
    console.error('Error creating task:', error);
    throw new Error(`Failed to create task: ${error.message}`);
  }
};

export const updateTask = async (taskId: string, updates: Partial<Task>) => {
  try {
    await updateDoc(doc(db, 'tasks', taskId), {
      ...updates,
      updatedAt: Timestamp.now()
    });
    console.log('Task updated successfully:', taskId);
  } catch (error: any) {
    console.error('Error updating task:', error);
    throw new Error(`Failed to update task: ${error.message}`);
  }
};

export const deleteTask = async (taskId: string) => {
  await deleteDoc(doc(db, 'tasks', taskId));
};

export const useComments = (taskId: string) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!taskId) return;

    const q = query(
      collection(db, 'comments'),
      where('taskId', '==', taskId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const commentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...convertTimestamp(doc.data())
      })) as Comment[];
      setComments(commentsData);
      setLoading(false);
    });

    return unsubscribe;
  }, [taskId]);

  return { comments, loading };
};

export const addComment = async (taskId: string, userId: string, text: string) => {
  await addDoc(collection(db, 'comments'), {
    taskId,
    userId,
    text,
    createdAt: Timestamp.now()
  });
};

export const useTimeEntries = (taskId?: string) => {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let q = query(collection(db, 'timeEntries'), orderBy('date', 'desc'));
    
    if (taskId) {
      q = query(q, where('taskId', '==', taskId));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const entriesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...convertTimestamp(doc.data())
      })) as TimeEntry[];
      setTimeEntries(entriesData);
      setLoading(false);
    });

    return unsubscribe;
  }, [taskId]);

  return { timeEntries, loading };
};

export const addTimeEntry = async (entry: Omit<TimeEntry, 'id' | 'createdAt'>) => {
  await addDoc(collection(db, 'timeEntries'), {
    ...entry,
    createdAt: Timestamp.now()
  });
};

export const useActivities = (limit: number = 20) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'activities'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const activitiesData = snapshot.docs
        .slice(0, limit)
        .map(doc => ({
          id: doc.id,
          ...convertTimestamp(doc.data())
        })) as Activity[];
      setActivities(activitiesData);
      setLoading(false);
    });

    return unsubscribe;
  }, [limit]);

  return { activities, loading };
};

export const logActivity = async (activity: Omit<Activity, 'id' | 'createdAt'>) => {
  await addDoc(collection(db, 'activities'), {
    ...activity,
    createdAt: Timestamp.now()
  });
};

import React, { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { useTasks, createTask, updateTask, logActivity } from '../hooks/useTasks';
import { Task, TaskStatus, Phase } from '../types';
import { useAuth } from '../contexts/AuthContext';
import TaskModal from '../components/TaskModal';
import TaskCard from '../components/TaskCard';

const Tasks: React.FC = () => {
  const { tasks, loading, error } = useTasks();
  const { currentUser } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [phaseFilter, setPhaseFilter] = useState<Phase | 'all'>('all');

  const phases: Phase[] = [
    'Phase 1: Foundation & DMS',
    'Phase 2: Template Engine',
    'Phase 3: Formula Engine',
    'Phase 4: Master Data & Projects',
    'Phase 5: Core Modules',
    'Phase 6: EPCC Modules',
    'Phase 7: Advanced Features'
  ];

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesPhase = phaseFilter === 'all' || task.phase === phaseFilter;
    return matchesSearch && matchesStatus && matchesPhase;
  });

  const handleCreateTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const taskId = await createTask({
        ...taskData,
        createdBy: currentUser!.id
      });
      
      await logActivity({
        type: 'task_created',
        userId: currentUser!.id,
        taskId,
        description: `${currentUser!.displayName} created task: ${taskData.title}`
      });
      
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Failed to create task');
    }
  };

  const handleUpdateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      await updateTask(taskId, updates);
      
      if (updates.status === 'completed') {
        await logActivity({
          type: 'task_completed',
          userId: currentUser!.id,
          taskId,
          description: `${currentUser!.displayName} completed task`
        });
      } else {
        await logActivity({
          type: 'task_updated',
          userId: currentUser!.id,
          taskId,
          description: `${currentUser!.displayName} updated task`
        });
      }
      
      setSelectedTask(null);
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Failed to update task');
    }
  };

  const groupedTasks = {
    pending: filteredTasks.filter(t => t.status === 'pending'),
    'in-progress': filteredTasks.filter(t => t.status === 'in-progress'),
    completed: filteredTasks.filter(t => t.status === 'completed'),
    blocked: filteredTasks.filter(t => t.status === 'blocked')
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl text-gray-600">Loading tasks...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-red-800 font-semibold mb-2">Error Loading Tasks</h2>
          <p className="text-red-700">{error}</p>
          <p className="text-red-600 text-sm mt-2">Please ensure the Flask backend is running and reachable.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-epcentra-navy">Tasks</h1>
          <p className="text-gray-600 mt-1">{filteredTasks.length} tasks found</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Create Task</span>
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as TaskStatus | 'all')}
            className="select"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="blocked">Blocked</option>
          </select>

          {/* Phase Filter */}
          <select
            value={phaseFilter}
            onChange={(e) => setPhaseFilter(e.target.value as Phase | 'all')}
            className="select"
          >
            <option value="all">All Phases</option>
            {phases.map(phase => (
              <option key={phase} value={phase}>{phase}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Pending */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-700">Pending</h3>
            <span className="badge badge-pending">{groupedTasks.pending.length}</span>
          </div>
          <div className="space-y-3">
            {groupedTasks.pending.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onClick={() => setSelectedTask(task)}
              />
            ))}
            {groupedTasks.pending.length === 0 && (
              <p className="text-gray-400 text-center py-8 text-sm">No pending tasks</p>
            )}
          </div>
        </div>

        {/* In Progress */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-700">In Progress</h3>
            <span className="badge badge-in-progress">{groupedTasks['in-progress'].length}</span>
          </div>
          <div className="space-y-3">
            {groupedTasks['in-progress'].map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onClick={() => setSelectedTask(task)}
              />
            ))}
            {groupedTasks['in-progress'].length === 0 && (
              <p className="text-gray-400 text-center py-8 text-sm">No tasks in progress</p>
            )}
          </div>
        </div>

        {/* Completed */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-700">Completed</h3>
            <span className="badge badge-completed">{groupedTasks.completed.length}</span>
          </div>
          <div className="space-y-3">
            {groupedTasks.completed.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onClick={() => setSelectedTask(task)}
              />
            ))}
            {groupedTasks.completed.length === 0 && (
              <p className="text-gray-400 text-center py-8 text-sm">No completed tasks</p>
            )}
          </div>
        </div>

        {/* Blocked */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-700">Blocked</h3>
            <span className="badge badge-blocked">{groupedTasks.blocked.length}</span>
          </div>
          <div className="space-y-3">
            {groupedTasks.blocked.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onClick={() => setSelectedTask(task)}
              />
            ))}
            {groupedTasks.blocked.length === 0 && (
              <p className="text-gray-400 text-center py-8 text-sm">No blocked tasks</p>
            )}
          </div>
        </div>
      </div>

      {/* Create Task Modal */}
      {showCreateModal && (
        <TaskModal
          onClose={() => setShowCreateModal(false)}
          onSave={handleCreateTask}
        />
      )}

      {/* Edit Task Modal */}
      {selectedTask && (
        <TaskModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onSave={(taskData) => handleUpdateTask(selectedTask.id, taskData)}
        />
      )}
    </div>
  );
};

export default Tasks;

import React, { useState } from 'react';
import { Task, Phase, TaskStatus, TaskPriority, Subtask } from '../types';
import { X } from 'lucide-react';
import { format } from 'date-fns';

interface TaskModalProps {
  task?: Task;
  onClose: () => void;
  onSave: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

const TaskModal: React.FC<TaskModalProps> = ({ task, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    status: task?.status || 'pending' as TaskStatus,
    priority: task?.priority || 'medium' as TaskPriority,
    phase: task?.phase || 'Phase 1: Foundation & DMS' as Phase,
    week: task?.week || 1,
    startDate: task?.startDate ? format(task.startDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
    endDate: task?.endDate ? format(task.endDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
    estimatedHours: task?.estimatedHours || 8,
    actualHours: task?.actualHours || 0,
    assignedTo: task?.assignedTo || [],
    dependencies: task?.dependencies || [],
    tags: task?.tags?.join(', ') || '',
    progress: task?.progress || 0,
    blockedReason: task?.blockedReason || '',
    subtasks: task?.subtasks || [] as Subtask[]
  });

  const phases: Phase[] = [
    'Phase 1: Foundation & DMS',
    'Phase 2: Template Engine',
    'Phase 3: Formula Engine',
    'Phase 4: Master Data & Projects',
    'Phase 5: Core Modules',
    'Phase 6: EPCC Modules',
    'Phase 7: Advanced Features'
  ];

  const createSubtask = (): Subtask => ({
    id: (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : `subtask-${Date.now()}-${Math.random()}`,
    title: '',
    status: 'pending'
  });

  const handleAddSubtask = () => {
    setFormData({
      ...formData,
      subtasks: [...formData.subtasks, createSubtask()]
    });
  };

  const handleUpdateSubtask = (id: string, updates: Partial<Subtask>) => {
    setFormData({
      ...formData,
      subtasks: formData.subtasks.map(subtask =>
        subtask.id === id ? { ...subtask, ...updates } : subtask
      )
    });
  };

  const handleRemoveSubtask = (id: string) => {
    setFormData({
      ...formData,
      subtasks: formData.subtasks.filter(subtask => subtask.id !== id)
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedSubtasks = formData.subtasks.filter(st => st.title.trim() !== '');
    const subtaskProgress = cleanedSubtasks.length
      ? Math.round((cleanedSubtasks.filter(st => st.status === 'completed').length / cleanedSubtasks.length) * 100)
      : formData.progress;
    
    onSave({
      title: formData.title,
      description: formData.description,
      status: formData.status,
      priority: formData.priority,
      phase: formData.phase,
      week: formData.week,
      startDate: new Date(formData.startDate),
      endDate: new Date(formData.endDate),
      estimatedHours: formData.estimatedHours,
      actualHours: formData.actualHours,
      assignedTo: formData.assignedTo,
      dependencies: formData.dependencies,
      tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
      progress: subtaskProgress,
      subtasks: cleanedSubtasks,
      blockedReason: formData.blockedReason || undefined,
      createdBy: task?.createdBy || '',
      completedAt: formData.status === 'completed' ? new Date() : undefined
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-epcentra-navy">
            {task ? 'Edit Task' : 'Create New Task'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="input"
              placeholder="Enter task title"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input"
              rows={4}
              placeholder="Enter task description"
            />
          </div>

          {/* Row 1: Status, Priority, Phase */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status *
              </label>
              <select
                required
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as TaskStatus })}
                className="select"
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority *
              </label>
              <select
                required
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as TaskPriority })}
                className="select"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Week *
              </label>
              <input
                type="number"
                required
                min="1"
                max="44"
                value={formData.week}
                onChange={(e) => setFormData({ ...formData, week: parseInt(e.target.value) })}
                className="input"
              />
            </div>
          </div>

          {/* Phase */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phase *
            </label>
            <select
              required
              value={formData.phase}
              onChange={(e) => setFormData({ ...formData, phase: e.target.value as Phase })}
              className="select"
            >
              {phases.map(phase => (
                <option key={phase} value={phase}>{phase}</option>
              ))}
            </select>
          </div>

          {/* Row 2: Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date *
              </label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date *
              </label>
              <input
                type="date"
                required
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="input"
              />
            </div>
          </div>

          {/* Row 3: Hours */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estimated Hours *
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.5"
                value={formData.estimatedHours}
                onChange={(e) => setFormData({ ...formData, estimatedHours: parseFloat(e.target.value) })}
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Actual Hours
              </label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={formData.actualHours}
                onChange={(e) => setFormData({ ...formData, actualHours: parseFloat(e.target.value) })}
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Progress (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.progress}
                onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) })}
                className="input"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="input"
              placeholder="backend, api, database"
            />
          </div>

          {/* Subtasks */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-medium text-gray-700">Subtasks</p>
                <p className="text-xs text-gray-500">Split this task into smaller steps</p>
              </div>
              <button
                type="button"
                onClick={handleAddSubtask}
                className="px-3 py-1 bg-epcentra-lightTeal text-white rounded hover:bg-epcentra-teal transition-colors"
              >
                Add subtask
              </button>
            </div>

            {formData.subtasks.length === 0 && (
              <p className="text-sm text-gray-500">No subtasks added yet.</p>
            )}

            <div className="space-y-3">
              {formData.subtasks.map((subtask) => (
                <div key={subtask.id} className="grid grid-cols-12 gap-2 items-center">
                  <input
                    type="text"
                    placeholder="Subtask title"
                    value={subtask.title}
                    onChange={(e) => handleUpdateSubtask(subtask.id, { title: e.target.value })}
                    className="input col-span-7"
                  />
                  <select
                    value={subtask.status}
                    onChange={(e) => handleUpdateSubtask(subtask.id, { status: e.target.value as TaskStatus })}
                    className="select col-span-3"
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="blocked">Blocked</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => handleRemoveSubtask(subtask.id)}
                    className="text-red-500 text-sm col-span-2 hover:text-red-600"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Blocked Reason (only if status is blocked) */}
          {formData.status === 'blocked' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Blocked Reason *
              </label>
              <textarea
                required
                value={formData.blockedReason}
                onChange={(e) => setFormData({ ...formData, blockedReason: e.target.value })}
                className="input"
                rows={2}
                placeholder="Explain why this task is blocked"
              />
            </div>
          )}

          {/* Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
            >
              {task ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;

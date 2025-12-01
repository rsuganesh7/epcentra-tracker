import React from 'react';
import { Task } from '../types';
import { Calendar, User, Clock, Flag } from 'lucide-react';
import { format } from 'date-fns';

interface TaskCardProps {
  task: Task;
  onClick: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onClick }) => {
  const subtaskTotal = task.subtasks?.length || 0;
  const completedSubtasks = task.subtasks?.filter(st => st.status === 'completed').length || 0;
  const subtaskProgress = subtaskTotal ? Math.round((completedSubtasks / subtaskTotal) * 100) : 0;

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div
      onClick={onClick}
      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
    >
      {/* Title */}
      <h4 className="font-semibold text-gray-800 mb-2 line-clamp-2">{task.title}</h4>

      {/* Description */}
      {task.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{task.description}</p>
      )}

      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {task.tags.slice(0, 2).map(tag => (
            <span key={tag} className="text-xs px-2 py-1 bg-epcentra-lightGray text-epcentra-navy rounded">
              {tag}
            </span>
          ))}
          {task.tags.length > 2 && (
            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
              +{task.tags.length - 2}
            </span>
          )}
        </div>
      )}

      {/* Subtasks */}
      {subtaskTotal > 0 && (
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
            <span>Subtasks</span>
            <span>{completedSubtasks}/{subtaskTotal} done</span>
          </div>
          <div className="bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-epcentra-teal h-1.5 rounded-full"
              style={{ width: `${subtaskProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Meta information */}
      <div className="space-y-2 text-xs text-gray-500">
        {/* Priority */}
        <div className="flex items-center space-x-1">
          <Flag size={14} />
          <span className={`px-2 py-0.5 rounded ${getPriorityColor(task.priority)}`}>
            {task.priority}
          </span>
        </div>

        {/* Due Date */}
        {task.endDate && (
          <div className="flex items-center space-x-1">
            <Calendar size={14} />
            <span>Due: {format(task.endDate, 'MMM dd')}</span>
          </div>
        )}

        {/* Assigned Users */}
        {task.assignedTo && task.assignedTo.length > 0 && (
          <div className="flex items-center space-x-1">
            <User size={14} />
            <span>{task.assignedTo.length} assigned</span>
          </div>
        )}

        {/* Progress */}
        {task.progress > 0 && (
          <div className="flex items-center space-x-2">
            <Clock size={14} />
            <div className="flex-1 bg-gray-200 rounded-full h-1.5">
              <div
                className="bg-epcentra-teal h-1.5 rounded-full"
                style={{ width: `${task.progress}%` }}
              />
            </div>
            <span>{task.progress}%</span>
          </div>
        )}
      </div>

      {/* Week indicator */}
      {task.week && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <span className="text-xs text-gray-500">Week {task.week}</span>
        </div>
      )}
    </div>
  );
};

export default TaskCard;

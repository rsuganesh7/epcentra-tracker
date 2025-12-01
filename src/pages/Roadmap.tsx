import React, { useMemo } from 'react';
import { useTasks } from '../hooks/useTasks';
import { Phase } from '../types';
import { Calendar, Clock, TrendingUp } from 'lucide-react';

const Roadmap: React.FC = () => {
  const { tasks, loading } = useTasks();

  const phases: Phase[] = [
    'Phase 1: Foundation & DMS',
    'Phase 2: Template Engine',
    'Phase 3: Formula Engine',
    'Phase 4: Master Data & Projects',
    'Phase 5: Core Modules',
    'Phase 6: EPCC Modules',
    'Phase 7: Advanced Features'
  ];

  const phaseWeeks = {
    'Phase 1: Foundation & DMS': '1-6',
    'Phase 2: Template Engine': '7-10',
    'Phase 3: Formula Engine': '11-14',
    'Phase 4: Master Data & Projects': '15-18',
    'Phase 5: Core Modules': '19-28',
    'Phase 6: EPCC Modules': '29-38',
    'Phase 7: Advanced Features': '39-44'
  };

  const phaseData = useMemo(() => {
    return phases.map(phase => {
      const phaseTasks = tasks.filter(t => t.phase === phase);
      const completed = phaseTasks.filter(t => t.status === 'completed').length;
      const inProgress = phaseTasks.filter(t => t.status === 'in-progress').length;
      const total = phaseTasks.length;
      const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

      return {
        phase,
        weeks: phaseWeeks[phase],
        total,
        completed,
        inProgress,
        progress,
        tasks: phaseTasks
      };
    });
  }, [tasks]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl text-gray-600">Loading roadmap...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-epcentra-navy">Development Roadmap</h1>
        <p className="text-gray-600 mt-1">44-week EPCENTRA implementation timeline</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center space-x-3">
            <Calendar className="text-epcentra-teal" size={32} />
            <div>
              <p className="text-sm text-gray-600">Total Duration</p>
              <p className="text-2xl font-bold text-epcentra-navy">44 Weeks</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3">
            <TrendingUp className="text-epcentra-gold" size={32} />
            <div>
              <p className="text-sm text-gray-600">Total Phases</p>
              <p className="text-2xl font-bold text-epcentra-navy">7 Phases</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3">
            <Clock className="text-green-600" size={32} />
            <div>
              <p className="text-sm text-gray-600">Overall Progress</p>
              <p className="text-2xl font-bold text-green-600">
                {Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-6">
        {phaseData.map((phase, index) => (
          <div key={phase.phase} className="card">
            {/* Phase Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-epcentra-navy text-white flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-epcentra-navy">{phase.phase}</h3>
                    <p className="text-sm text-gray-600">Weeks {phase.weeks}</p>
                  </div>
                </div>
              </div>

              {/* Phase Stats */}
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{phase.completed}</p>
                  <p className="text-xs text-gray-600">Completed</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{phase.inProgress}</p>
                  <p className="text-xs text-gray-600">In Progress</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-epcentra-navy">{phase.total}</p>
                  <p className="text-xs text-gray-600">Total</p>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Progress</span>
                <span className="text-sm font-medium text-epcentra-teal">{phase.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-epcentra-teal h-3 rounded-full transition-all duration-300"
                  style={{ width: `${phase.progress}%` }}
                />
              </div>
            </div>

            {/* Tasks List (collapsed by default, showing count) */}
            {phase.tasks.length > 0 && (
              <div className="border-t pt-4">
                <details className="group">
                  <summary className="cursor-pointer font-medium text-gray-700 hover:text-epcentra-navy">
                    View {phase.total} tasks →
                  </summary>
                  <div className="mt-4 space-y-2">
                    {phase.tasks.map(task => (
                      <div
                        key={task.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-gray-800">{task.title}</p>
                          <p className="text-sm text-gray-600">Week {task.week}</p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`badge badge-${task.status}`}>
                            {task.status}
                          </span>
                          {task.progress > 0 && (
                            <span className="text-sm text-gray-600">{task.progress}%</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </details>
              </div>
            )}

            {phase.tasks.length === 0 && (
              <p className="text-gray-400 text-center py-4 border-t">No tasks created for this phase yet</p>
            )}
          </div>
        ))}
      </div>

      {/* Milestones */}
      <div className="card">
        <h3 className="text-xl font-bold text-epcentra-navy mb-4">Key Milestones</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
            <div className="w-3 h-3 rounded-full bg-green-600" />
            <div className="flex-1">
              <p className="font-medium text-gray-800">Week 6: DMS Module Complete</p>
              <p className="text-sm text-gray-600">Foundation with working document management</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
            <div className="w-3 h-3 rounded-full bg-blue-600" />
            <div className="flex-1">
              <p className="font-medium text-gray-800">Week 14: Template + Formula Engines Complete</p>
              <p className="text-sm text-gray-600">Core differentiators operational</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
            <div className="w-3 h-3 rounded-full bg-purple-600" />
            <div className="flex-1">
              <p className="font-medium text-gray-800">Week 28: Core Modules Complete</p>
              <p className="text-sm text-gray-600">Procurement, Store, Planning operational</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
            <div className="w-3 h-3 rounded-full bg-yellow-600" />
            <div className="flex-1">
              <p className="font-medium text-gray-800">Week 38: EPCC Modules Complete</p>
              <p className="text-sm text-gray-600">All EPCC-specific features ready</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-3 bg-gold-50 rounded-lg">
            <div className="w-3 h-3 rounded-full bg-epcentra-gold" />
            <div className="flex-1">
              <p className="font-medium text-gray-800">Week 44: Production Launch 🚀</p>
              <p className="text-sm text-gray-600">EPCENTRA goes live!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Roadmap;

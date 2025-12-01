import React, { useMemo, useState, useEffect } from 'react';
import { useTasks } from '../hooks/useTasks';
import { RoadmapPhaseSimple, RoadmapMilestoneSimple } from '../types';
import { Calendar, Clock, TrendingUp, Plus, Flag } from 'lucide-react';
import { api } from '../lib/apiClient';
import { useOrganization } from '../contexts/OrganizationContext';

const Roadmap: React.FC = () => {
  const { tasks, loading: tasksLoading } = useTasks();
  const { currentOrganization } = useOrganization();
  const [phases, setPhases] = useState<RoadmapPhaseSimple[]>([]);
  const [milestones, setMilestones] = useState<RoadmapMilestoneSimple[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newPhase, setNewPhase] = useState<{ name: string; startWeek?: number; endWeek?: number }>({ name: '' });
  const [newMilestone, setNewMilestone] = useState<{ title: string; week?: number; phaseId?: string }>({ title: '' });

  const orgId = currentOrganization?.id;

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [{ phases: p }, { milestones: m }] = await Promise.all([
        api.roadmap.listPhases(orgId),
        api.roadmap.listMilestones(orgId),
      ]);
      setPhases(
        p.map((item: any) => ({
          id: item.id,
          name: item.name,
          description: item.description,
          startWeek: item.startWeek ?? item.start_week,
          endWeek: item.endWeek ?? item.end_week,
          orderIndex: item.orderIndex ?? item.order_index,
        }))
      );
      setMilestones(
        m.map((item: any) => ({
          id: item.id,
          title: item.title,
          description: item.description,
          week: item.week,
          phaseId: item.phaseId ?? item.phase_id,
        }))
      );
    } catch (err: any) {
      setError(err.message || 'Failed to load roadmap');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId]);

  const phaseData = useMemo(() => {
    return phases
      .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0))
      .map((phase) => {
        const phaseTasks = tasks.filter(t => t.phase === phase.name);
        const completed = phaseTasks.filter(t => t.status === 'completed').length;
        const inProgress = phaseTasks.filter(t => t.status === 'in-progress').length;
        const total = phaseTasks.length;
        const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
        const weeks = phase.startWeek && phase.endWeek ? `${phase.startWeek}-${phase.endWeek}` : '—';
        const phaseMilestones = milestones.filter(m => m.phaseId === phase.id || !m.phaseId);

        return {
          phase,
          weeks,
          total,
          completed,
          inProgress,
          progress,
          tasks: phaseTasks,
          milestones: phaseMilestones,
        };
      });
  }, [phases, tasks, milestones]);

  const overallProgress = useMemo(() => {
    if (tasks.length === 0) return 0;
    const done = tasks.filter(t => t.status === 'completed').length;
    return Math.round((done / tasks.length) * 100);
  }, [tasks]);

  const handleAddPhase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhase.name) return;
    try {
      await api.roadmap.createPhase({
        ...newPhase,
        organizationId: orgId,
      });
      setNewPhase({ name: '' });
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to add phase');
    }
  };

  const handleAddMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMilestone.title) return;
    try {
      await api.roadmap.createMilestone({
        ...newMilestone,
        organizationId: orgId,
      });
      setNewMilestone({ title: '' });
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to add milestone');
    }
  };

  if (!orgId) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h2 className="text-yellow-800 font-semibold mb-2">Select an organization</h2>
          <p className="text-yellow-700">Choose or create an organization to configure the roadmap.</p>
        </div>
      </div>
    );
  }

  if (loading || tasksLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl text-gray-600">Loading roadmap...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-red-800 font-semibold mb-2">Error</h2>
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-epcentra-navy">Development Roadmap</h1>
        <p className="text-gray-600 mt-1">Configure phases and milestones directly from the app.</p>
      </div>

      {/* Quick add */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <form onSubmit={handleAddPhase} className="card space-y-3">
          <div className="flex items-center space-x-2 text-epcentra-navy">
            <Plus size={18} />
            <span className="font-semibold">Add Phase</span>
          </div>
          <input
            type="text"
            required
            value={newPhase.name}
            onChange={(e) => setNewPhase({ ...newPhase, name: e.target.value })}
            className="input"
            placeholder="Phase name"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              value={newPhase.startWeek || ''}
              onChange={(e) => setNewPhase({ ...newPhase, startWeek: e.target.value ? Number(e.target.value) : undefined })}
              className="input"
              placeholder="Start week"
              min={1}
            />
            <input
              type="number"
              value={newPhase.endWeek || ''}
              onChange={(e) => setNewPhase({ ...newPhase, endWeek: e.target.value ? Number(e.target.value) : undefined })}
              className="input"
              placeholder="End week"
              min={1}
            />
          </div>
          <button type="submit" className="btn-primary w-full" disabled={!newPhase.name}>
            Add Phase
          </button>
        </form>

        <form onSubmit={handleAddMilestone} className="card space-y-3">
          <div className="flex items-center space-x-2 text-epcentra-navy">
            <Flag size={18} />
            <span className="font-semibold">Add Milestone</span>
          </div>
          <input
            type="text"
            required
            value={newMilestone.title}
            onChange={(e) => setNewMilestone({ ...newMilestone, title: e.target.value })}
            className="input"
            placeholder="Milestone title"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              value={newMilestone.week || ''}
              onChange={(e) => setNewMilestone({ ...newMilestone, week: e.target.value ? Number(e.target.value) : undefined })}
              className="input"
              placeholder="Week"
              min={1}
            />
            <select
              value={newMilestone.phaseId || ''}
              onChange={(e) => setNewMilestone({ ...newMilestone, phaseId: e.target.value || undefined })}
              className="select"
            >
              <option value="">No phase</option>
              {phases.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="btn-secondary w-full" disabled={!newMilestone.title}>
            Add Milestone
          </button>
        </form>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center space-x-3">
            <Calendar className="text-epcentra-teal" size={32} />
            <div>
              <p className="text-sm text-gray-600">Total Duration</p>
              <p className="text-2xl font-bold text-epcentra-navy">
                {Math.max(...phases.map(p => p.endWeek || 0), 0) || '—'} Weeks
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3">
            <TrendingUp className="text-epcentra-gold" size={32} />
            <div>
              <p className="text-sm text-gray-600">Total Phases</p>
              <p className="text-2xl font-bold text-epcentra-navy">{phases.length} Phases</p>
            </div>
          </div>
        </div>

        <div className="card">
            <div className="flex items-center space-x-3">
              <Clock className="text-green-600" size={32} />
              <div>
                <p className="text-sm text-gray-600">Overall Progress</p>
                <p className="text-2xl font-bold text-green-600">
                  {overallProgress}%
                </p>
              </div>
            </div>
          </div>
        </div>

      {/* Timeline */}
      <div className="space-y-6">
        {phaseData.map((phase, index) => (
          <div key={phase.phase.id} className="card">
            {/* Phase Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-epcentra-navy text-white flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-epcentra-navy">{phase.phase.name}</h3>
                    <p className="text-sm text-gray-600">Weeks {phase.weeks}</p>
                    {phase.phase.description && (
                      <p className="text-xs text-gray-500">{phase.phase.description}</p>
                    )}
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
                          {task.week && <p className="text-sm text-gray-600">Week {task.week}</p>}
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

            {/* Milestones for this phase */}
            {phase.milestones.length > 0 && (
              <div className="mt-4 border-t pt-4 space-y-2">
                <h4 className="text-sm font-semibold text-epcentra-navy flex items-center space-x-2">
                  <Flag size={16} /> <span>Milestones</span>
                </h4>
                {phase.milestones.map(m => (
                  <div key={m.id} className="flex items-center justify-between bg-blue-50 p-2 rounded">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{m.title}</p>
                      {m.description && <p className="text-xs text-gray-600">{m.description}</p>}
                    </div>
                    {m.week && <span className="text-xs text-blue-700">Week {m.week}</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Roadmap;

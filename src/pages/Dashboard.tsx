import React, { useMemo } from 'react';
import { CheckCircle, Clock, AlertCircle, TrendingUp } from 'lucide-react';
import { useTasks, useActivities } from '../hooks/useTasks';
import { Phase } from '../types';
import { format } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import TaskSeeder from '../components/TaskSeeder';

const Dashboard: React.FC = () => {
  const { tasks, loading, error } = useTasks();
  const { activities } = useActivities(10);

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-red-800 font-semibold mb-2">Error Loading Dashboard</h2>
          <p className="text-red-700">{error}</p>
          <p className="text-red-600 text-sm mt-2">
            Please check:
            <ul className="list-disc ml-5 mt-1">
              <li>You are logged in</li>
              <li>Firestore security rules are deployed</li>
              <li>Your internet connection</li>
            </ul>
          </p>
        </div>
      </div>
    );
  }

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.statusId === 'completed').length;
    const inProgress = tasks.filter(t => t.statusId === 'in-progress').length;
    const blocked = tasks.filter(t => t.statusId === 'blocked').length;
    const pending = tasks.filter(t => t.statusId === 'pending').length;

    const totalHours = tasks.reduce((sum, t) => sum + (t.actualHours || 0), 0);
    const estimatedHours = tasks.reduce((sum, t) => sum + t.estimatedHours, 0);

    // Phase progress
    const phases: Phase[] = [
      'Phase 1: Foundation & DMS',
      'Phase 2: Template Engine',
      'Phase 3: Formula Engine',
      'Phase 4: Master Data & Projects',
      'Phase 5: Core Modules',
      'Phase 6: EPCC Modules',
      'Phase 7: Advanced Features'
    ];

    const phaseProgress = phases.map(phase => {
      const phaseTasks = tasks.filter(t => t.phase === phase);
      const phaseCompleted = phaseTasks.filter(t => t.statusId === 'completed').length;
      return {
        phase: phase.replace('Phase ', 'P'),
        progress: phaseTasks.length > 0 ? Math.round((phaseCompleted / phaseTasks.length) * 100) : 0,
        total: phaseTasks.length,
        completed: phaseCompleted
      };
    });

    return {
      total,
      completed,
      inProgress,
      blocked,
      pending,
      totalHours,
      estimatedHours,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      phaseProgress
    };
  }, [tasks]);

  const statusData = [
    { name: 'Completed', value: stats.completed, color: '#10b981' },
    { name: 'In Progress', value: stats.inProgress, color: '#3b82f6' },
    { name: 'Pending', value: stats.pending, color: '#f59e0b' },
    { name: 'Blocked', value: stats.blocked, color: '#ef4444' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-epcentra-navy">EPCENTRA Development Dashboard</h1>
        <p className="text-gray-600 mt-1">44-week implementation tracking</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Tasks</p>
              <p className="text-3xl font-bold text-epcentra-navy mt-1">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <CheckCircle className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completion Rate</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{stats.completionRate}%</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">In Progress</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">{stats.inProgress}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Clock className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Blocked</p>
              <p className="text-3xl font-bold text-red-600 mt-1">{stats.blocked}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertCircle className="text-red-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
  <TaskSeeder />
</div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Phase Progress */}
        <div className="card">
          <h3 className="text-lg font-semibold text-epcentra-navy mb-4">Phase Progress</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.phaseProgress}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="phase" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="progress" fill="#2A8B8B" name="Progress %" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Status Distribution */}
        <div className="card">
          <h3 className="text-lg font-semibold text-epcentra-navy mb-4">Task Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Hours Tracking */}
      <div className="card">
        <h3 className="text-lg font-semibold text-epcentra-navy mb-4">Hours Tracking</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600">Estimated Hours</p>
            <p className="text-2xl font-bold text-epcentra-navy">{stats.estimatedHours}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Actual Hours</p>
            <p className="text-2xl font-bold text-epcentra-teal">{stats.totalHours}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Variance</p>
            <p className={`text-2xl font-bold ${stats.totalHours > stats.estimatedHours ? 'text-red-600' : 'text-green-600'}`}>
              {stats.totalHours - stats.estimatedHours > 0 ? '+' : ''}{stats.totalHours - stats.estimatedHours}h
            </p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h3 className="text-lg font-semibold text-epcentra-navy mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {activities.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No recent activity</p>
          ) : (
            activities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="text-sm text-gray-800">{activity.description}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {format(activity.createdAt, 'MMM dd, yyyy HH:mm')}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

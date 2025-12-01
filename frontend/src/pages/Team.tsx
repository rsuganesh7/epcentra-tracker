import React, { useEffect, useState } from 'react';
import { useOrganization } from '../contexts/OrganizationContext';
import { api } from '../lib/apiClient';
import { TeamSummary } from '../types';
import { Users, Plus } from 'lucide-react';

const Team: React.FC = () => {
  const { currentOrganization } = useOrganization();
  const [teams, setTeams] = useState<TeamSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newTeam, setNewTeam] = useState<{ name: string; category?: string; memberCount?: number }>({ name: '' });

  const orgId = currentOrganization?.id;

  const fetchTeams = async () => {
    try {
      setLoading(true);
      setError(null);
      const { teams } = await api.teams.list(orgId);
      setTeams(
        teams.map((t: any) => ({
          id: t.id,
          name: t.name,
          category: t.category,
          description: t.description,
          memberCount: t.memberCount ?? t.member_count ?? 0,
        }))
      );
    } catch (err: any) {
      setError(err.message || 'Failed to load teams');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId]);

  const handleAddTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeam.name) return;
    try {
      await api.teams.create({
        ...newTeam,
        organizationId: orgId,
      });
      setNewTeam({ name: '' });
      fetchTeams();
    } catch (err: any) {
      setError(err.message || 'Failed to create team');
    }
  };

  if (!orgId) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h2 className="text-yellow-800 font-semibold mb-2">Select an organization</h2>
          <p className="text-yellow-700">Choose or create an organization to manage teams.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-epcentra-navy">Team Structure</h1>
        <p className="text-gray-600 mt-1">Add and track teams directly from the app.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded p-3 text-red-700">{error}</div>
      )}

      {/* Add team */}
      <form onSubmit={handleAddTeam} className="card grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
        <div className="md:col-span-2">
          <label className="text-sm text-gray-700">Team Name</label>
          <input
            type="text"
            className="input"
            value={newTeam.name}
            onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
            required
            placeholder="e.g., Backend, QA, DevOps"
          />
        </div>
        <div>
          <label className="text-sm text-gray-700">Category</label>
          <input
            type="text"
            className="input"
            value={newTeam.category || ''}
            onChange={(e) => setNewTeam({ ...newTeam, category: e.target.value })}
            placeholder="Discipline or tribe"
          />
        </div>
        <div>
          <label className="text-sm text-gray-700">Member Count</label>
          <input
            type="number"
            min={0}
            className="input"
            value={newTeam.memberCount || ''}
            onChange={(e) => setNewTeam({ ...newTeam, memberCount: e.target.value ? Number(e.target.value) : undefined })}
            placeholder="0"
          />
        </div>
        <button type="submit" className="btn-primary md:col-span-4 flex items-center justify-center gap-2" disabled={!newTeam.name}>
          <Plus size={18} /> Add Team
        </button>
      </form>

      {/* Team cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full text-center text-gray-600">Loading teams...</div>
        ) : teams.length === 0 ? (
          <div className="col-span-full text-center text-gray-500">No teams created yet.</div>
        ) : (
          teams.map((team) => (
            <div key={team.id} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{team.category || 'Team'}</p>
                  <h3 className="text-xl font-semibold text-epcentra-navy">{team.name}</h3>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="text-epcentra-teal" size={18} />
                  <span className="text-lg font-bold text-epcentra-navy">{team.memberCount}</span>
                </div>
              </div>
              {team.description && <p className="text-sm text-gray-600 mt-2">{team.description}</p>}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Team;

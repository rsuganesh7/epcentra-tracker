import React, { useState } from 'react';
import { initializeOrganization } from '../lib/initOrganization';
import { useAuth } from '../contexts/AuthContext';
import { Building2 } from 'lucide-react';

const OrganizationSetup: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const { currentUser } = useAuth();
  const [orgName, setOrgName] = useState('');
  const [orgSlug, setOrgSlug] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      setError('You must be logged in');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      await initializeOrganization(orgName, orgSlug);
      setSuccess(true);
      setTimeout(() => {
        onComplete();
      }, 2000);
    } catch (err: any) {
      console.error('Error creating organization:', err);
      setError(err.message || 'Failed to create organization');
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleNameChange = (name: string) => {
    setOrgName(name);
    if (!orgSlug || generateSlug(orgName) === orgSlug) {
      setOrgSlug(generateSlug(name));
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-epcentra-navy to-epcentra-darkNavy flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-8 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-epcentra-navy mb-2">
            Organization Created!
          </h2>
          <p className="text-gray-600">
            Redirecting to your dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-epcentra-navy to-epcentra-darkNavy flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-epcentra-teal rounded-full mb-4">
            <Building2 size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-epcentra-navy mb-2">
            Welcome to EPCENTRA!
          </h1>
          <p className="text-gray-600">
            Let's set up your first organization
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Organization Name
            </label>
            <input
              type="text"
              required
              value={orgName}
              onChange={(e) => handleNameChange(e.target.value)}
              className="input"
              placeholder="e.g., EPCENTRA, My Company"
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">
              This will be displayed across the app
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Organization Slug
            </label>
            <input
              type="text"
              required
              value={orgSlug}
              onChange={(e) => setOrgSlug(e.target.value)}
              className="input font-mono"
              placeholder="e.g., epcentra, my-company"
              pattern="[a-z0-9-]+"
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">
              Used in URLs (lowercase, numbers, and hyphens only)
            </p>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading || !orgName || !orgSlug}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating organization...
                </span>
              ) : (
                'Create Organization'
              )}
            </button>
          </div>
        </form>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">
            What happens next?
          </h3>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>✓ Organization with default settings</li>
            <li>✓ Default workflow (To Do → In Progress → Review → Done)</li>
            <li>✓ Priority levels (Lowest to Urgent)</li>
            <li>✓ Common labels (Bug, Feature, etc.)</li>
            <li>✓ Your first project</li>
            <li>✓ You as the organization owner</li>
          </ul>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-gray-500">
          <p>You can customize everything later in settings</p>
        </div>
      </div>
    </div>
  );
};

export default OrganizationSetup;

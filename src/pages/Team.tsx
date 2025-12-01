import React from 'react';

const Team: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-epcentra-navy">Team Members</h1>
        <p className="text-gray-600 mt-1">EPCENTRA development team</p>
      </div>

      {/* Team Info */}
      <div className="card">
        <h3 className="text-lg font-semibold text-epcentra-navy mb-4">Team Structure</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600">Backend Developers</p>
            <p className="text-2xl font-bold text-blue-600">3</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-600">Frontend Developers</p>
            <p className="text-2xl font-bold text-green-600">2</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <p className="text-sm text-gray-600">DevOps Engineers</p>
            <p className="text-2xl font-bold text-purple-600">1</p>
          </div>
          <div className="p-4 bg-orange-50 rounded-lg">
            <p className="text-sm text-gray-600">QA Engineers</p>
            <p className="text-2xl font-bold text-orange-600">1</p>
          </div>
          <div className="p-4 bg-pink-50 rounded-lg">
            <p className="text-sm text-gray-600">Tech Lead</p>
            <p className="text-2xl font-bold text-pink-600">1</p>
          </div>
          <div className="p-4 bg-yellow-50 rounded-lg">
            <p className="text-sm text-gray-600">Product Owner</p>
            <p className="text-2xl font-bold text-yellow-600">1</p>
          </div>
        </div>
      </div>

      {/* Placeholder for user list */}
      <div className="card">
        <h3 className="text-lg font-semibold text-epcentra-navy mb-4">All Members</h3>
        <p className="text-gray-500 text-center py-8">
          User list will appear here when team members sign up
        </p>
      </div>
    </div>
  );
};

export default Team;

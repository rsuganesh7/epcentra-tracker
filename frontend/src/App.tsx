import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { OrganizationProvider, useOrganization } from './contexts/OrganizationContext';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Roadmap from './pages/Roadmap';
import Team from './pages/Team';
import Login from './pages/Login';
import OrganizationSetup from './components/OrganizationSetup';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  return currentUser ? <>{children}</> : <Navigate to="/login" />;
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
};

const AppContent: React.FC = () => {
  const { currentOrganization, loading } = useOrganization();
  const { currentUser } = useAuth();

  // Show loading while checking for organization
  if (loading && currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-xl text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  // If user is logged in but has no organization, show setup
  if (currentUser && !currentOrganization && !loading) {
    return <OrganizationSetup onComplete={() => window.location.reload()} />;
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/tasks"
        element={
          <PrivateRoute>
            <Layout>
              <Tasks />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/roadmap"
        element={
          <PrivateRoute>
            <Layout>
              <Roadmap />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/team"
        element={
          <PrivateRoute>
            <Layout>
              <Team />
            </Layout>
          </PrivateRoute>
        }
      />
    </Routes>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <OrganizationProvider>
          <AppContent />
        </OrganizationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

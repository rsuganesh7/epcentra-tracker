import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Roadmap from './pages/Roadmap';
import Team from './pages/Team';
import Login from './pages/Login';

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

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
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
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

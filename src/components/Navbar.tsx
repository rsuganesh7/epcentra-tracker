import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, User, LayoutDashboard, ListTodo, Calendar, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Navbar: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  return (
    <nav className="bg-epcentra-navy text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="text-2xl font-bold">
              <span className="text-epcentra-gold">EPC</span>ENTRA
            </div>
            <span className="text-sm text-epcentra-teal">Development Tracker</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-6">
            <Link 
              to="/" 
              className="flex items-center space-x-1 hover:text-epcentra-teal transition-colors"
            >
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </Link>
            
            <Link 
              to="/tasks" 
              className="flex items-center space-x-1 hover:text-epcentra-teal transition-colors"
            >
              <ListTodo size={18} />
              <span>Tasks</span>
            </Link>
            
            <Link 
              to="/roadmap" 
              className="flex items-center space-x-1 hover:text-epcentra-teal transition-colors"
            >
              <Calendar size={18} />
              <span>Roadmap</span>
            </Link>
            
            <Link 
              to="/team" 
              className="flex items-center space-x-1 hover:text-epcentra-teal transition-colors"
            >
              <Users size={18} />
              <span>Team</span>
            </Link>

            {/* User Menu */}
            <div className="flex items-center space-x-4 ml-4 pl-4 border-l border-epcentra-teal">
              <div className="flex items-center space-x-2">
                <User size={18} />
                <span className="text-sm">{currentUser?.displayName}</span>
                <span className="text-xs text-epcentra-gold px-2 py-1 rounded-full bg-epcentra-darkNavy">
                  {currentUser?.role}
                </span>
              </div>
              
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 hover:text-red-400 transition-colors"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

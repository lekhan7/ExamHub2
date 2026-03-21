import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Users, Plus, Brain } from 'lucide-react';
import { buttonHover } from '../../animations/variants';
import UserProfileDropdown from './UserProfileDropdown';

const Navbar = () => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-surface border-b border-border sticky top-0 z-50 backdrop-blur-lg bg-surface/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <motion.div
              {...buttonHover}
              className="flex items-center space-x-2"
            >
              <Brain className="w-8 h-8 text-primary" />
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent-violet bg-clip-text text-transparent">
                Exam Hub
              </span>
            </motion.div>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-6">
            <Link
              to="/"
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                isActive('/') 
                  ? 'text-primary bg-primary/10' 
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface2'
              }`}
            >
              <Home className="w-4 h-4" />
              <span className="font-medium">Home</span>
            </Link>

            <Link
              to="/my-exams"
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                isActive('/my-exams') 
                  ? 'text-primary bg-primary/10' 
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface2'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span className="font-medium">My Exams</span>
            </Link>

            <motion.button
              {...buttonHover}
              className="flex items-center space-x-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-medium"
              onClick={() => {
                // Trigger create room modal
                window.dispatchEvent(new CustomEvent('openCreateRoomModal'));
              }}
            >
              <Plus className="w-4 h-4" />
              <span>Create Room</span>
            </motion.button>

            {/* User Profile Dropdown */}
            <UserProfileDropdown />
          </div>
        </div>
      </div>
    </nav>
  );
};

const Home = ({ size, className }) => (
  <svg 
    className={className} 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2"
  >
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
    <polyline points="9 22 9 12 15 12 15 22"></polyline>
  </svg>
);

export default Navbar;

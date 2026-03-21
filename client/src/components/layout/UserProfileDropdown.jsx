import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Settings, LogOut, ChevronDown } from 'lucide-react';
import { buttonHover } from '../../animations/variants';

const UserProfileDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Initialize user data if not present (matching the image)
  useEffect(() => {
    if (!localStorage.getItem('displayName')) {
      localStorage.setItem('displayName', 'Admin');
    }
    if (!localStorage.getItem('userEmail')) {
      localStorage.setItem('userEmail', 'admin@gmail.com');
    }
    if (!localStorage.getItem('userRole')) {
      localStorage.setItem('userRole', 'Administrator');
    }
  }, []);

  // Get user data from localStorage
  const displayName = localStorage.getItem('displayName') || 'Admin';
  const email = localStorage.getItem('userEmail') || 'admin@gmail.com';
  const role = localStorage.getItem('userRole') || 'Administrator';

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    // Clear user data from localStorage
    localStorage.removeItem('displayName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
    localStorage.removeItem('currentRoomId');
    localStorage.removeItem('myRooms');
    
    // Reload page to reset app state
    window.location.reload();
  };

  return (
    <div className="relative" ref={dropdownRef} style={{ position: 'relative' }}>
      {/* User Profile Button */}
      <motion.button
        {...buttonHover}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-surface2 transition-colors"
      >
        {/* User Avatar */}
        <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
          <User className="w-4 h-4 text-primary" />
        </div>
        
        {/* User Info - Hidden on mobile */}
        <div className="hidden sm:block text-left">
          <div className="text-sm font-medium text-text-primary">
            {displayName}
          </div>
          <div className="text-xs text-text-secondary">
            {role}
          </div>
        </div>
        
        {/* Dropdown Arrow */}
        <ChevronDown 
          className={`w-4 h-4 text-text-secondary transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-64 bg-surface border border-border rounded-lg shadow-xl z-[60] overflow-hidden"
            style={{ 
              position: 'absolute',
              top: '100%',
              right: '0',
              marginTop: '0.5rem'
            }}
          >
            {/* User Profile Header */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-text-primary truncate">
                    {displayName}
                  </div>
                  <div className="text-xs text-text-secondary truncate">
                    {email}
                  </div>
                  <div className="text-xs text-primary font-medium">
                    {role}
                  </div>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-2">
              {/* Settings */}
              <motion.button
                {...buttonHover}
                onClick={() => {
                  setIsOpen(false);
                  // TODO: Open settings modal or navigate to settings page
                  console.log('Settings clicked');
                }}
                className="w-full flex items-center space-x-3 px-4 py-2 text-text-primary hover:bg-surface2 transition-colors"
              >
                <Settings className="w-4 h-4 text-text-secondary" />
                <span className="text-sm">Settings</span>
              </motion.button>

              {/* Logout */}
              <motion.button
                {...buttonHover}
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-4 py-2 text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Logout</span>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserProfileDropdown;

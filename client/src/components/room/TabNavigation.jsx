import React from 'react';
import { motion } from 'framer-motion';
import { layoutAnimation } from '../../animations/variants';

const TabNavigation = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="bg-surface border-b border-border">
      <nav className="flex space-x-1 p-2" {...layoutAnimation}>
        {tabs.map((tab) => (
          <motion.button
            key={tab.id}
            layoutId="activeTab"
            onClick={() => onTabChange(tab.id)}
            className={`
              relative flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200
              ${activeTab === tab.id 
                ? 'bg-primary text-white' 
                : 'text-text-secondary hover:text-text-primary hover:bg-surface2'
              }
            `}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="text-lg">{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
            
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTabIndicator"
                className="absolute inset-0 bg-primary rounded-lg"
                initial={false}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
          </motion.button>
        ))}
      </nav>
    </div>
  );
};

export default TabNavigation;

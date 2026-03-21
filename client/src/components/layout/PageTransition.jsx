import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { pageTransition } from '../../animations/variants';

const PageTransition = ({ children }) => {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageTransition}
      className="min-h-[calc(100vh-4rem)]"
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;

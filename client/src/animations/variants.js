import { motion } from 'framer-motion';

// Page transition variants
export const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3, ease: 'easeInOut' }
};

// Staggered children animation
export const staggerContainer = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

export const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { type: 'spring', stiffness: 100, damping: 10 }
  }
};

// Modal animations
export const modalOverlay = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.2 }
};

export const modalContent = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { 
    scale: 1, 
    opacity: 1,
    transition: { 
      type: 'spring', 
      stiffness: 300, 
      damping: 25,
      duration: 0.3
    }
  },
  exit: { 
    scale: 0.8, 
    opacity: 0,
    transition: { duration: 0.2 }
  }
};

// Button hover animations
export const buttonHover = {
  whileHover: { scale: 1.05, transition: { duration: 0.2 } },
  whileTap: { scale: 0.95, transition: { duration: 0.1 } }
};

export const buttonScale = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.98 }
};

// Card animations
export const cardHover = {
  whileHover: { 
    y: -4,
    transition: { type: 'spring', stiffness: 400, damping: 10 }
  }
};

// Room card animations
export const roomCard = {
  initial: { opacity: 0, y: 30 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { 
      type: 'spring', 
      stiffness: 100, 
      damping: 15 
    }
  }
};

// Tab switching animations
export const tabContainer = {
  initial: { opacity: 0, x: 20 },
  animate: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.3, ease: 'easeInOut' }
  },
  exit: { 
    opacity: 0, 
    x: -20,
    transition: { duration: 0.3, ease: 'easeInOut' }
  }
};

// Toast notification animations
export const toastSlide = {
  initial: { x: 300, opacity: 0 },
  animate: { 
    x: 0, 
    opacity: 1,
    transition: { 
      type: 'spring', 
      stiffness: 300, 
      damping: 25 
    }
  },
  exit: { 
    x: 300, 
    opacity: 0,
    transition: { duration: 0.2 }
  }
};

// Member join/leave animations
export const memberSlide = {
  initial: { x: -20, opacity: 0 },
  animate: { 
    x: 0, 
    opacity: 1,
    transition: { duration: 0.3, ease: 'easeOut' }
  },
  exit: { 
    x: 20, 
    opacity: 0,
    transition: { duration: 0.2, ease: 'easeIn' }
  }
};

// Chat message animations
export const messageSlide = {
  initial: { y: 20, opacity: 0 },
  animate: { 
    y: 0, 
    opacity: 1,
    transition: { 
      type: 'spring', 
      stiffness: 500, 
      damping: 30 
    }
  }
};

// Hero section animations
export const heroFloat = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
};

export const heroStagger = {
  initial: { opacity: 0, y: 30 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      staggerChildren: 0.2,
      delayChildren: 0.3
    }
  }
};

// Pulse animation for live indicators
export const pulseDot = {
  animate: {
    scale: [1, 1.2, 1],
    opacity: [1, 0.7, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
};

// Floating particles animation
export const floatingParticle = {
  initial: { y: 0, opacity: 0 },
  animate: {
    y: [-100, 100],
    opacity: [0, 1, 0],
    transition: {
      duration: 10 + Math.random() * 10,
      repeat: Infinity,
      ease: 'linear',
      delay: Math.random() * 5
    }
  }
};

// Sidebar slide animation
export const sidebarSlide = {
  initial: { x: -280, opacity: 0 },
  animate: { 
    x: 0, 
    opacity: 1,
    transition: { 
      type: 'spring', 
      stiffness: 300, 
      damping: 30 
    }
  },
  exit: { 
    x: -280, 
    opacity: 0,
    transition: { duration: 0.3 }
  }
};

// Layout animation for shared elements
export const layoutAnimation = {
  layout: true,
  transition: { duration: 0.3, ease: 'easeInOut' }
};

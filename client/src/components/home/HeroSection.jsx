import React from 'react';
import { motion } from 'framer-motion';
import { ArrowDown, Plus, Users, Sparkles, Brain, Lock } from 'lucide-react';
import { buttonHover, heroFloat, heroStagger, floatingParticle } from '../../animations/variants';

const HeroSection = ({ onCreateRoom, onCreatePrivateRoom, onScrollToRooms }) => {
  // Generate floating particles for background
  const particles = Array.from({ length: 20 }, (_, i) => i);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated Background Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {particles.map((i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-primary/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            variants={floatingParticle}
            animate="animate"
          />
        ))}
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent-violet/5" />

      {/* Hero Content */}
      <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <motion.div
          variants={heroStagger}
          initial="initial"
          animate="animate"
          className="space-y-8"
        >
          {/* Floating Brain Icon */}
          <motion.div
            variants={heroFloat}
            animate="animate"
            className="flex justify-center mb-8"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
              <Brain className="w-24 h-24 text-primary relative" />
            </div>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            variants={{
              initial: { opacity: 0, y: 30 },
              animate: { opacity: 1, y: 0, transition: { delay: 0.2 } }
            }}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight"
          >
            <span className="bg-gradient-to-r from-primary via-accent-violet to-accent-cyan bg-clip-text text-transparent">
              Study Smarter.
            </span>
            <br />
            <span className="text-text-primary">Together.</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={{
              initial: { opacity: 0, y: 30 },
              animate: { opacity: 1, y: 0, transition: { delay: 0.3 } }
            }}
            className="text-xl sm:text-2xl text-text-secondary max-w-3xl mx-auto leading-relaxed"
          >
            Create a room. Share a PDF. Learn in real-time.
            <br />
            <span className="text-primary font-medium">
              The collaborative study platform for competitive exam aspirants.
            </span>
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={{
              initial: { opacity: 0, y: 30 },
              animate: { opacity: 1, y: 0, transition: { delay: 0.4 } }
            }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <motion.button
              {...buttonHover}
              onClick={onCreateRoom}
              className="group relative overflow-hidden bg-primary hover:bg-primary/90 text-white font-semibold py-4 px-8 rounded-xl text-lg shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="relative z-10 flex items-center space-x-2">
                <Plus className="w-5 h-5" />
                <span>Create a Study Room</span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-accent-violet to-accent-cyan opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </motion.button>

            <motion.button
              {...buttonHover}
              onClick={onCreatePrivateRoom}
              className="group relative overflow-hidden bg-surface hover:bg-surface2 text-text-primary font-semibold py-4 px-8 rounded-xl text-lg border-2 border-violet-500/50 hover:border-violet-500 transition-all duration-300"
            >
              <div className="relative z-10 flex items-center space-x-2">
                <Lock className="w-5 h-5 text-violet-400" />
                <span>Create Private Room</span>
              </div>
            </motion.button>

            <motion.button
              {...buttonHover}
              onClick={onScrollToRooms}
              className="flex items-center space-x-2 bg-surface hover:bg-surface2 text-text-primary font-semibold py-4 px-8 rounded-xl text-lg border border-border hover:border-primary/50 transition-all duration-300"
            >
              <Users className="w-5 h-5" />
              <span>Browse Public Rooms</span>
              <ArrowDown className="w-4 h-4 animate-bounce" />
            </motion.button>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            variants={{
              initial: { opacity: 0, y: 30 },
              animate: { opacity: 1, y: 0, transition: { delay: 0.5 } }
            }}
            className="flex flex-wrap justify-center items-center gap-8 text-text-secondary"
          >
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <span>Real-time Collaboration</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-primary" />
              <span>Live Study Groups</span>
            </div>
            <div className="flex items-center space-x-2">
              <Brain className="w-5 h-5 text-primary" />
              <span>Exam Focused</span>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: [0, 1, 0],
          y: [0, 10, 0]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          delay: 1
        }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <ArrowDown className="w-6 h-6 text-text-secondary" />
      </motion.div>
    </section>
  );
};

export default HeroSection;

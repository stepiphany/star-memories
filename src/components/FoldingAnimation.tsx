import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './FoldingAnimation.css';

interface FoldingAnimationProps {
  onComplete: () => void;
}

export function FoldingAnimation({ onComplete }: FoldingAnimationProps) {
  const [stage, setStage] = useState(0);
  const onCompleteRef = useRef(onComplete);
  
  // Keep the ref updated
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    
    const stages = [
      { delay: 0 },      // 0: Initial strip
      { delay: 1000 },   // 1: Forming loop
      { delay: 2000 },   // 2: Pentagon forms
      { delay: 3000 },   // 3: Wrapping
      { delay: 4000 },   // 4: Puffing
      { delay: 5000 },   // 5: Final star
    ];
    
    stages.forEach(({ delay }, index) => {
      const timer = setTimeout(() => setStage(index), delay);
      timers.push(timer);
    });

    const completeTimer = setTimeout(() => onCompleteRef.current(), 6000);
    timers.push(completeTimer);
    
    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, []); // Empty dependency array - only run once

  return (
    <div className="folding-container">
      <div className="folding-stage">
        <AnimatePresence mode="wait">
          
          {/* Stage 0: Paper strip */}
          {stage === 0 && (
            <motion.div
              key="strip"
              className="paper-strip-long"
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              exit={{ 
                scaleX: 0.3,
                rotate: 180,
                opacity: 0,
                transition: { duration: 0.8, ease: "easeInOut" }
              }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          )}

          {/* Stage 1: Loop forming */}
          {stage === 1 && (
            <motion.div
              key="loop"
              className="paper-loop-container"
              initial={{ opacity: 0, scale: 0.5, rotate: -180 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ 
                scale: 0.6,
                rotate: 72,
                opacity: 0,
                transition: { duration: 0.6, ease: "easeInOut" }
              }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="paper-loop" />
              <div className="paper-loop-tail" />
            </motion.div>
          )}

          {/* Stage 2: Pentagon knot */}
          {stage === 2 && (
            <motion.div
              key="pentagon"
              className="pentagon-stage"
              initial={{ opacity: 0, scale: 0.3, rotate: -72 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ 
                scale: 0.9,
                opacity: 0,
                transition: { duration: 0.5, ease: "easeInOut" }
              }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              <div className="pentagon-knot" />
              <motion.div 
                className="wrap-tail"
                initial={{ scaleX: 1, x: 0 }}
                animate={{ scaleX: 0, x: 20 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              />
            </motion.div>
          )}

          {/* Stage 3: Wrapped pentagon */}
          {stage === 3 && (
            <motion.div
              key="wrapped"
              className="pentagon-wrapped"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ 
                scale: 1.1,
                opacity: 0,
                transition: { duration: 0.4, ease: "easeIn" }
              }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <motion.div 
                className="pentagon-complete"
                animate={{ 
                  boxShadow: [
                    "inset 3px 3px 6px rgba(255,255,255,0.3), inset -2px -2px 4px rgba(0,0,0,0.1)",
                    "inset 5px 5px 10px rgba(255,255,255,0.4), inset -3px -3px 6px rgba(0,0,0,0.15)",
                    "inset 3px 3px 6px rgba(255,255,255,0.3), inset -2px -2px 4px rgba(0,0,0,0.1)",
                  ]
                }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            </motion.div>
          )}

          {/* Stage 4: Puffing into star */}
          {stage === 4 && (
            <motion.div
              key="puffing"
              className="puffing-container"
              initial={{ opacity: 1, scale: 1 }}
              animate={{ scale: [1, 0.85, 0.85, 1.05, 1] }}
              exit={{ opacity: 0, scale: 1.2, transition: { duration: 0.3 } }}
              transition={{ duration: 0.9, times: [0, 0.3, 0.5, 0.8, 1], ease: "easeInOut" }}
            >
              <motion.div 
                className="puff-shape"
                initial={{ clipPath: "polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)" }}
                animate={{ 
                  clipPath: "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)"
                }}
                transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
              />
            </motion.div>
          )}

          {/* Stage 5: Final star */}
          {stage === 5 && (
            <motion.div
              key="final"
              className="final-star-container"
              initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ 
                type: "spring",
                damping: 15,
                stiffness: 200,
              }}
            >
              <div className="final-star-3d">
                <div className="star-3d-shape" />
              </div>
              
              {/* Sparkles */}
              {[...Array(8)].map((_, i) => (
                <motion.span
                  key={i}
                  className="sparkle"
                  initial={{ scale: 0, opacity: 0, x: 0, y: 0 }}
                  animate={{ 
                    scale: [0, 1.2, 0],
                    opacity: [0, 1, 0],
                    x: Math.cos((i * 45 * Math.PI) / 180) * 55,
                    y: Math.sin((i * 45 * Math.PI) / 180) * 55,
                  }}
                  transition={{ 
                    duration: 0.6,
                    delay: 0.3 + i * 0.05,
                    ease: "easeOut"
                  }}
                >
                  ✦
                </motion.span>
              ))}
            </motion.div>
          )}
          
        </AnimatePresence>
      </div>
      
      <motion.p
        className="folding-text"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        key={stage}
      >
        <AnimatePresence mode="wait">
          <motion.span
            key={stage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {stage === 0 && 'Starting with a paper strip...'}
            {stage === 1 && 'Tying the knot...'}
            {stage === 2 && 'Forming the pentagon...'}
            {stage === 3 && 'Wrapping it tight...'}
            {stage === 4 && 'Puffing into a star...'}
            {stage === 5 && 'Your memory star is ready!'}
          </motion.span>
        </AnimatePresence>
      </motion.p>
      
      {stage < 5 && (
        <motion.button
          className="skip-button"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          onClick={() => onCompleteRef.current()}
        >
          Skip
        </motion.button>
      )}
    </div>
  );
}

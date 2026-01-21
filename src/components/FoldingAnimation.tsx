import { useEffect } from 'react';
import { motion } from 'framer-motion';
import './FoldingAnimation.css';

interface FoldingAnimationProps {
  onComplete: () => void;
}

export function FoldingAnimation({ onComplete }: FoldingAnimationProps) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="folding-container">
      <div className="folding-stage">
        {/* Paper that folds */}
        <motion.div
          className="folding-paper"
          initial={{ 
            rotateX: 0, 
            rotateY: 0, 
            rotateZ: 0,
            scale: 1,
            borderRadius: '4px'
          }}
          animate={{ 
            rotateX: [0, 45, 90, 180, 360],
            rotateY: [0, 45, 90, 180, 360],
            rotateZ: [0, 72, 144, 216, 288],
            scale: [1, 0.8, 0.6, 0.5, 0.4],
            borderRadius: ['4px', '20%', '40%', '50%', '50%']
          }}
          transition={{ 
            duration: 2,
            ease: 'easeInOut',
            times: [0, 0.25, 0.5, 0.75, 1]
          }}
        >
          <div className="paper-face front">
            <div className="paper-lines"></div>
          </div>
        </motion.div>

        {/* Star that appears */}
        <motion.div
          className="folded-star"
          initial={{ scale: 0, opacity: 0, rotate: 0 }}
          animate={{ 
            scale: [0, 0, 0, 1.2, 1],
            opacity: [0, 0, 0, 1, 1],
            rotate: [0, 0, 0, 20, 0]
          }}
          transition={{ 
            duration: 2.5,
            times: [0, 0.6, 0.7, 0.85, 1],
            ease: 'easeOut'
          }}
        >
          ★
        </motion.div>

        {/* Sparkles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="sparkle"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: [0, 1, 0],
              opacity: [0, 1, 0],
              x: Math.cos((i * 60 * Math.PI) / 180) * 80,
              y: Math.sin((i * 60 * Math.PI) / 180) * 80,
            }}
            transition={{ 
              duration: 0.6,
              delay: 1.8 + i * 0.05,
              ease: 'easeOut'
            }}
          >
            ✦
          </motion.div>
        ))}
      </div>
      
      <motion.p
        className="folding-text"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        Folding your memory into a star...
      </motion.p>
    </div>
  );
}

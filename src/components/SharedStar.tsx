import { motion } from 'framer-motion';
import type { MemoryStar } from '../types';
import { formatDate } from '../utils/storage';
import './SharedStar.css';

interface SharedStarProps {
  star: MemoryStar;
  onCreateOwn: () => void;
}

export function SharedStar({ star, onCreateOwn }: SharedStarProps) {
  return (
    <div className="shared-star-container">
      <motion.div
        className="shared-star-card"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="shared-star-icon"
          animate={{ 
            rotate: [0, 5, -5, 0],
            scale: [1, 1.05, 1]
          }}
          transition={{ 
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          ★
        </motion.div>
        
        <p className="shared-star-label">A memory was shared with you</p>
        <p className="shared-star-date">{formatDate(star.date)}</p>
        <p className="shared-star-content">{star.content}</p>
        
        <div className="shared-star-divider">✦</div>
        
        <p className="shared-star-cta">Start collecting your own memory stars</p>
        <button className="btn-create-own" onClick={onCreateOwn}>
          Create My Memory Jar
        </button>
      </motion.div>
      
      <div className="floating-stars">
        {[...Array(8)].map((_, i) => (
          <motion.span
            key={i}
            className="floating-star"
            style={{
              left: `${10 + (i * 12)}%`,
              top: `${20 + (i % 3) * 30}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.3,
            }}
          >
            ✦
          </motion.span>
        ))}
      </div>
    </div>
  );
}

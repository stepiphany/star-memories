import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { MemoryStar } from '../types';
import { formatDate } from '../utils/storage';
import './StarJar.css';

interface StarJarProps {
  stars: MemoryStar[];
  year: number;
  onAddStar: () => void;
  onViewRecap: () => void;
  hasStarToday: boolean;
}

export function StarJar({ stars, year, onAddStar, onViewRecap, hasStarToday }: StarJarProps) {
  const [selectedStar, setSelectedStar] = useState<MemoryStar | null>(null);
  const [sharingStarId, setSharingStarId] = useState<string | null>(null);

  // Generate consistent positions for stars
  const starPositions = useMemo(() => {
    return stars.map((star, index) => {
      // Use the star id to generate pseudo-random but consistent positions
      const seed = star.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const row = Math.floor(index / 5);
      const col = index % 5;
      
      return {
        x: 15 + (col * 15) + ((seed % 10) - 5),
        y: 85 - (row * 12) - ((seed % 8)),
        rotation: (seed % 40) - 20,
        scale: 0.8 + (seed % 30) / 100,
      };
    });
  }, [stars]);

  const handleShare = async (star: MemoryStar) => {
    const shareUrl = `${window.location.origin}?star=${star.id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'A Memory Star',
          text: `"${star.content}" - ${formatDate(star.date)}`,
          url: shareUrl,
        });
      } catch (e) {
        // User cancelled or error
        copyToClipboard(shareUrl, star.id);
      }
    } else {
      copyToClipboard(shareUrl, star.id);
    }
  };

  const copyToClipboard = (url: string, starId: string) => {
    navigator.clipboard.writeText(url);
    setSharingStarId(starId);
    setTimeout(() => setSharingStarId(null), 2000);
  };

  return (
    <div className="star-jar-container">
      <header className="jar-header">
        <h1>Memory Jar</h1>
        <p className="jar-year">{year}</p>
      </header>

      <div className="jar-wrapper">
        <div className="jar">
          <div className="jar-lid"></div>
          <div className="jar-body">
            <div className="jar-stars">
              {stars.map((star, index) => (
                <motion.button
                  key={star.id}
                  className="jar-star"
                  style={{
                    left: `${starPositions[index].x}%`,
                    bottom: `${starPositions[index].y}%`,
                    transform: `rotate(${starPositions[index].rotation}deg) scale(${starPositions[index].scale})`,
                  }}
                  initial={{ scale: 0, y: -100 }}
                  animate={{ scale: starPositions[index].scale, y: 0 }}
                  transition={{ 
                    type: 'spring',
                    delay: index * 0.02,
                    damping: 10
                  }}
                  whileHover={{ scale: starPositions[index].scale * 1.3 }}
                  onClick={() => setSelectedStar(star)}
                  title={formatDate(star.date)}
                >
                  ★
                </motion.button>
              ))}
            </div>
            
            {stars.length === 0 && (
              <div className="jar-empty">
                <p>Your jar is empty</p>
                <p className="jar-empty-hint">Add your first memory star!</p>
              </div>
            )}
          </div>
          <div className="jar-base"></div>
        </div>
      </div>

      <div className="jar-stats">
        <span className="star-count">
          {stars.length} {stars.length === 1 ? 'star' : 'stars'}
        </span>
        <span className="days-left">
          {365 - stars.length} days to go
        </span>
      </div>

      <div className="jar-actions">
        <button 
          className="btn-add-star"
          onClick={onAddStar}
          disabled={hasStarToday}
        >
          {hasStarToday ? "Today's star added ✓" : 'Add Today\'s Star ✦'}
        </button>
        
        {stars.length > 0 && (
          <button className="btn-recap" onClick={onViewRecap}>
            View Year Recap
          </button>
        )}
      </div>

      {/* Star detail modal */}
      <AnimatePresence>
        {selectedStar && (
          <motion.div
            className="star-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedStar(null)}
          >
            <motion.div
              className="star-modal"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="star-modal-star">★</div>
              <p className="star-modal-date">{formatDate(selectedStar.date)}</p>
              <p className="star-modal-content">{selectedStar.content}</p>
              <div className="star-modal-actions">
                <button 
                  className="btn-share"
                  onClick={() => handleShare(selectedStar)}
                >
                  {sharingStarId === selectedStar.id ? 'Link copied!' : 'Share this memory'}
                </button>
                <button 
                  className="btn-close"
                  onClick={() => setSelectedStar(null)}
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

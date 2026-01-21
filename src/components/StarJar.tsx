import { useState, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import html2canvas from 'html2canvas';
import type { MemoryStar } from '../types';
import { formatDate, getRandomStar } from '../utils/storage';
import './StarJar.css';

// Candy pastel colors for paper stars - playful and bright
const STAR_COLORS = [
  { base: '#ffc4d4', light: '#ffe0e8', dark: '#f0a0b8' }, // Candy pink
  { base: '#ffd4b8', light: '#ffe8d4', dark: '#f0b898' }, // Peach
  { base: '#fff0a8', light: '#fff8cc', dark: '#e8d488' }, // Lemon
  { base: '#b8f0d8', light: '#d8f8e8', dark: '#98d8bc' }, // Mint
  { base: '#b8e0f8', light: '#d8f0fc', dark: '#98c8e0' }, // Sky
  { base: '#d8c8f8', light: '#e8e0fc', dark: '#c0a8e0' }, // Lavender
  { base: '#f8c8e0', light: '#fce0f0', dark: '#e0a8c8' }, // Rose
  { base: '#f8f4e8', light: '#fcfaf4', dark: '#e0dcd0' }, // Cream
];

function getStarColorIndex(id: string): number {
  const seed = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return seed % STAR_COLORS.length;
}

function getStarColor(id: string): string {
  return STAR_COLORS[getStarColorIndex(id)].base;
}

function getStarColorLight(id: string): string {
  return STAR_COLORS[getStarColorIndex(id)].light;
}

function getStarColorDark(id: string): string {
  return STAR_COLORS[getStarColorIndex(id)].dark;
}

interface StarJarProps {
  stars: MemoryStar[];
  year: number;
  onAddStar: () => void;
  onAddPastStar: () => void;
  onEditStar: (starId: string, newContent: string) => void;
  hasStarToday: boolean;
  hasPastDatesAvailable: boolean;
}

export function StarJar({ stars, year, onAddStar, onAddPastStar, onEditStar, hasStarToday, hasPastDatesAvailable }: StarJarProps) {
  const [selectedStar, setSelectedStar] = useState<MemoryStar | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const [isFromShake, setIsFromShake] = useState(false);
  const [showAllMemories, setShowAllMemories] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Generate positions for stars - they pile up at the bottom like real paper stars
  const starPositions = useMemo(() => {
    // Sort stars by date to ensure consistent ordering
    const sortedStars = [...stars].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    const positions: { x: number; y: number; rotation: number; scale: number; id: string }[] = [];
    
    sortedStars.forEach((star) => {
      // Use the star id to generate pseudo-random but consistent offsets
      const seed = star.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      
      // Calculate which "layer" this star is in based on how many stars are below it
      const starsBelow = positions.length;
      const starsPerRow = 6;
      const row = Math.floor(starsBelow / starsPerRow);
      const colBase = starsBelow % starsPerRow;
      
      // Add some randomness to x position within bounds
      const xOffset = ((seed % 20) - 10);
      const x = 10 + (colBase * 13) + xOffset;
      
      // Stack from bottom, with slight randomness
      const yBase = 5 + (row * 10);
      const yOffset = (seed % 6);
      const y = Math.min(yBase + yOffset, 75); // Cap so stars don't go too high
      
      // Random rotation for natural look
      const rotation = (seed % 60) - 30;
      
      // Slight scale variation
      const scale = 0.85 + (seed % 20) / 100;
      
      positions.push({ x, y, rotation, scale, id: star.id });
    });
    
    // Return in original star order
    return stars.map(star => positions.find(p => p.id === star.id)!);
  }, [stars]);

  const handleShare = async () => {
    if (!modalRef.current) return;
    
    setIsSharing(true);
    
    try {
      // Capture the modal as an image
      const canvas = await html2canvas(modalRef.current, {
        backgroundColor: '#f8f6f2', // Match the cream background
        scale: 2, // Higher resolution
        logging: false,
      });
      
      // Convert to blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), 'image/png');
      });
      
      const file = new File([blob], 'memory-star.png', { type: 'image/png' });
      
      // Try native share with file
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'A Memory Star',
          text: 'A memory star from my jar ✦ Create your own at star-memories.vercel.app',
        });
      } else {
        // Fallback: download the image
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'memory-star.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (e) {
      console.error('Share failed:', e);
    } finally {
      setIsSharing(false);
    }
  };

  const handleStartEdit = () => {
    if (selectedStar) {
      setEditContent(selectedStar.content);
      setIsEditing(true);
    }
  };

  const handleSaveEdit = () => {
    if (selectedStar && editContent.trim()) {
      onEditStar(selectedStar.id, editContent.trim());
      // Update the selected star locally for immediate feedback
      setSelectedStar({ ...selectedStar, content: editContent.trim() });
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent('');
  };

  const handleCloseModal = () => {
    setSelectedStar(null);
    setIsEditing(false);
    setEditContent('');
    setIsFromShake(false);
  };

  const handleShakeJar = useCallback(() => {
    if (stars.length === 0) return;
    
    setIsShaking(true);
    setTimeout(() => {
      const jar = { id: '', year, stars, createdAt: 0 };
      const randomStar = getRandomStar(jar);
      setIsShaking(false);
      if (randomStar) {
        setIsFromShake(true);
        setSelectedStar(randomStar);
      }
    }, 600);
  }, [stars, year]);

  return (
    <div className="star-jar-container">
      <header className="jar-header">
        <h1>Memory Jar</h1>
        <p className="jar-year">{year}</p>
      </header>

      <div className="jar-wrapper">
        <motion.div 
          className="jar"
          animate={isShaking ? { 
            rotate: [0, -5, 5, -5, 5, 0],
            x: [0, -3, 3, -3, 3, 0]
          } : {}}
          transition={{ duration: 0.5 }}
        >
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
                    rotate: starPositions[index].rotation,
                    // Generate consistent pastel color from star id
                    ['--star-color' as string]: getStarColor(star.id),
                    ['--star-color-light' as string]: getStarColorLight(star.id),
                    ['--star-color-dark' as string]: getStarColorDark(star.id),
                  }}
                  initial={{ y: -300, opacity: 0 }}
                  animate={{ 
                    y: 0, 
                    opacity: 1,
                    scale: starPositions[index].scale 
                  }}
                  transition={{ 
                    type: 'spring',
                    delay: index * 0.03,
                    damping: 12,
                    stiffness: 100
                  }}
                  onClick={() => { setIsFromShake(false); setSelectedStar(star); }}
                  title={formatDate(star.date)}
                >
                  <span className="paper-star" />
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
        </motion.div>
        
        {/* Memory count directly below jar */}
        <p className="jar-count">
          {stars.length === 0 
            ? 'Your jar is empty'
            : `${stars.length} ${stars.length === 1 ? 'memory' : 'memories'}`
          }
        </p>
      </div>

      <div className="jar-controls">
        {/* Two main actions side by side */}
        <div className="jar-main-actions">
          <button 
            className="btn-main"
            onClick={onAddStar}
            disabled={hasStarToday}
          >
            <span className="btn-icon">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path 
                  d="M16 3C16.5 3 17 5 17.5 8C18 11 19 12 22 13C25 14 27 14.5 27 15C27 15.5 25 16 22 17C19 18 18 19 17.5 22C17 25 16.5 27 16 27C15.5 27 15 25 14.5 22C14 19 13 18 10 17C7 16 5 15.5 5 15C5 14.5 7 14 10 13C13 12 14 11 14.5 8C15 5 15.5 3 16 3Z" 
                  fill="var(--color-peach)"
                  stroke="var(--color-ink)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span className="btn-label">
              {hasStarToday ? "Today's memory ✓" : "Add today's memory"}
            </span>
          </button>

          <button 
            className="btn-main btn-shake"
            onClick={handleShakeJar}
            disabled={stars.length === 0 || isShaking}
          >
            <span className={`btn-icon btn-icon-jar ${isShaking ? 'shaking' : ''}`}>
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Jar body */}
                <path 
                  d="M9 12C8 12 7 13 7 15C7 17 7 24 8 26C9 28 10 28 16 28C22 28 23 28 24 26C25 24 25 17 25 15C25 13 24 12 23 12" 
                  fill="rgba(168, 212, 232, 0.3)"
                  stroke="var(--color-ink)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Jar lid */}
                <path 
                  d="M10 10C10 9 11 8 12 8L20 8C21 8 22 9 22 10L22 12L10 12L10 10Z" 
                  fill="var(--color-peach)"
                  stroke="var(--color-ink)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Motion lines */}
                <path 
                  d="M5 16C4 16 3 15 3 15M5 20C4 20 2 19 2 19M27 16C28 16 29 15 29 15M27 20C28 20 30 19 30 19" 
                  stroke="var(--color-ink)"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  opacity="0.5"
                />
                {/* Little stars inside */}
                <circle cx="12" cy="20" r="2" fill="var(--star-pink)" stroke="var(--color-ink)" strokeWidth="0.8"/>
                <circle cx="17" cy="22" r="1.5" fill="var(--star-mint)" stroke="var(--color-ink)" strokeWidth="0.8"/>
                <circle cx="20" cy="19" r="1.8" fill="var(--star-lavender)" stroke="var(--color-ink)" strokeWidth="0.8"/>
              </svg>
            </span>
            <span className="btn-label">
              {isShaking ? 'Shaking...' : 'Shake jar'}
            </span>
          </button>
        </div>

        {/* Secondary actions */}
        <div className="jar-secondary-actions">
          {hasPastDatesAvailable && (
            <button className="btn-secondary" onClick={onAddPastStar}>
              Add past memory
            </button>
          )}
          {stars.length > 0 && (
            <button className="btn-secondary" onClick={() => setShowAllMemories(true)}>
              View all memories
            </button>
          )}
        </div>
      </div>

      {/* Star detail modal */}
      <AnimatePresence>
        {selectedStar && (
          <motion.div
            className="star-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseModal}
          >
            <motion.div
              className="star-modal"
              ref={modalRef}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="star-modal-star">
                <svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id={`starGradient-${selectedStar.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor={getStarColorLight(selectedStar.id)} />
                      <stop offset="35%" stopColor={getStarColor(selectedStar.id)} />
                      <stop offset="100%" stopColor={getStarColorDark(selectedStar.id)} />
                    </linearGradient>
                  </defs>
                  <path 
                    d="M36 0 L43.92 25.2 L70.56 25.2 L48.96 41.04 L56.88 65.52 L36 50.4 L15.12 65.52 L23.04 41.04 L1.44 25.2 L28.08 25.2 Z"
                    fill={`url(#starGradient-${selectedStar.id})`}
                  />
                  <ellipse cx="32" cy="22" rx="12" ry="8" fill="rgba(255,255,255,0.4)" />
                </svg>
              </div>
              <p className="star-modal-date">{formatDate(selectedStar.date)}</p>
              
              {isEditing ? (
                <div className="star-modal-edit">
                  <textarea
                    className="edit-textarea"
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    maxLength={150}
                    autoFocus
                  />
                  <span className="edit-char-count">{editContent.length}/150</span>
                  <div className="edit-actions">
                    <button className="btn-save" onClick={handleSaveEdit} disabled={!editContent.trim()}>
                      Save
                    </button>
                    <button className="btn-cancel-edit" onClick={handleCancelEdit}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="star-modal-content">{selectedStar.content}</p>
                  <div className="star-modal-actions">
                    {!isFromShake && (
                      <button 
                        className="btn-edit"
                        onClick={handleStartEdit}
                      >
                        Edit
                      </button>
                    )}
                    <button 
                      className="btn-share"
                      onClick={handleShare}
                      disabled={isSharing}
                    >
                      {isSharing ? 'Saving...' : 'Share'}
                    </button>
                    <button 
                      className="btn-close"
                      onClick={handleCloseModal}
                    >
                      Close
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* All memories list modal */}
      <AnimatePresence>
        {showAllMemories && (
          <motion.div
            className="star-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAllMemories(false)}
          >
            <motion.div
              className="memories-list-modal"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="memories-list-header">
                <h2>All Memories</h2>
                <span className="memories-count">{stars.length} {stars.length === 1 ? 'memory' : 'memories'}</span>
              </div>
              
              <div className="memories-list">
                {[...stars]
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((star) => (
                    <button
                      key={star.id}
                      className="memory-list-item"
                      onClick={() => {
                        setShowAllMemories(false);
                        setIsFromShake(false);
                        setSelectedStar(star);
                      }}
                    >
                      <div 
                        className="memory-item-star"
                        style={{
                          ['--star-color' as string]: getStarColor(star.id),
                          ['--star-color-light' as string]: getStarColorLight(star.id),
                          ['--star-color-dark' as string]: getStarColorDark(star.id),
                        }}
                      >
                        <span className="paper-star" />
                      </div>
                      <div className="memory-item-content">
                        <p className="memory-item-date">{formatDate(star.date)}</p>
                        <p className="memory-item-text">{star.content}</p>
                      </div>
                    </button>
                  ))}
              </div>
              
              <button 
                className="btn-close-list"
                onClick={() => setShowAllMemories(false)}
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

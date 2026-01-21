import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { MemoryStar } from '../types';
import { formatDate } from '../utils/storage';
import './YearRecap.css';

interface YearRecapProps {
  stars: MemoryStar[];
  year: number;
  onBack: () => void;
  onShareStar: (star: MemoryStar) => void;
}

export function YearRecap({ stars, year, onBack, onShareStar }: YearRecapProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'slideshow'>('grid');
  const [currentSlide, setCurrentSlide] = useState(0);

  const sortedStars = [...stars].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Group stars by month for the grid view
  const starsByMonth = sortedStars.reduce((acc, star) => {
    const month = new Date(star.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'long' });
    if (!acc[month]) acc[month] = [];
    acc[month].push(star);
    return acc;
  }, {} as Record<string, MemoryStar[]>);

  return (
    <div className="recap-container">
      <header className="recap-header">
        <button className="btn-back" onClick={onBack}>← Back to Jar</button>
        <h1>{year} Memories</h1>
        <p className="recap-stats">{stars.length} beautiful moments</p>
      </header>

      <div className="recap-tabs">
        <button 
          className={`tab ${viewMode === 'grid' ? 'active' : ''}`}
          onClick={() => setViewMode('grid')}
        >
          Calendar
        </button>
        <button 
          className={`tab ${viewMode === 'slideshow' ? 'active' : ''}`}
          onClick={() => { setViewMode('slideshow'); setCurrentSlide(0); }}
        >
          Slideshow
        </button>
      </div>

      <div className="recap-content">
        {/* Grid View */}
        {viewMode === 'grid' && (
          <div className="recap-grid">
            {Object.entries(starsByMonth).map(([month, monthStars]) => (
              <div key={month} className="month-section">
                <h2 className="month-title">{month}</h2>
                <div className="month-stars">
                  {monthStars.map((star) => (
                    <motion.div
                      key={star.id}
                      className="recap-star-card"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="card-star">★</div>
                      <p className="card-date">
                        {new Date(star.date + 'T00:00:00').toLocaleDateString('en-US', { 
                          weekday: 'short',
                          day: 'numeric'
                        })}
                      </p>
                      <p className="card-content">{star.content}</p>
                      <button 
                        className="btn-share-small"
                        onClick={() => onShareStar(star)}
                      >
                        Share
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Slideshow View */}
        {viewMode === 'slideshow' && sortedStars.length > 0 && (
          <div className="slideshow">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                className="slide"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                <div className="slide-star">★</div>
                <p className="slide-date">{formatDate(sortedStars[currentSlide].date)}</p>
                <p className="slide-content">{sortedStars[currentSlide].content}</p>
                <button 
                  className="btn-share-slide"
                  onClick={() => onShareStar(sortedStars[currentSlide])}
                >
                  Share this memory
                </button>
              </motion.div>
            </AnimatePresence>

            <div className="slideshow-controls">
              <button 
                className="slide-btn"
                onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
                disabled={currentSlide === 0}
              >
                ← Previous
              </button>
              <span className="slide-counter">
                {currentSlide + 1} / {sortedStars.length}
              </span>
              <button 
                className="slide-btn"
                onClick={() => setCurrentSlide(Math.min(sortedStars.length - 1, currentSlide + 1))}
                disabled={currentSlide === sortedStars.length - 1}
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarPicker } from './CalendarPicker';
import './PaperSheet.css';

interface PaperSheetProps {
  onSubmit: (content: string, date: string) => void;
  onCancel: () => void;
  availableDates?: string[]; // Dates without stars
  initialDate?: string;
}

export function PaperSheet({ onSubmit, onCancel, availableDates, initialDate }: PaperSheetProps) {
  const today = new Date().toISOString().split('T')[0];
  const [content, setContent] = useState('');
  const [selectedDate, setSelectedDate] = useState(initialDate || today);

  const formatDateForDisplay = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleSubmit = () => {
    if (content.trim()) {
      onSubmit(content.trim(), selectedDate);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && content.trim()) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Show date picker if there are available past dates
  const showDatePicker = availableDates && availableDates.length > 1;

  return (
    <motion.div
      className="paper-sheet-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="paper-sheet"
        initial={{ scaleX: 0.3, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      >
        <div className="paper-header">
          {showDatePicker ? (
            <CalendarPicker
              selectedDate={selectedDate}
              availableDates={availableDates}
              onSelect={setSelectedDate}
            />
          ) : (
            <div className="paper-date">{formatDateForDisplay(selectedDate)}</div>
          )}
        </div>
        
        <div className="paper-content">
          <textarea
            className="paper-textarea"
            placeholder="Write a good memory..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            maxLength={150}
            autoFocus
          />
        </div>
        
        <div className="paper-footer">
          <span className="char-count">{content.length}/150</span>
          <div className="paper-actions">
            <button className="btn-cancel" onClick={onCancel}>
              Cancel
            </button>
            <button
              className="btn-fold"
              onClick={handleSubmit}
              disabled={!content.trim()}
            >
              Fold ✦
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

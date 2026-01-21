import { useState } from 'react';
import { motion } from 'framer-motion';
import './PaperSheet.css';

interface PaperSheetProps {
  onSubmit: (content: string) => void;
  onCancel: () => void;
}

export function PaperSheet({ onSubmit, onCancel }: PaperSheetProps) {
  const [content, setContent] = useState('');
  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleSubmit = () => {
    if (content.trim()) {
      onSubmit(content.trim());
    }
  };

  return (
    <motion.div
      className="paper-sheet-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="paper-sheet"
        initial={{ scale: 0.8, rotateX: -15 }}
        animate={{ scale: 1, rotateX: 0 }}
        transition={{ type: 'spring', damping: 20 }}
      >
        <div className="paper-header">
          <div className="paper-date">{formattedDate}</div>
          <div className="paper-decoration">✦</div>
        </div>
        
        <textarea
          className="paper-textarea"
          placeholder="Write a good memory from today..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={280}
          autoFocus
        />
        
        <div className="paper-footer">
          <span className="char-count">{content.length}/280</span>
          <div className="paper-actions">
            <button className="btn-cancel" onClick={onCancel}>
              Cancel
            </button>
            <button
              className="btn-fold"
              onClick={handleSubmit}
              disabled={!content.trim()}
            >
              Fold into Star ✦
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

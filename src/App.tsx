import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import type { Jar, MemoryStar, AppView } from './types';
import { getOrCreateJar, addStar, hasStarForToday, getStarById } from './utils/storage';
import { PaperSheet } from './components/PaperSheet';
import { FoldingAnimation } from './components/FoldingAnimation';
import { StarJar } from './components/StarJar';
import { YearRecap } from './components/YearRecap';
import { SharedStar } from './components/SharedStar';
import './App.css';

function App() {
  const [jar, setJar] = useState<Jar | null>(null);
  const [view, setView] = useState<AppView>('home');
  const [showFolding, setShowFolding] = useState(false);
  const [sharedStar, setSharedStar] = useState<MemoryStar | null>(null);

  // Initialize jar and check for shared star URL
  useEffect(() => {
    const currentJar = getOrCreateJar();
    setJar(currentJar);

    // Check if there's a shared star in the URL
    const params = new URLSearchParams(window.location.search);
    const starId = params.get('star');
    
    if (starId) {
      const star = getStarById(currentJar, starId);
      if (star) {
        setSharedStar(star);
        setView('shared-star');
      } else {
        // Star not found, clear the URL and show jar
        window.history.replaceState({}, '', window.location.pathname);
        setView('jar');
      }
    } else {
      setView('jar');
    }
  }, []);

  const handleAddStar = () => {
    setView('write');
  };

  const handleSubmitMemory = useCallback((content: string) => {
    setView('home');
    setShowFolding(true);

    // After animation, add the star
    setTimeout(() => {
      if (jar) {
        const updatedJar = addStar(jar, content);
        setJar(updatedJar);
      }
    }, 2000);
  }, [jar]);

  const handleFoldingComplete = () => {
    setShowFolding(false);
    setView('jar');
  };

  const handleCancelWrite = () => {
    setView('jar');
  };

  const handleViewRecap = () => {
    setView('recap');
  };

  const handleBackToJar = () => {
    setView('jar');
  };

  const handleShareStar = (star: MemoryStar) => {
    const shareUrl = `${window.location.origin}${window.location.pathname}?star=${star.id}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'A Memory Star',
        text: `"${star.content}"`,
        url: shareUrl,
      }).catch(() => {
        navigator.clipboard.writeText(shareUrl);
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert('Link copied to clipboard!');
    }
  };

  const handleCreateOwnFromShared = () => {
    // Clear the shared star URL and go to main jar
    window.history.replaceState({}, '', window.location.pathname);
    setSharedStar(null);
    setView('jar');
  };

  if (!jar) {
    return (
      <div className="loading">
        <span className="loading-star">★</span>
        <p>Loading your memory jar...</p>
      </div>
    );
  }

  return (
    <div className="app">
      {/* Folding Animation Overlay */}
      <AnimatePresence>
        {showFolding && (
          <FoldingAnimation onComplete={handleFoldingComplete} />
        )}
      </AnimatePresence>

      {/* Paper Writing Sheet */}
      <AnimatePresence>
        {view === 'write' && (
          <PaperSheet
            onSubmit={handleSubmitMemory}
            onCancel={handleCancelWrite}
          />
        )}
      </AnimatePresence>

      {/* Shared Star View */}
      {view === 'shared-star' && sharedStar && (
        <SharedStar
          star={sharedStar}
          onCreateOwn={handleCreateOwnFromShared}
        />
      )}

      {/* Main Jar View */}
      {view === 'jar' && (
        <StarJar
          stars={jar.stars}
          year={jar.year}
          onAddStar={handleAddStar}
          onViewRecap={handleViewRecap}
          hasStarToday={hasStarForToday(jar)}
        />
      )}

      {/* Year Recap View */}
      {view === 'recap' && (
        <YearRecap
          stars={jar.stars}
          year={jar.year}
          onBack={handleBackToJar}
          onShareStar={handleShareStar}
        />
      )}
    </div>
  );
}

export default App;

import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import type { Jar, MemoryStar, AppView } from './types';
import { getOrCreateJar, addStar, hasStarForToday, getStarById, getAvailablePastDates, updateStar } from './utils/storage';
import { PaperSheet } from './components/PaperSheet';
import { FoldingAnimation } from './components/FoldingAnimation';
import { StarJar } from './components/StarJar';
import { YearRecap } from './components/YearRecap';
import { SharedStar } from './components/SharedStar';
import { OnboardingPopup } from './components/OnboardingPopup';
import './App.css';

const ONBOARDING_KEY = 'star-memories-onboarded';

function App() {
  const [jar, setJar] = useState<Jar | null>(null);
  const [view, setView] = useState<AppView>('home');
  const [showFolding, setShowFolding] = useState(false);
  const [sharedStar, setSharedStar] = useState<MemoryStar | null>(null);
  const [isAddingPastStar, setIsAddingPastStar] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Initialize jar and check for shared star URL
  useEffect(() => {
    const currentJar = getOrCreateJar();
    setJar(currentJar);

    // Check if user has seen onboarding
    const hasOnboarded = localStorage.getItem(ONBOARDING_KEY);
    if (!hasOnboarded) {
      setShowOnboarding(true);
    }

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

  const handleOnboardingComplete = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setShowOnboarding(false);
  };

  const handleAddStar = () => {
    setIsAddingPastStar(false);
    setView('write');
  };

  const handleAddPastStar = () => {
    setIsAddingPastStar(true);
    setView('write');
  };

  const handleSubmitMemory = useCallback((content: string, date: string) => {
    setView('home');
    setShowFolding(true);

    // After animation, add the star
    setTimeout(() => {
      if (jar) {
        const updatedJar = addStar(jar, content, date);
        setJar(updatedJar);
      }
    }, 2000);
  }, [jar]);

  const handleFoldingComplete = () => {
    setShowFolding(false);
    setView('jar');
  };

  const handleCancelWrite = () => {
    setIsAddingPastStar(false);
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

  const handleEditStar = useCallback((starId: string, newContent: string) => {
    if (jar) {
      const updatedJar = updateStar(jar, starId, newContent);
      setJar(updatedJar);
    }
  }, [jar]);

  if (!jar) {
    return (
      <div className="loading">
        <span className="loading-star">★</span>
        <p>Loading your memory jar...</p>
      </div>
    );
  }

  // Get available past dates (excluding today if already has star)
  const availablePastDates = getAvailablePastDates(jar);
  const today = new Date().toISOString().split('T')[0];
  const hasTodayStar = hasStarForToday(jar);
  
  // For "Add Past Memory", exclude today from the list
  const pastDatesOnly = availablePastDates.filter(d => d !== today);
  const hasPastDatesAvailable = pastDatesOnly.length > 0;

  return (
    <div className="app">
      {/* Onboarding Popup for first-time users */}
      <AnimatePresence>
        {showOnboarding && (
          <OnboardingPopup onComplete={handleOnboardingComplete} />
        )}
      </AnimatePresence>

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
            availableDates={isAddingPastStar ? pastDatesOnly : undefined}
            initialDate={isAddingPastStar ? pastDatesOnly[pastDatesOnly.length - 1] : today}
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

      {/* Main Jar View - also show behind write overlay */}
      {(view === 'jar' || view === 'write') && (
        <StarJar
          stars={jar.stars}
          year={jar.year}
          onAddStar={handleAddStar}
          onAddPastStar={handleAddPastStar}
          onViewRecap={handleViewRecap}
          onEditStar={handleEditStar}
          hasStarToday={hasTodayStar}
          hasPastDatesAvailable={hasPastDatesAvailable}
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

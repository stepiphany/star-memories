import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './OnboardingPopup.css';

interface OnboardingPopupProps {
  onComplete: () => void;
}

const steps = [
  {
    icon: '✨',
    title: 'Welcome to Star Memories',
    description: 'A simple, beautiful way to collect one good memory each day. Your memories are stored locally in your browser — private and just for you.',
  },
  {
    icon: '⭐',
    title: 'Add a Memory',
    description: 'Click "Add memory" to write down something good that happened today. It could be big or small — a kind word, a tasty meal, or a moment of peace.',
  },
  {
    icon: '🫙',
    title: 'Shake the Jar',
    description: 'Feeling down? Shake the jar to revisit a random happy memory. Click on any star in the jar to read, edit, or share it.',
  },
  {
    icon: '📅',
    title: 'Never Miss a Day',
    description: 'Forgot yesterday? Use "Add past memory" to fill in recent days. At year\'s end, browse your Year Recap to relive all the good moments.',
  },
  {
    icon: '💾',
    title: 'Your Data, Your Device',
    description: 'Everything is saved in your browser\'s local storage. No account needed, no cloud, no tracking. Bookmark this page to come back anytime!',
  },
];

export function OnboardingPopup({ onComplete }: OnboardingPopupProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  return (
    <motion.div
      className="onboarding-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="onboarding-popup"
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            className="onboarding-content"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <div className="onboarding-icon">{step.icon}</div>
            <h2 className="onboarding-title">{step.title}</h2>
            <p className="onboarding-description">{step.description}</p>
          </motion.div>
        </AnimatePresence>

        <div className="onboarding-progress">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`progress-dot ${index === currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}
            />
          ))}
        </div>

        <div className="onboarding-actions">
          {!isLastStep && (
            <button className="btn-skip" onClick={handleSkip}>
              Skip
            </button>
          )}
          <button className="btn-next" onClick={handleNext}>
            {isLastStep ? "Let's go! ✦" : 'Next'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

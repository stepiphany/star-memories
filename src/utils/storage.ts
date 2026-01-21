import { v4 as uuidv4 } from 'uuid';
import type { Jar, MemoryStar } from '../types';

const STORAGE_KEY = 'star-memories-jar';

export function getOrCreateJar(): Jar {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    const jar = JSON.parse(stored) as Jar;
    // Check if it's a new year
    const currentYear = new Date().getFullYear();
    if (jar.year !== currentYear) {
      // Archive old jar and create new one
      archiveJar(jar);
      return createNewJar();
    }
    return jar;
  }
  return createNewJar();
}

function createNewJar(): Jar {
  const jar: Jar = {
    id: uuidv4(),
    year: new Date().getFullYear(),
    stars: [],
    createdAt: Date.now(),
  };
  saveJar(jar);
  return jar;
}

export function saveJar(jar: Jar): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(jar));
}

export function addStar(jar: Jar, content: string): Jar {
  const today = new Date().toISOString().split('T')[0];
  
  // Check if there's already a star for today
  const existingIndex = jar.stars.findIndex(s => s.date === today);
  
  const newStar: MemoryStar = {
    id: uuidv4(),
    date: today,
    content,
    createdAt: Date.now(),
  };
  
  let updatedStars: MemoryStar[];
  if (existingIndex >= 0) {
    // Replace existing star for today
    updatedStars = [...jar.stars];
    updatedStars[existingIndex] = newStar;
  } else {
    updatedStars = [...jar.stars, newStar];
  }
  
  const updatedJar = { ...jar, stars: updatedStars };
  saveJar(updatedJar);
  return updatedJar;
}

export function hasStarForToday(jar: Jar): boolean {
  const today = new Date().toISOString().split('T')[0];
  return jar.stars.some(s => s.date === today);
}

export function getStarById(jar: Jar, starId: string): MemoryStar | undefined {
  return jar.stars.find(s => s.id === starId);
}

function archiveJar(jar: Jar): void {
  const archiveKey = `star-memories-archive-${jar.year}`;
  localStorage.setItem(archiveKey, JSON.stringify(jar));
}

export function getArchivedYears(): number[] {
  const years: number[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith('star-memories-archive-')) {
      const year = parseInt(key.replace('star-memories-archive-', ''));
      if (!isNaN(year)) years.push(year);
    }
  }
  return years.sort((a, b) => b - a);
}

export function getArchivedJar(year: number): Jar | null {
  const stored = localStorage.getItem(`star-memories-archive-${year}`);
  return stored ? JSON.parse(stored) : null;
}

// Format date for display
export function formatDate(dateString: string): string {
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// Get a random star from the jar for "shake" feature
export function getRandomStar(jar: Jar): MemoryStar | null {
  if (jar.stars.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * jar.stars.length);
  return jar.stars[randomIndex];
}

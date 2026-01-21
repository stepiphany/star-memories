export interface MemoryStar {
  id: string;
  date: string; // ISO date string "YYYY-MM-DD"
  content: string;
  createdAt: number;
}

export interface Jar {
  id: string;
  year: number;
  stars: MemoryStar[];
  createdAt: number;
}

export type AppView = 'home' | 'write' | 'jar' | 'recap' | 'shared-star';

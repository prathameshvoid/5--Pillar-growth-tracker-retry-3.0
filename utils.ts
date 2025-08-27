import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

export function getWeekStartDate(date: Date = new Date()): string {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay()); // Start of week (Sunday)
  return d.toISOString().split('T')[0];
}

export function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

export function calculateDailyScore(ratings: {
  mind: number;
  body: number;
  career: number;
  skills: number;
  finance: number;
}): number {
  const average = (ratings.mind + ratings.body + ratings.career + ratings.skills + ratings.finance) / 5;
  return Math.round((average / 5) * 100);
}

export function getPillarIcon(pillar: string): string {
  const icons = {
    mind: 'fa-brain',
    body: 'fa-dumbbell',
    career: 'fa-briefcase',
    skills: 'fa-tools',
    finance: 'fa-dollar-sign'
  };
  return icons[pillar as keyof typeof icons] || 'fa-circle';
}

export function getPillarColor(pillar: string): string {
  const colors = {
    mind: 'text-chart-1',
    body: 'text-chart-2', 
    career: 'text-chart-3',
    skills: 'text-chart-4',
    finance: 'text-chart-5'
  };
  return colors[pillar as keyof typeof colors] || 'text-primary';
}

export function getCurrentMonthYear(): { month: number; year: number } {
  const now = new Date();
  return {
    month: now.getMonth() + 1,
    year: now.getFullYear()
  };
}

export function getNextMonthYear(): { month: number; year: number } {
  const now = new Date();
  const next = new Date(now.getFullYear(), now.getMonth() + 1);
  return {
    month: next.getMonth() + 1,
    year: next.getFullYear()
  };
}

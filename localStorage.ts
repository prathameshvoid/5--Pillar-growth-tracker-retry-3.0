import type { DailyRating, WeeklyReflection, FocusTheme, InsertDailyRating, InsertWeeklyReflection, InsertFocusTheme } from "@shared/schema";

const STORAGE_KEYS = {
  DAILY_RATINGS: 'growth-tracker-daily-ratings',
  WEEKLY_REFLECTIONS: 'growth-tracker-weekly-reflections',
  FOCUS_THEMES: 'growth-tracker-focus-themes'
};

// Helper to generate UUIDs
function generateId(): string {
  return crypto.randomUUID();
}

// Daily Ratings
export const localDailyRatings = {
  getAll(): DailyRating[] {
    const data = localStorage.getItem(STORAGE_KEYS.DAILY_RATINGS);
    return data ? JSON.parse(data) : [];
  },

  getByDate(date: string): DailyRating | undefined {
    const ratings = this.getAll();
    return ratings.find(rating => rating.date === date);
  },

  getFiltered(startDate?: string, endDate?: string): DailyRating[] {
    let ratings = this.getAll();
    
    if (startDate) {
      ratings = ratings.filter(rating => rating.date >= startDate);
    }
    
    if (endDate) {
      ratings = ratings.filter(rating => rating.date <= endDate);
    }
    
    return ratings.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  save(insertRating: InsertDailyRating): DailyRating {
    const ratings = this.getAll();
    
    // Check if rating exists for this date
    const existingIndex = ratings.findIndex(r => r.date === insertRating.date);
    
    if (existingIndex >= 0) {
      // Update existing
      const updated = { ...ratings[existingIndex], ...insertRating };
      ratings[existingIndex] = updated;
      localStorage.setItem(STORAGE_KEYS.DAILY_RATINGS, JSON.stringify(ratings));
      return updated;
    } else {
      // Create new
      const newRating: DailyRating = { id: generateId(), ...insertRating };
      ratings.push(newRating);
      localStorage.setItem(STORAGE_KEYS.DAILY_RATINGS, JSON.stringify(ratings));
      return newRating;
    }
  },

  delete(id: string): boolean {
    const ratings = this.getAll();
    const filtered = ratings.filter(r => r.id !== id);
    localStorage.setItem(STORAGE_KEYS.DAILY_RATINGS, JSON.stringify(filtered));
    return filtered.length !== ratings.length;
  }
};

// Weekly Reflections
export const localWeeklyReflections = {
  getAll(): WeeklyReflection[] {
    const data = localStorage.getItem(STORAGE_KEYS.WEEKLY_REFLECTIONS);
    return data ? JSON.parse(data) : [];
  },

  getByWeek(weekStartDate: string): WeeklyReflection | undefined {
    const reflections = this.getAll();
    return reflections.find(reflection => reflection.weekStartDate === weekStartDate);
  },

  getRecent(limit?: number): WeeklyReflection[] {
    let reflections = this.getAll()
      .sort((a, b) => new Date(b.weekStartDate).getTime() - new Date(a.weekStartDate).getTime());
    
    if (limit) {
      reflections = reflections.slice(0, limit);
    }
    
    return reflections;
  },

  save(insertReflection: InsertWeeklyReflection): WeeklyReflection {
    const reflections = this.getAll();
    
    // Check if reflection exists for this week
    const existingIndex = reflections.findIndex(r => r.weekStartDate === insertReflection.weekStartDate);
    
    if (existingIndex >= 0) {
      // Update existing
      const updated = { ...reflections[existingIndex], ...insertReflection };
      reflections[existingIndex] = updated;
      localStorage.setItem(STORAGE_KEYS.WEEKLY_REFLECTIONS, JSON.stringify(reflections));
      return updated;
    } else {
      // Create new
      const newReflection: WeeklyReflection = { id: generateId(), ...insertReflection };
      reflections.push(newReflection);
      localStorage.setItem(STORAGE_KEYS.WEEKLY_REFLECTIONS, JSON.stringify(reflections));
      return newReflection;
    }
  },

  delete(id: string): boolean {
    const reflections = this.getAll();
    const filtered = reflections.filter(r => r.id !== id);
    localStorage.setItem(STORAGE_KEYS.WEEKLY_REFLECTIONS, JSON.stringify(filtered));
    return filtered.length !== reflections.length;
  }
};

// Focus Themes
export const localFocusThemes = {
  getAll(): FocusTheme[] {
    const data = localStorage.getItem(STORAGE_KEYS.FOCUS_THEMES);
    return data ? JSON.parse(data) : [];
  },

  getByMonthYear(month: number, year: number): FocusTheme | undefined {
    const themes = this.getAll();
    return themes.find(theme => theme.month === month && theme.year === year);
  },

  getAllSorted(): FocusTheme[] {
    return this.getAll()
      .sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        return b.month - a.month;
      });
  },

  save(insertTheme: InsertFocusTheme): FocusTheme {
    const themes = this.getAll();
    
    // Check if theme exists for this month/year
    const existingIndex = themes.findIndex(t => t.month === insertTheme.month && t.year === insertTheme.year);
    
    if (existingIndex >= 0) {
      // Update existing
      const updated = { ...themes[existingIndex], ...insertTheme };
      themes[existingIndex] = updated;
      localStorage.setItem(STORAGE_KEYS.FOCUS_THEMES, JSON.stringify(themes));
      return updated;
    } else {
      // Create new
      const newTheme: FocusTheme = { id: generateId(), ...insertTheme };
      themes.push(newTheme);
      localStorage.setItem(STORAGE_KEYS.FOCUS_THEMES, JSON.stringify(themes));
      return newTheme;
    }
  },

  delete(id: string): boolean {
    const themes = this.getAll();
    const filtered = themes.filter(t => t.id !== id);
    localStorage.setItem(STORAGE_KEYS.FOCUS_THEMES, JSON.stringify(filtered));
    return filtered.length !== themes.length;
  }
};

// Export/Import functionality
export const dataManager = {
  exportAll(): string {
    const data = {
      dailyRatings: localDailyRatings.getAll(),
      weeklyReflections: localWeeklyReflections.getAll(),
      focusThemes: localFocusThemes.getAll(),
      exportedAt: new Date().toISOString(),
      version: "1.0"
    };
    return JSON.stringify(data, null, 2);
  },

  importAll(jsonData: string): { success: boolean; message: string } {
    try {
      const data = JSON.parse(jsonData);
      
      // Validate structure
      if (!data.dailyRatings || !data.weeklyReflections || !data.focusThemes) {
        return { success: false, message: "Invalid data format" };
      }

      // Import data
      localStorage.setItem(STORAGE_KEYS.DAILY_RATINGS, JSON.stringify(data.dailyRatings));
      localStorage.setItem(STORAGE_KEYS.WEEKLY_REFLECTIONS, JSON.stringify(data.weeklyReflections));
      localStorage.setItem(STORAGE_KEYS.FOCUS_THEMES, JSON.stringify(data.focusThemes));

      return { 
        success: true, 
        message: `Imported ${data.dailyRatings.length} ratings, ${data.weeklyReflections.length} reflections, and ${data.focusThemes.length} focus themes` 
      };
    } catch (error) {
      return { success: false, message: "Failed to parse data file" };
    }
  },

  clearAll(): void {
    localStorage.removeItem(STORAGE_KEYS.DAILY_RATINGS);
    localStorage.removeItem(STORAGE_KEYS.WEEKLY_REFLECTIONS);
    localStorage.removeItem(STORAGE_KEYS.FOCUS_THEMES);
  },

  getStorageSize(): string {
    const dailySize = localStorage.getItem(STORAGE_KEYS.DAILY_RATINGS)?.length || 0;
    const weeklySize = localStorage.getItem(STORAGE_KEYS.WEEKLY_REFLECTIONS)?.length || 0;
    const themeSize = localStorage.getItem(STORAGE_KEYS.FOCUS_THEMES)?.length || 0;
    const totalBytes = dailySize + weeklySize + themeSize;
    
    if (totalBytes < 1024) return `${totalBytes} bytes`;
    if (totalBytes < 1024 * 1024) return `${(totalBytes / 1024).toFixed(1)} KB`;
    return `${(totalBytes / (1024 * 1024)).toFixed(1)} MB`;
  }
};
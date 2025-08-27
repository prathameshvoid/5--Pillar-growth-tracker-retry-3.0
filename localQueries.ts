import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { localDailyRatings, localWeeklyReflections, localFocusThemes } from "./localStorage";
import type { DailyRating, WeeklyReflection, FocusTheme, InsertDailyRating, InsertWeeklyReflection, InsertFocusTheme } from "@shared/schema";

// Daily Ratings Hooks
export function useDailyRating(date: string) {
  return useQuery<DailyRating | undefined>({
    queryKey: ["/local/daily-ratings", date],
    queryFn: () => localDailyRatings.getByDate(date),
    retry: false
  });
}

export function useDailyRatings(startDate?: string, endDate?: string) {
  return useQuery<DailyRating[]>({
    queryKey: ["/local/daily-ratings", { startDate, endDate }],
    queryFn: () => localDailyRatings.getFiltered(startDate, endDate),
    retry: false
  });
}

export function useSaveDailyRating() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: InsertDailyRating) => {
      const result = localDailyRatings.save(data);
      return Promise.resolve(result);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/local/daily-ratings"] });
      queryClient.invalidateQueries({ queryKey: ["/local/analytics/trends"] });
    }
  });
}

// Weekly Reflections Hooks
export function useWeeklyReflection(weekStartDate: string) {
  return useQuery<WeeklyReflection | undefined>({
    queryKey: ["/local/weekly-reflections", weekStartDate],
    queryFn: () => localWeeklyReflections.getByWeek(weekStartDate),
    retry: false
  });
}

export function useWeeklyReflections(limit?: number) {
  return useQuery<WeeklyReflection[]>({
    queryKey: ["/local/weekly-reflections", { limit }],
    queryFn: () => localWeeklyReflections.getRecent(limit),
    retry: false
  });
}

export function useSaveWeeklyReflection() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: InsertWeeklyReflection) => {
      const result = localWeeklyReflections.save(data);
      return Promise.resolve(result);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/local/weekly-reflections"] });
    }
  });
}

// Focus Themes Hooks
export function useFocusTheme(month: number, year: number) {
  return useQuery<FocusTheme | undefined>({
    queryKey: ["/local/focus-themes", month, year],
    queryFn: () => localFocusThemes.getByMonthYear(month, year),
    retry: false
  });
}

export function useFocusThemes() {
  return useQuery<FocusTheme[]>({
    queryKey: ["/local/focus-themes"],
    queryFn: () => localFocusThemes.getAllSorted(),
    retry: false
  });
}

export function useSaveFocusTheme() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: InsertFocusTheme) => {
      const result = localFocusThemes.save(data);
      return Promise.resolve(result);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/local/focus-themes"] });
    }
  });
}

// Analytics Hook
export function useAnalyticsTrends(days: number = 30) {
  return useQuery({
    queryKey: ["/local/analytics/trends", { days }],
    queryFn: () => {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - days);
      
      const ratings = localDailyRatings.getFiltered(
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      );
      
      // Calculate weekly averages
      const weeklyData: { [week: string]: any } = {};
      
      ratings.forEach(rating => {
        const date = new Date(rating.date);
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay()); // Start of week (Sunday)
        const weekKey = weekStart.toISOString().split('T')[0];
        
        if (!weeklyData[weekKey]) {
          weeklyData[weekKey] = {
            date: weekKey,
            mind: [],
            body: [],
            career: [],
            skills: [],
            finance: []
          };
        }
        
        weeklyData[weekKey].mind.push(rating.mind);
        weeklyData[weekKey].body.push(rating.body);
        weeklyData[weekKey].career.push(rating.career);
        weeklyData[weekKey].skills.push(rating.skills);
        weeklyData[weekKey].finance.push(rating.finance);
      });
      
      // Calculate averages
      const trends = Object.values(weeklyData).map((week: any) => ({
        date: week.date,
        mind: week.mind.reduce((a: number, b: number) => a + b, 0) / week.mind.length,
        body: week.body.reduce((a: number, b: number) => a + b, 0) / week.body.length,
        career: week.career.reduce((a: number, b: number) => a + b, 0) / week.career.length,
        skills: week.skills.reduce((a: number, b: number) => a + b, 0) / week.skills.length,
        finance: week.finance.reduce((a: number, b: number) => a + b, 0) / week.finance.length,
      }));
      
      return trends.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    },
    retry: false
  });
}
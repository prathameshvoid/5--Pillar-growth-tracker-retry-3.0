import { useState, useEffect } from "react";
import { PillarCard } from "@/components/PillarCard";
import { TrendChart } from "@/components/TrendChart";
import { getTodayString, calculateDailyScore, getCurrentMonthYear } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { useDailyRating, useDailyRatings, useSaveDailyRating, useFocusTheme, useAnalyticsTrends } from "@/lib/localQueries";
import type { InsertDailyRating, PillarType } from "@shared/schema";

export default function Dashboard() {
  const { toast } = useToast();
  const today = getTodayString();
  const { month, year } = getCurrentMonthYear();

  // Local state for ratings
  const [ratings, setRatings] = useState<InsertDailyRating>({
    date: today,
    mind: 1,
    body: 1,
    career: 1,
    skills: 1,
    finance: 1
  });

  // Fetch today's ratings
  const { data: todayRating, isLoading: loadingTodayRating } = useDailyRating(today);

  // Fetch focus theme for current month
  const { data: currentFocusTheme } = useFocusTheme(month, year);

  // Fetch trend data
  const { data: trendData = [] } = useAnalyticsTrends(30);

  // Fetch recent ratings for weekly averages
  const { data: recentRatings = [] } = useDailyRatings();

  // Load today's rating into local state when available
  useEffect(() => {
    if (todayRating) {
      setRatings({
        date: todayRating.date,
        mind: todayRating.mind,
        body: todayRating.body,
        career: todayRating.career,
        skills: todayRating.skills,
        finance: todayRating.finance
      });
    }
  }, [todayRating]);

  // Save ratings mutation
  const saveRatingsMutation = useSaveDailyRating();

  // Add success/error handling
  useEffect(() => {
    if (saveRatingsMutation.isSuccess) {
      toast({
        title: "Ratings saved",
        description: "Your daily ratings have been saved successfully."
      });
    }
    if (saveRatingsMutation.isError) {
      toast({
        title: "Error", 
        description: "Failed to save ratings. Please try again.",
        variant: "destructive"
      });
    }
  }, [saveRatingsMutation.isSuccess, saveRatingsMutation.isError, toast]);

  const handleRatingChange = (pillar: PillarType, rating: number) => {
    setRatings(prev => ({
      ...prev,
      [pillar]: rating
    }));
  };

  const handleSaveRatings = () => {
    saveRatingsMutation.mutate(ratings);
  };

  // Calculate daily status score
  const dailyScore = calculateDailyScore(ratings);

  // Calculate weekly averages for each pillar
  const getWeeklyAverage = (pillar: PillarType) => {
    if (recentRatings.length === 0) return 0;
    
    // Get last 7 days
    const last7Days = recentRatings.slice(0, 7);
    const sum = last7Days.reduce((acc, rating) => acc + rating[pillar], 0);
    return last7Days.length > 0 ? sum / last7Days.length : 0;
  };

  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Current Status Overview */}
      <section className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Daily Status Score */}
          <div className="col-span-1 md:col-span-2">
            <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-card-foreground">Today's Status</h2>
                <div className="text-3xl font-bold text-primary" data-testid="text-daily-score">
                  {dailyScore}/100
                </div>
              </div>
              <div className="w-full bg-secondary rounded-full h-3">
                <div 
                  className="bg-primary h-3 rounded-full transition-all duration-300" 
                  style={{ width: `${dailyScore}%` }}
                ></div>
              </div>
              <p className="text-sm text-muted-foreground mt-2">Based on your 5-pillar ratings</p>
            </div>
          </div>
          
          {/* Focus Theme */}
          <div className="col-span-1">
            <div className="bg-card border border-border rounded-lg p-6 shadow-sm focus-pillar">
              <div className="flex items-center space-x-3">
                <i className="fas fa-target text-2xl text-chart-3"></i>
                <div>
                  <h3 className="font-semibold text-card-foreground">Focus Theme</h3>
                  <p className="text-sm text-muted-foreground">
                    {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </p>
                  <p className="text-lg font-medium text-chart-3 capitalize" data-testid="text-focus-theme">
                    {currentFocusTheme?.pillar || 'Not set'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Daily Tracking Section */}
      <section className="mb-8">
        <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-card-foreground mb-6">Daily Tracking</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {(['mind', 'body', 'career', 'skills', 'finance'] as PillarType[]).map((pillar) => (
              <PillarCard
                key={pillar}
                pillar={pillar}
                title=""
                description=""
                rating={ratings[pillar]}
                onRatingChange={(rating) => handleRatingChange(pillar, rating)}
                isFocus={currentFocusTheme?.pillar === pillar}
                disabled={loadingTodayRating || saveRatingsMutation.isPending}
              />
            ))}
          </div>
          
          <div className="mt-6 flex justify-end">
            <Button 
              onClick={handleSaveRatings}
              disabled={saveRatingsMutation.isPending}
              data-testid="button-save-ratings"
            >
              {saveRatingsMutation.isPending ? "Saving..." : "Save Today's Ratings"}
            </Button>
          </div>
        </div>
      </section>

      {/* Trends and Analytics */}
      <section className="mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Trend Chart */}
          <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-card-foreground mb-4">Weekly Trends</h3>
            <TrendChart data={trendData} focusPillar={currentFocusTheme?.pillar} />
          </div>
          
          {/* Current Week Summary */}
          <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-card-foreground mb-4">This Week's Performance</h3>
            <div className="space-y-4">
              {(['mind', 'body', 'career', 'skills', 'finance'] as PillarType[]).map((pillar) => {
                const weeklyAvg = getWeeklyAverage(pillar);
                const percentage = (weeklyAvg / 5) * 100;
                
                return (
                  <div key={pillar} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <i className={`fas fa-${pillar === 'mind' ? 'brain' : pillar === 'body' ? 'dumbbell' : pillar === 'career' ? 'briefcase' : pillar === 'skills' ? 'tools' : 'dollar-sign'} text-chart-${pillar === 'mind' ? '1' : pillar === 'body' ? '2' : pillar === 'career' ? '3' : pillar === 'skills' ? '4' : '5'}`}></i>
                      <span className="text-sm capitalize">{pillar}</span>
                      {currentFocusTheme?.pillar === pillar && (
                        <i className="fas fa-star text-xs text-chart-3"></i>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-secondary rounded-full h-2">
                        <div 
                          className={`bg-chart-${pillar === 'mind' ? '1' : pillar === 'body' ? '2' : pillar === 'career' ? '3' : pillar === 'skills' ? '4' : '5'} h-2 rounded-full transition-all duration-300`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium" data-testid={`text-${pillar}-weekly-avg`}>
                        {weeklyAvg.toFixed(1)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

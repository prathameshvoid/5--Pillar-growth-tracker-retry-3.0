import { useState } from "react";
import { WeeklyReflectionForm } from "@/components/WeeklyReflectionForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { getWeekStartDate, formatDate } from "@/lib/utils";
import { useWeeklyReflection, useWeeklyReflections } from "@/lib/localQueries";
import type { WeeklyReflection } from "@shared/schema";

export default function Reflections() {
  const currentWeekStart = getWeekStartDate();
  const [selectedWeekStart, setSelectedWeekStart] = useState(currentWeekStart);

  // Fetch current week reflection
  const { data: currentReflection } = useWeeklyReflection(selectedWeekStart);

  // Fetch all reflections for history
  const { data: reflectionHistory = [], isLoading: loadingHistory } = useWeeklyReflections();

  const getWeekRange = (weekStart: string) => {
    const start = new Date(weekStart);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  };

  const generateWeekOptions = () => {
    const weeks = [];
    const today = new Date();
    
    for (let i = 0; i < 12; i++) { // Last 12 weeks
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - (today.getDay() + (i * 7))); // Start of each week
      const weekStartStr = weekStart.toISOString().split('T')[0];
      weeks.push(weekStartStr);
    }
    
    return weeks;
  };

  if (loadingHistory) {
    return (
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <i className="fas fa-spinner fa-spin text-4xl text-muted-foreground mb-4"></i>
            <p className="text-muted-foreground">Loading reflections...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Weekly Reflections</h1>
        <p className="text-muted-foreground">Reflect on your growth and plan adjustments</p>
      </div>

      <Tabs defaultValue="current" className="space-y-6">
        <TabsList className="grid w-full max-w-[400px] grid-cols-2">
          <TabsTrigger value="current" data-testid="tab-current">Current Week</TabsTrigger>
          <TabsTrigger value="history" data-testid="tab-history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-6">
          {/* Week Selector */}
          <Card>
            <CardHeader>
              <CardTitle>Select Week</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {generateWeekOptions().map((weekStart) => (
                  <Button
                    key={weekStart}
                    variant={selectedWeekStart === weekStart ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedWeekStart(weekStart)}
                    className="text-xs"
                    data-testid={`button-week-${weekStart}`}
                  >
                    {getWeekRange(weekStart)}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Reflection Form */}
          <WeeklyReflectionForm 
            weekStartDate={selectedWeekStart}
            initialData={currentReflection}
          />
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          {reflectionHistory.length > 0 ? (
            <div className="space-y-6">
              {reflectionHistory.map((reflection) => (
                <Card key={reflection.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Week of {getWeekRange(reflection.weekStartDate)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground mb-2">
                        What went well:
                      </h4>
                      <p className="text-sm bg-accent rounded-lg p-3" data-testid={`text-went-well-${reflection.id}`}>
                        {reflection.wentWell}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground mb-2">
                        What didn't go well:
                      </h4>
                      <p className="text-sm bg-accent rounded-lg p-3" data-testid={`text-didnt-go-well-${reflection.id}`}>
                        {reflection.didntGoWell}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground mb-2">
                        Adjustment for next week:
                      </h4>
                      <p className="text-sm bg-accent rounded-lg p-3" data-testid={`text-adjustment-${reflection.id}`}>
                        {reflection.adjustment}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <i className="fas fa-journal-whills text-4xl text-muted-foreground mb-4"></i>
                <h3 className="text-lg font-medium text-foreground mb-2">No Reflections Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start your weekly reflection practice to track your growth and insights.
                </p>
                <Button 
                  onClick={() => {
                    const tabButton = document.querySelector('[data-testid="tab-current"]') as HTMLElement;
                    tabButton?.click();
                  }}
                  data-testid="button-start-reflecting"
                >
                  Start Reflecting
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </main>
  );
}

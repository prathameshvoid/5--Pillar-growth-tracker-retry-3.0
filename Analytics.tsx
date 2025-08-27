import { useState } from "react";
import { TrendChart } from "@/components/TrendChart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate, calculateDailyScore, getCurrentMonthYear } from "@/lib/utils";
import { useDailyRatings, useFocusTheme, useAnalyticsTrends } from "@/lib/localQueries";
import type { DailyRating, FocusTheme } from "@shared/schema";

export default function Analytics() {
  const [timeRange, setTimeRange] = useState("30");
  const { month, year } = getCurrentMonthYear();

  // Fetch ratings data
  const { data: ratings = [], isLoading: loadingRatings } = useDailyRatings();

  // Fetch trend data
  const { data: trendData = [], isLoading: loadingTrends } = useAnalyticsTrends(parseInt(timeRange));

  // Fetch current focus theme
  const { data: currentFocusTheme } = useFocusTheme(month, year);

  // Filter ratings based on time range
  const filteredRatings = ratings.slice(0, parseInt(timeRange));

  if (loadingRatings || loadingTrends) {
    return (
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <i className="fas fa-spinner fa-spin text-4xl text-muted-foreground mb-4"></i>
            <p className="text-muted-foreground">Loading analytics data...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground">Track your progress and identify trends</p>
        </div>
        
        <Select value={timeRange} onValueChange={setTimeRange} data-testid="select-time-range">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 3 months</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Trend Chart */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Trend Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <TrendChart data={trendData} focusPillar={currentFocusTheme?.pillar} />
        </CardContent>
      </Card>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Days Tracked */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Days Tracked</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-days-tracked">
              {filteredRatings.length}
            </div>
          </CardContent>
        </Card>

        {/* Average Score */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-average-score">
              {filteredRatings.length > 0
                ? Math.round(
                    filteredRatings.reduce((acc, rating) => acc + calculateDailyScore(rating), 0) /
                    filteredRatings.length
                  )
                : 0}
              /100
            </div>
          </CardContent>
        </Card>

        {/* Best Day */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Best Day</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredRatings.length > 0 ? (
              (() => {
                const bestDay = filteredRatings.reduce((best, rating) => 
                  calculateDailyScore(rating) > calculateDailyScore(best) ? rating : best
                );
                return (
                  <div>
                    <div className="text-2xl font-bold" data-testid="text-best-score">
                      {calculateDailyScore(bestDay)}/100
                    </div>
                    <div className="text-xs text-muted-foreground" data-testid="text-best-date">
                      {formatDate(bestDay.date)}
                    </div>
                  </div>
                );
              })()
            ) : (
              <div className="text-2xl font-bold">-</div>
            )}
          </CardContent>
        </Card>

        {/* Current Streak */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Current Streak</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-current-streak">
              {(() => {
                let streak = 0;
                const today = new Date();
                
                for (let i = 0; i < 30; i++) {
                  const checkDate = new Date(today);
                  checkDate.setDate(today.getDate() - i);
                  const dateStr = checkDate.toISOString().split('T')[0];
                  
                  const hasRating = ratings.some(rating => rating.date === dateStr);
                  if (hasRating) {
                    streak++;
                  } else {
                    break;
                  }
                }
                
                return streak;
              })()}
            </div>
            <div className="text-xs text-muted-foreground">days</div>
          </CardContent>
        </Card>
      </div>

      {/* Historical Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Historical Data</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredRatings.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-left">Date</TableHead>
                    <TableHead className="text-center">Mind</TableHead>
                    <TableHead className="text-center">Body</TableHead>
                    <TableHead className="text-center">Career</TableHead>
                    <TableHead className="text-center">Skills</TableHead>
                    <TableHead className="text-center">Finance</TableHead>
                    <TableHead className="text-center">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRatings.map((rating, index) => (
                    <TableRow 
                      key={rating.id} 
                      className="hover:bg-accent/50 transition-colors"
                      data-testid={`row-rating-${index}`}
                    >
                      <TableCell className="text-muted-foreground">
                        {formatDate(rating.date)}
                      </TableCell>
                      <TableCell className="text-center">{rating.mind}</TableCell>
                      <TableCell className="text-center">{rating.body}</TableCell>
                      <TableCell className={`text-center font-medium ${
                        currentFocusTheme?.pillar === 'career' ? 'text-chart-3' : ''
                      }`}>
                        {rating.career}
                      </TableCell>
                      <TableCell className="text-center">{rating.skills}</TableCell>
                      <TableCell className="text-center">{rating.finance}</TableCell>
                      <TableCell className="text-center font-medium">
                        {calculateDailyScore(rating)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <i className="fas fa-table text-4xl text-muted-foreground mb-4"></i>
              <p className="text-muted-foreground">No rating data available</p>
              <p className="text-sm text-muted-foreground">Start tracking your daily ratings to see historical data</p>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}

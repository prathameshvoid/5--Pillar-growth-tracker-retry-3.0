import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getNextMonthYear, getPillarIcon, getPillarColor } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useFocusTheme, useFocusThemes, useSaveFocusTheme } from "@/lib/localQueries";
import { dataManager } from "@/lib/localStorage";
import type { FocusTheme, PillarType } from "@shared/schema";

const pillars: { value: PillarType; label: string; description: string }[] = [
  { value: "mind", label: "Mind", description: "Meditation, learning, focus" },
  { value: "body", label: "Body", description: "Exercise, nutrition, sleep" },
  { value: "career", label: "Career", description: "Work progress, networking" },
  { value: "skills", label: "Skills", description: "Learning, practice, growth" },
  { value: "finance", label: "Finance", description: "Budgeting, savings, investing" }
];

export default function Settings() {
  const { toast } = useToast();
  const { month: nextMonth, year: nextYear } = getNextMonthYear();
  
  const [selectedPillar, setSelectedPillar] = useState<PillarType | "">("");

  // Fetch current focus theme for next month
  const { data: nextMonthTheme, isLoading } = useFocusTheme(nextMonth, nextYear);

  // Fetch all focus themes for history
  const { data: focusHistory = [] } = useFocusThemes();

  // Set initial selected pillar when data loads
  useEffect(() => {
    if (nextMonthTheme && !selectedPillar) {
      setSelectedPillar(nextMonthTheme.pillar as PillarType);
    }
  }, [nextMonthTheme, selectedPillar]);

  // Save focus theme mutation
  const saveFocusThemeMutation = useSaveFocusTheme();

  // Add success/error handling
  useEffect(() => {
    if (saveFocusThemeMutation.isSuccess) {
      toast({
        title: "Focus theme updated",
        description: `Your focus theme has been set to ${selectedPillar} for ${new Date(nextYear, nextMonth - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}.`
      });
    }
    if (saveFocusThemeMutation.isError) {
      toast({
        title: "Error",
        description: "Failed to update focus theme. Please try again.",
        variant: "destructive"
      });
    }
  }, [saveFocusThemeMutation.isSuccess, saveFocusThemeMutation.isError, selectedPillar, nextMonth, nextYear, toast]);

  const handleSaveFocusTheme = () => {
    if (selectedPillar) {
      saveFocusThemeMutation.mutate({
        month: nextMonth,
        year: nextYear,
        pillar: selectedPillar
      });
    }
  };

  const handleExportData = () => {
    const data = dataManager.exportAll();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `growth-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Data exported",
      description: "Your growth tracker data has been downloaded as a backup file."
    });
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const result = dataManager.importAll(content);
      
      if (result.success) {
        toast({
          title: "Data imported",
          description: result.message
        });
        // Refresh the page to reload all data
        window.location.reload();
      } else {
        toast({
          title: "Import failed",
          description: result.message,
          variant: "destructive"
        });
      }
    };
    reader.readAsText(file);
    
    // Reset the input
    event.target.value = '';
  };

  const getMonthYearLabel = (month: number, year: number) => {
    return new Date(year, month - 1).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <i className="fas fa-spinner fa-spin text-4xl text-muted-foreground mb-4"></i>
            <p className="text-muted-foreground">Loading settings...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Manage your focus themes and preferences</p>
      </div>

      <div className="space-y-6">
        {/* Focus Theme Selection */}
        <Card>
          <CardHeader>
            <CardTitle>
              Set Focus Theme for {getMonthYearLabel(nextMonth, nextYear)}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Choose one pillar to focus extra attention on next month. This will be highlighted throughout the app.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Pillar Grid Selection */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {pillars.map((pillar) => (
                <button
                  key={pillar.value}
                  onClick={() => setSelectedPillar(pillar.value)}
                  className={cn(
                    "p-4 border rounded-lg transition-all duration-200 text-center",
                    "hover:bg-accent hover:shadow-md hover:-translate-y-1",
                    selectedPillar === pillar.value
                      ? "border-2 border-primary bg-primary/10"
                      : "border-border bg-background"
                  )}
                  data-testid={`button-pillar-${pillar.value}`}
                >
                  <i className={cn(
                    "fas block mb-2 text-2xl",
                    getPillarIcon(pillar.value),
                    selectedPillar === pillar.value 
                      ? "text-primary" 
                      : getPillarColor(pillar.value)
                  )}></i>
                  <div className={cn(
                    "font-medium text-sm mb-1",
                    selectedPillar === pillar.value ? "text-primary" : "text-foreground"
                  )}>
                    {pillar.label}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {pillar.description}
                  </div>
                </button>
              ))}
            </div>

            {/* Alternative Dropdown Selection */}
            <div className="md:hidden">
              <label className="block text-sm font-medium text-foreground mb-2">
                Or select from dropdown:
              </label>
              <Select 
                value={selectedPillar} 
                onValueChange={(value: PillarType) => setSelectedPillar(value)}
                data-testid="select-focus-pillar"
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a pillar to focus on" />
                </SelectTrigger>
                <SelectContent>
                  {pillars.map((pillar) => (
                    <SelectItem key={pillar.value} value={pillar.value}>
                      {pillar.label} - {pillar.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end">
              <Button
                onClick={handleSaveFocusTheme}
                disabled={!selectedPillar || saveFocusThemeMutation.isPending}
                data-testid="button-save-focus-theme"
              >
                {saveFocusThemeMutation.isPending ? "Saving..." : "Update Focus Theme"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Focus Theme History */}
        <Card>
          <CardHeader>
            <CardTitle>Focus Theme History</CardTitle>
          </CardHeader>
          <CardContent>
            {focusHistory.length > 0 ? (
              <div className="space-y-3">
                {focusHistory.map((theme) => (
                  <div 
                    key={theme.id}
                    className="flex items-center justify-between p-3 bg-accent rounded-lg"
                    data-testid={`history-item-${theme.id}`}
                  >
                    <div className="flex items-center space-x-3">
                      <i className={cn("fas", getPillarIcon(theme.pillar), getPillarColor(theme.pillar))}></i>
                      <div>
                        <span className="font-medium capitalize">{theme.pillar}</span>
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {getMonthYearLabel(theme.month, theme.year)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <i className="fas fa-history text-4xl text-muted-foreground mb-4"></i>
                <p className="text-muted-foreground">No focus theme history</p>
                <p className="text-sm text-muted-foreground">Set your first focus theme to start building history</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle>Data Management</CardTitle>
            <p className="text-sm text-muted-foreground">
              Export your data as a backup file or import from a previous backup.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={handleExportData}
                className="flex-1"
                data-testid="button-export-data"
              >
                📥 Export Data
              </Button>
              
              <div className="flex-1">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportData}
                  className="hidden"
                  id="import-file"
                />
                <Button 
                  asChild
                  variant="outline"
                  className="w-full"
                  data-testid="button-import-data"
                >
                  <label htmlFor="import-file" className="cursor-pointer">
                    📤 Import Data
                  </label>
                </Button>
              </div>
            </div>
            
            <div className="text-xs text-muted-foreground bg-accent rounded-lg p-3">
              <p className="font-medium mb-1">Storage Info:</p>
              <p>• Data size: {dataManager.getStorageSize()}</p>
              <p>• Location: Browser local storage</p>
              <p>• Backup recommended: Export regularly to save your progress</p>
            </div>
          </CardContent>
        </Card>

        {/* App Information */}
        <Card>
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p className="mb-2">
                <strong>5-Pillar Growth Tracker</strong> helps you track and improve across five key areas of life:
                Mind, Body, Career, Skills, and Finance.
              </p>
              <ul className="space-y-1 ml-4 list-disc">
                <li>Rate each pillar daily on a 1-5 scale</li>
                <li>View trends and analytics over time</li>
                <li>Focus on one pillar each month for extra attention</li>
                <li>Reflect weekly on your progress and adjustments</li>
              </ul>
            </div>
            
            <div className="pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground">
                Daily ratings are converted to a 100-point status score (average ÷ 5 × 100).
                All data is stored locally in your browser and works completely offline.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

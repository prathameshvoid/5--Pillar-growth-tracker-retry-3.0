import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertWeeklyReflectionSchema, type InsertWeeklyReflection } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useSaveWeeklyReflection } from "@/lib/localQueries";
import { useEffect } from "react";

interface WeeklyReflectionFormProps {
  weekStartDate: string;
  initialData?: InsertWeeklyReflection;
}

export function WeeklyReflectionForm({ weekStartDate, initialData }: WeeklyReflectionFormProps) {
  const { toast } = useToast();

  const form = useForm<InsertWeeklyReflection>({
    resolver: zodResolver(insertWeeklyReflectionSchema),
    defaultValues: initialData || {
      weekStartDate,
      wentWell: "",
      didntGoWell: "",
      adjustment: ""
    }
  });

  const saveReflectionMutation = useSaveWeeklyReflection();

  // Add success/error handling
  useEffect(() => {
    if (saveReflectionMutation.isSuccess) {
      toast({
        title: "Reflection saved",
        description: "Your weekly reflection has been saved successfully."
      });
    }
    if (saveReflectionMutation.isError) {
      toast({
        title: "Error",
        description: "Failed to save reflection. Please try again.",
        variant: "destructive"
      });
    }
  }, [saveReflectionMutation.isSuccess, saveReflectionMutation.isError, toast]);

  const onSubmit = (data: InsertWeeklyReflection) => {
    saveReflectionMutation.mutate(data);
  };

  const formatWeekRange = (weekStart: string) => {
    const start = new Date(weekStart);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-card-foreground">Weekly Reflection</h2>
        <span className="text-sm text-muted-foreground">
          Week of {formatWeekRange(weekStartDate)}
        </span>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" data-testid="weekly-reflection-form">
          <FormField
            control={form.control}
            name="wentWell"
            render={({ field }) => (
              <FormItem>
                <FormLabel>What went well this week?</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Reflect on your wins and positive moments..."
                    className="resize-none h-24"
                    data-testid="input-went-well"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="didntGoWell"
            render={({ field }) => (
              <FormItem>
                <FormLabel>What didn't go well?</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Identify challenges and areas for improvement..."
                    className="resize-none h-24"
                    data-testid="input-didnt-go-well"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="adjustment"
            render={({ field }) => (
              <FormItem>
                <FormLabel>What one thing will you adjust next week?</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Choose one specific improvement to focus on..."
                    className="resize-none h-24"
                    data-testid="input-adjustment"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={saveReflectionMutation.isPending}
              data-testid="button-save-reflection"
            >
              {saveReflectionMutation.isPending ? "Saving..." : "Save Reflection"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

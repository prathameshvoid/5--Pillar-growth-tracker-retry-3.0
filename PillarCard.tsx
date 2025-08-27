import { cn, getPillarIcon, getPillarColor } from "@/lib/utils";
import type { PillarType } from "@shared/schema";

interface PillarCardProps {
  pillar: PillarType;
  title: string;
  description: string;
  rating: number;
  onRatingChange: (rating: number) => void;
  isFocus?: boolean;
  disabled?: boolean;
}

const pillarTitles: Record<PillarType, string> = {
  mind: "Mind",
  body: "Body", 
  career: "Career",
  skills: "Skills",
  finance: "Finance"
};

const pillarDescriptions: Record<PillarType, string> = {
  mind: "Meditation, learning, focus",
  body: "Exercise, nutrition, sleep",
  career: "Work progress, networking",
  skills: "Learning, practice, growth",
  finance: "Budgeting, savings, investing"
};

export function PillarCard({
  pillar,
  title = pillarTitles[pillar],
  description = pillarDescriptions[pillar],
  rating,
  onRatingChange,
  isFocus = false,
  disabled = false
}: PillarCardProps) {
  return (
    <div
      className={cn(
        "pillar-card bg-accent rounded-lg p-4 border border-border transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
        isFocus && "focus-pillar border-2 border-chart-3 bg-gradient-to-br from-chart-3/10 to-transparent"
      )}
      data-testid={`pillar-card-${pillar}`}
    >
      <div className="flex items-center space-x-2 mb-3">
        <i className={cn("fas", getPillarIcon(pillar), getPillarColor(pillar))}></i>
        <h3 className="font-medium text-accent-foreground">{title}</h3>
        {isFocus && (
          <i className="fas fa-star text-xs text-chart-3" title="Focus Theme"></i>
        )}
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between space-x-1">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              onClick={() => !disabled && onRatingChange(value)}
              disabled={disabled}
              className={cn(
                "rating-button w-8 h-8 rounded border border-border text-xs transition-all duration-200",
                "hover:bg-primary hover:text-primary-foreground hover:-translate-y-1 hover:shadow-md",
                rating === value
                  ? "selected bg-primary text-primary-foreground"
                  : "bg-background text-foreground",
                disabled && "opacity-50 cursor-not-allowed hover:transform-none hover:shadow-none"
              )}
              data-testid={`rating-button-${pillar}-${value}`}
              data-rating={value}
            >
              {value}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

import { Link, useLocation } from "wouter";
import { useTheme } from "./ThemeProvider";
import { cn } from "@/lib/utils";

export function Navigation() {
  const [location] = useLocation();
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { href: "/", label: "Dashboard", icon: "fa-chart-line" },
    { href: "/analytics", label: "Analytics", icon: "fa-chart-bar" },
    { href: "/reflections", label: "Reflections", icon: "fa-journal-whills" },
    { href: "/settings", label: "Settings", icon: "fa-cog" }
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <i className="fas fa-chart-line text-2xl text-primary"></i>
              <h1 className="text-xl font-bold text-foreground">5-Pillar Growth Tracker</h1>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                data-testid={`nav-${item.label.toLowerCase()}`}
              >
                <div
                  className={cn(
                    "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    location === item.href
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <i className={`fas ${item.icon} text-sm`}></i>
                  <span>{item.label}</span>
                </div>
              </Link>
            ))}
          </nav>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md border border-border hover:bg-accent transition-colors"
              data-testid="theme-toggle"
            >
              <i className={`fas ${theme === 'dark' ? 'fa-sun' : 'fa-moon'} text-sm`}></i>
            </button>
            <div className="text-sm text-muted-foreground">
              <span data-testid="current-date">
                {new Date().toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
            </div>
          </div>
        </div>
        
        {/* Mobile navigation */}
        <div className="md:hidden border-t border-border">
          <div className="flex justify-around py-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                data-testid={`mobile-nav-${item.label.toLowerCase()}`}
              >
                <div
                  className={cn(
                    "flex flex-col items-center space-y-1 px-3 py-2 rounded-md text-xs font-medium transition-colors",
                    location === item.href
                      ? "text-primary"
                      : "text-muted-foreground hover:text-primary"
                  )}
                >
                  <i className={`fas ${item.icon} text-sm`}></i>
                  <span>{item.label}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}

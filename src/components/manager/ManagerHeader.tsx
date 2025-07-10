import { Settings } from "lucide-react";

export const ManagerHeader = () => {
  return (
    <div className="border-b border-border bg-card/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold gradient-text flex items-center gap-3">
              <Settings className="w-8 h-8" />
              Manager Dashboard
            </h1>
            <p className="text-muted-foreground">Blockchain package management system</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="connection-indicator flex items-center gap-2 px-3 py-2 bg-success/20 rounded-lg">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse-glow"></div>
              <span className="text-sm font-medium">Live</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
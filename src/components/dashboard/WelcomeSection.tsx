
import React from "react";
import { User } from "lucide-react";

interface WelcomeSectionProps {
  username?: string;
}

export function WelcomeSection({ username = "Admin" }: WelcomeSectionProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
          <User className="h-6 w-6 text-purple-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {username}</h1>
          <p className="text-muted-foreground">Here's what's happening with your business today</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-medium">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>
    </div>
  );
}

import React from 'react';
import { Card, CardContent } from './ui/card';

export function LoadingSpinner() {
  return (
    <div className="h-screen w-full flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center justify-center p-8 space-y-4">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          </div>
          
          <div className="text-center space-y-2">
            <h2 className="text-xl font-semibold text-primary">CSU PMO Dashboard</h2>
            <p className="text-muted-foreground">Loading project management system...</p>
          </div>
          
          {/* Progress dots animation */}
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
          
          <div className="text-xs text-muted-foreground text-center">
            <p>Initializing authentication...</p>
            <p className="mt-1">Caraga State University Project Management Office</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
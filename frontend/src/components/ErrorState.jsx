import React from 'react';
import { AlertCircle, RefreshCcw } from 'lucide-react';

export default function ErrorState({ message = "Something went wrong.", onRetry }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-muted/20 rounded-3xl border border-border/50">
      <div className="h-16 w-16 bg-rose-500/10 rounded-full flex items-center justify-center mb-4 text-rose-500">
        <AlertCircle size={32} />
      </div>
      <h3 className="text-xl font-bold font-display mb-2 text-foreground">Oops!</h3>
      <p className="text-muted-foreground max-w-sm mb-6 text-sm">{message}</p>
      
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-full font-medium hover:bg-primary/90 transition-colors shadow-sm"
        >
          <RefreshCcw size={16} /> Try Again
        </button>
      )}
    </div>
  );
}

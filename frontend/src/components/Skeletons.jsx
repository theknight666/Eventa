import React from "react";

export function CardSkeleton() {
  return (
    <div className="rounded-3xl border border-border bg-card overflow-hidden">
      <div className="aspect-[16/10] skeleton" />
      <div className="p-5 space-y-3">
        <div className="h-3 w-1/3 rounded skeleton" />
        <div className="h-5 w-4/5 rounded skeleton" />
        <div className="h-5 w-2/3 rounded skeleton" />
        <div className="h-4 w-1/2 rounded skeleton" />
      </div>
    </div>
  );
}

export function GridSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

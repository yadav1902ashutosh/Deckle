import React from "react";

/**
 * Skeleton placeholder for BookCard
 */
export function BookCardSkeleton() {
  return (
    <div className="bg-card rounded-xl p-4 border border-border-subtle shadow-xs animate-pulse flex flex-col justify-between">
      <div>
        <div className="flex gap-4">
          {/* Cover Placeholder */}
          <div className="w-24 h-32 rounded bg-tag flex-shrink-0" />

          {/* Book Metadata Skeletons */}
          <div className="flex-1 space-y-2 py-1">
            <div className="h-4 bg-tag rounded w-3/4" />
            <div className="h-3 bg-tag/80 rounded w-1/2" />
            <div className="h-3 bg-tag/60 rounded w-1/3 pt-1" />

            <div className="flex items-center gap-2 pt-2">
              <div className="h-4 bg-tag rounded w-14" />
              <div className="h-4 bg-tag rounded w-16" />
            </div>
          </div>
        </div>

        {/* Synopsis lines */}
        <div className="space-y-1.5 mt-3 pt-1">
          <div className="h-3 bg-tag/70 rounded w-full" />
          <div className="h-3 bg-tag/50 rounded w-4/5" />
        </div>
      </div>

      {/* Footer skeleton */}
      <div className="pt-3 mt-3 border-t border-border-subtle flex items-center justify-between">
        <div className="h-3 bg-tag rounded w-32" />
        <div className="h-3 bg-tag/60 rounded w-12" />
      </div>
    </div>
  );
}

/**
 * Skeleton placeholder for HeroSpotlight
 */
export function HeroSpotlightSkeleton() {
  return (
    <section className="relative w-full bg-card border-b border-border-subtle p-6 sm:p-10 animate-pulse">
      <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 flex flex-col lg:flex-row items-center lg:items-start gap-8 lg:gap-12">
        {/* Cover Skeleton */}
        <div className="w-64 h-88 sm:w-72 sm:h-96 rounded-lg bg-tag flex-shrink-0 shadow-lg" />

        {/* Details Skeleton */}
        <div className="flex-1 space-y-4 w-full">
          <div className="flex items-center gap-3">
            <div className="h-4 bg-tag rounded w-28" />
            <div className="h-4 bg-tag/60 rounded w-20" />
          </div>

          <div className="h-8 sm:h-10 bg-tag rounded w-3/4" />
          <div className="h-4 bg-tag/70 rounded w-1/3" />

          {/* Metrics row */}
          <div className="flex gap-4 py-2">
            <div className="h-7 bg-tag rounded w-20" />
            <div className="h-7 bg-tag rounded w-24" />
            <div className="h-7 bg-tag rounded w-24" />
          </div>

          {/* Paragraph lines */}
          <div className="space-y-2 max-w-2xl py-2">
            <div className="h-3.5 bg-tag/80 rounded w-full" />
            <div className="h-3.5 bg-tag/80 rounded w-11/12" />
            <div className="h-3.5 bg-tag/60 rounded w-3/4" />
          </div>

          {/* Tag pills */}
          <div className="flex gap-2 py-2">
            <div className="h-6 bg-tag rounded w-20" />
            <div className="h-6 bg-tag rounded w-24" />
            <div className="h-6 bg-tag rounded w-28" />
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-2">
            <div className="h-10 bg-tag rounded-lg w-36" />
            <div className="h-10 bg-tag rounded-lg w-32" />
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Skeleton placeholder for AuthorChannelPage
 */
export function AuthorChannelSkeleton() {
  return (
    <div className="w-full min-h-screen bg-page animate-pulse pb-16">
      {/* Banner */}
      <div className="w-full h-44 sm:h-64 lg:h-72 bg-tag" />

      {/* Header Info */}
      <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border-subtle/40">
          <div className="flex flex-col sm:flex-row sm:items-end gap-5">
            {/* Avatar elevates into banner */}
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-tag border-4 border-page shadow-xl shrink-0 -mt-12 sm:-mt-16 lg:-mt-20" />

            <div className="space-y-2 sm:pb-2">
              <div className="h-7 bg-tag rounded w-48" />
              <div className="h-4 bg-tag/70 rounded w-32" />
              <div className="h-3 bg-tag/50 rounded w-64" />
            </div>
          </div>

          <div className="flex gap-3">
            <div className="h-10 bg-tag rounded-xl w-32" />
            <div className="h-10 bg-tag rounded-xl w-10" />
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="flex gap-8 py-3 border-b border-border-subtle/40">
          <div className="h-5 bg-tag rounded w-16" />
          <div className="h-5 bg-tag rounded w-20" />
          <div className="h-5 bg-tag rounded w-24" />
          <div className="h-5 bg-tag rounded w-16" />
        </div>

        {/* Grid of cards */}
        <div className="py-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <BookCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton placeholder for BookDetailsPage
 */
export function BookDetailsSkeleton() {
  return (
    <div className="w-full min-h-screen bg-page animate-pulse py-8">
      <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 space-y-8">
        {/* Breadcrumb skeleton */}
        <div className="h-4 bg-tag rounded w-48" />

        {/* Hero Banner / Card */}
        <div className="bg-card rounded-2xl p-6 sm:p-10 border border-border-subtle flex flex-col md:flex-row gap-8">
          <div className="w-52 h-76 rounded-xl bg-tag shrink-0 shadow-md" />

          <div className="flex-1 space-y-4">
            <div className="h-4 bg-tag rounded w-24" />
            <div className="h-8 bg-tag rounded w-2/3" />
            <div className="h-4 bg-tag/70 rounded w-1/3" />

            <div className="flex gap-4 py-2">
              <div className="h-6 bg-tag rounded w-20" />
              <div className="h-6 bg-tag rounded w-24" />
              <div className="h-6 bg-tag rounded w-24" />
            </div>

            <div className="space-y-2 py-2">
              <div className="h-3.5 bg-tag/80 rounded w-full" />
              <div className="h-3.5 bg-tag/80 rounded w-5/6" />
              <div className="h-3.5 bg-tag/60 rounded w-2/3" />
            </div>

            <div className="flex gap-3 pt-3">
              <div className="h-11 bg-tag rounded-xl w-36" />
              <div className="h-11 bg-tag rounded-xl w-36" />
            </div>
          </div>
        </div>

        {/* Tabs & chapters outline */}
        <div className="bg-card rounded-2xl p-6 border border-border-subtle space-y-4">
          <div className="h-6 bg-tag rounded w-40" />
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((idx) => (
              <div key={idx} className="h-12 bg-tag/40 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton placeholder for generic list widget (e.g. Rankings or Pulse)
 */
export function ListWidgetSkeleton({ count = 5 }) {
  return (
    <div className="bg-card rounded-xl p-5 border border-border-subtle space-y-3 animate-pulse">
      <div className="h-5 bg-tag rounded w-1/2" />
      <div className="space-y-2 pt-2">
        {Array.from({ length: count }).map((_, idx) => (
          <div key={idx} className="flex items-center gap-3 py-1.5">
            <div className="w-5 h-5 bg-tag rounded shrink-0" />
            <div className="flex-1 space-y-1">
              <div className="h-3.5 bg-tag rounded w-3/4" />
              <div className="h-2.5 bg-tag/60 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

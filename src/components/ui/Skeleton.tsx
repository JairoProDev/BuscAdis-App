import { cn } from '@/lib/utils';

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-gray-200', className)}
      {...props}
    />
  );
}

export { Skeleton };

export function SkeletonCard() {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-md overflow-hidden animate-pulse">
      <div className="h-56 bg-slate-700/50 relative">
        {/* Shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-600/10 to-transparent"></div>
      </div>
      <div className="p-4 space-y-2">
        <div className="h-5 bg-slate-700/50 rounded w-3/4"></div>
        <div className="h-4 bg-slate-700/50 rounded w-1/2"></div>
        <div className="flex justify-between items-center mt-2">
          <div className="h-4 bg-slate-700/50 rounded w-1/3"></div>
          <div className="h-4 bg-slate-700/50 rounded w-1/4"></div>
        </div>
        <div className="flex justify-start mt-1">
          <div className="h-3 bg-slate-700/50 rounded w-20"></div>
        </div>
      </div>
    </div>
  );
}

export function SkeletonText({ width = "w-full", height = "h-4" }) {
  return <div className={`${width} ${height} bg-slate-700/50 rounded animate-pulse`}></div>;
}

export function SkeletonCategoryButton() {
  return (
    <div className="flex flex-col items-center min-w-[80px] max-w-[80px] animate-pulse">
      <div className="w-10 h-10 bg-slate-800/60 rounded-lg mb-2"></div>
      <div className="h-3 w-16 bg-slate-800/60 rounded-md"></div>
      <div className="h-2 w-8 bg-slate-800/40 rounded-md mt-1"></div>
    </div>
  );
}

export function SkeletonFilterChip() {
  return <div className="h-8 w-24 bg-slate-800/60 rounded-full animate-pulse"></div>;
}

export function SkeletonRelatedPublication() {
  return (
    <div className="border border-slate-700 bg-slate-800/60 rounded-lg overflow-hidden animate-pulse">
      <div className="h-36 w-full bg-slate-700/50"></div>
      <div className="p-3 space-y-2">
        <div className="h-4 w-full bg-slate-700/50 rounded"></div>
        <div className="h-4 w-2/3 bg-slate-700/50 rounded"></div>
        <div className="mt-2 flex items-center justify-between">
          <div className="h-4 w-16 bg-slate-700/50 rounded"></div>
          <div className="h-3 w-16 bg-slate-700/50 rounded"></div>
        </div>
        <div className="h-3 w-24 bg-slate-700/50 rounded"></div>
      </div>
    </div>
  );
}

export function SkeletonSearchResult() {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow animate-pulse">
      <div className="h-56 bg-slate-700/50 relative">
        {/* Shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-600/10 to-transparent"></div>
      </div>
      <div className="p-4 space-y-2">
        <div className="h-5 bg-slate-700/50 rounded w-3/4"></div>
        <div className="h-4 bg-slate-700/50 rounded w-1/2"></div>
        <div className="flex justify-between items-center mt-2">
          <div className="h-4 bg-slate-700/50 rounded w-1/3"></div>
          <div className="h-4 bg-slate-700/50 rounded w-1/4"></div>
        </div>
      </div>
    </div>
  );
}

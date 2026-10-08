import SkeletonGrid from "@/components/Skeleton";

export default function RootLoading() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10" aria-busy="true" aria-label="Loading page">
      <div className="h-8 w-56 rounded-lg bg-gray-200 animate-pulse mb-4" />
      <div className="h-4 w-80 rounded bg-gray-100 animate-pulse mb-8" />
      <SkeletonGrid count={6} />
    </div>
  );
}

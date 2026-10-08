import SkeletonGrid from "@/components/Skeleton";

export default function PropertiesLoading() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10" aria-busy="true" aria-label="Loading properties">
      <div className="h-8 w-56 rounded-lg bg-gray-200 animate-pulse mb-4" />
      <div className="h-11 w-full max-w-md rounded-xl bg-gray-100 animate-pulse mb-8" />
      <SkeletonGrid count={6} />
    </div>
  );
}

import { LucideIcon, SearchX } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

/** Friendly placeholder for empty lists (no results, no data yet). */
export default function EmptyState({
  icon: Icon = SearchX,
  title,
  message,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="animate-fade-in flex flex-col items-center justify-center text-center py-14 px-6">
      <div className="w-14 h-14 rounded-full bg-brand-50 flex items-center justify-center mb-4">
        <Icon className="text-brand-500" size={26} />
      </div>
      <h3 className="font-semibold text-lg mb-1">{title}</h3>
      {message && <p className="text-sm text-gray-500 max-w-sm mb-4">{message}</p>}
      {actionLabel && onAction && (
        <button className="btn-secondary" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}

import { Loader2 } from "lucide-react";

export default function Loader({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 text-gray-500 py-10">
      <Loader2 className="animate-spin" size={20} />
      <span>{label}</span>
    </div>
  );
}

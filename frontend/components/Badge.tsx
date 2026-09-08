import clsx from "clsx";

const COLORS: Record<string, string> = {
  AVAILABLE: "bg-green-100 text-green-700",
  ACTIVE: "bg-green-100 text-green-700",
  APPROVED: "bg-green-100 text-green-700",
  PAID: "bg-green-100 text-green-700",
  RESOLVED: "bg-green-100 text-green-700",
  COMPLETED: "bg-green-100 text-green-700",

  PENDING: "bg-yellow-100 text-yellow-700",
  UNDER_REVIEW: "bg-yellow-100 text-yellow-700",
  OPEN: "bg-yellow-100 text-yellow-700",
  RESERVED: "bg-yellow-100 text-yellow-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700",

  REJECTED: "bg-red-100 text-red-700",
  OVERDUE: "bg-red-100 text-red-700",
  TERMINATED: "bg-red-100 text-red-700",
  OCCUPIED: "bg-gray-200 text-gray-700",
  ENDED: "bg-gray-200 text-gray-700",
  INACTIVE: "bg-gray-200 text-gray-700",
  MAINTENANCE: "bg-orange-100 text-orange-700",
};

export default function Badge({ status }: { status: string }) {
  return (
    <span className={clsx("badge", COLORS[status] || "bg-gray-100 text-gray-700")}>
      {status.replace(/_/g, " ")}
    </span>
  );
}

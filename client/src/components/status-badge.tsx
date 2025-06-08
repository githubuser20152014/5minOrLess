import { Badge } from "@/components/ui/badge";
import { Status } from "@/../../shared/schema";

interface StatusBadgeProps {
  status: Status;
  size?: "sm" | "default";
}

export function StatusBadge({ status, size = "default" }: StatusBadgeProps) {
  const getStatusConfig = (status: Status) => {
    switch (status) {
      case "Complete":
        return {
          variant: "default" as const,
          className: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700/50",
          label: "Complete"
        };
      case "In Progress":
        return {
          variant: "default" as const,
          className: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700/50",
          label: "In Progress"
        };
      case "Blocked":
        return {
          variant: "default" as const,
          className: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700/50",
          label: "Blocked"
        };
      case "Deferred":
        return {
          variant: "default" as const,
          className: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700/50",
          label: "Deferred"
        };
      case "Not Started":
      default:
        return {
          variant: "secondary" as const,
          className: "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800/50 dark:text-slate-400 dark:border-slate-700/50",
          label: "Not Started"
        };
    }
  };

  const config = getStatusConfig(status);
  const sizeClass = size === "sm" ? "text-xs px-2 py-0.5" : "";

  return (
    <Badge 
      variant={config.variant}
      className={`${config.className} ${sizeClass} font-medium transition-colors`}
    >
      {config.label}
    </Badge>
  );
}
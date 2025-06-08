import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Status, statusValues } from "@/../../shared/schema";
import { StatusBadge } from "./status-badge";

interface StatusSelectorProps {
  value: Status;
  onValueChange: (status: Status) => void;
  disabled?: boolean;
}

export function StatusSelector({ value, onValueChange, disabled = false }: StatusSelectorProps) {
  return (
    <Select 
      value={value} 
      onValueChange={onValueChange}
      disabled={disabled}
    >
      <SelectTrigger className="w-auto min-w-[120px] h-auto p-0 border-none bg-transparent hover:bg-white/50 dark:hover:bg-slate-800/50 rounded-md transition-colors">
        <SelectValue asChild>
          <StatusBadge status={value} size="sm" />
        </SelectValue>
      </SelectTrigger>
      <SelectContent align="start" className="min-w-[140px]">
        {statusValues.map((status) => (
          <SelectItem key={status} value={status} className="cursor-pointer">
            <StatusBadge status={status} size="sm" />
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
import { Badge } from "@/components/ui/badge";
import { STATUS_LABELS, STATUS_COLORS, type LeadStatus } from "@/lib/constants";

export function StatusBadge({ status }: { status: string }) {
  const label = STATUS_LABELS[status as LeadStatus] ?? status;
  const color = STATUS_COLORS[status as LeadStatus] ?? "bg-gray-100 text-gray-800";

  return (
    <Badge variant="secondary" className={`${color} border-0 font-medium`}>
      {label}
    </Badge>
  );
}

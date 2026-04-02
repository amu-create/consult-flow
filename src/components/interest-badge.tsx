import { Badge } from "@/components/ui/badge";
import { getInterestLevel } from "@/lib/constants";

export function InterestBadge({ score }: { score: number }) {
  const { label, color } = getInterestLevel(score);

  return (
    <Badge variant="secondary" className={`${color} border-0 font-medium`}>
      {label} ({score})
    </Badge>
  );
}

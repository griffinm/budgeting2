import { CollapsibleCard } from "@/components/CollapsibleCard";
import { fetchMerchantTagSpendStats } from "@/api";
import { useEffect } from "react";

export function TrendReport({
  tagId,
}: {
  tagId: number;
}) {

  useEffect(() => {
    fetchMerchantTagSpendStats({ tagId }).then();
  }, [tagId]);

  return (
    <CollapsibleCard title="Trend Report" initialState="expanded">
      <h2>Trend Report</h2>
    </CollapsibleCard>
  );
}

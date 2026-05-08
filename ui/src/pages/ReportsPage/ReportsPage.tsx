import { useEffect } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { ReportsView } from "@/views/ReportsView";

export default function ReportsPage() {
  const setPageTitle = usePageTitle();
  useEffect(() => { setPageTitle("Reports"); }, [setPageTitle]);

  return <ReportsView />;
}

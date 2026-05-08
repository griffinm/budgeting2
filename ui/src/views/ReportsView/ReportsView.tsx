import { SixMonthMovingAverage } from "./SixMonthMovingAverage";

export function ReportsView() {
  return (
    <div className="flex flex-col gap-4">
      <h1>Reports</h1>
      <SixMonthMovingAverage />
    </div>
  );
}

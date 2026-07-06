import { HeroBox } from "@/components/HeroBox";
import { Loading } from "@/components/Loading";
import { formatDollars } from "@/utils/currencyUtils";
import { RecurringStream } from "@/utils/types";
import { SimpleGrid } from "@mantine/core";
import { monthlyAmount } from "./frequencyUtils";

export function RecurringSummary({ streams, loading }: { streams: RecurringStream[]; loading: boolean }) {
  if (loading) {
    return <Loading fullHeight={false} />;
  }

  const tracked = streams.filter(s => s.status !== 'dismissed' && s.active);
  const monthlySpend = tracked
    .filter(s => s.averageAmount > 0)
    .reduce((sum, s) => sum + monthlyAmount(s), 0);
  const monthlyIncome = -tracked
    .filter(s => s.averageAmount < 0)
    .reduce((sum, s) => sum + monthlyAmount(s), 0);
  const needsReview = streams.filter(s => s.status === 'suggested').length;

  const cards = [
    { title: "Recurring Spend / mo", value: formatDollars(monthlySpend) },
    { title: "Recurring Income / mo", value: formatDollars(monthlyIncome) },
    { title: "Active Streams", value: String(tracked.length) },
    { title: "Needs Review", value: String(needsReview) },
  ];

  return (
    <HeroBox>
      <SimpleGrid cols={{ base: 2, sm: 4 }} spacing={{ base: 'xl', sm: 'md' }}>
        {cards.map((card, index) => (
          <div key={card.title} className={index > 0 ? "sm:border-l sm:border-white/10 sm:pl-4" : ""}>
            <div className="text-white/90 dark:text-primary-200 text-sm font-medium tracking-wide uppercase mb-1">
              {card.title}
            </div>
            <div className="text-white text-3xl font-bold tracking-tight">
              {card.value}
            </div>
          </div>
        ))}
      </SimpleGrid>
    </HeroBox>
  );
}

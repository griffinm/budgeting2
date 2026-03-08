# Dashboard Redesign

## Summary

Redesign the dashboard page borrowing design elements from the merchant page. Replace the current "card soup" layout with a clear information hierarchy: headline stat cards at the top, then detail sections below.

## Top: Summary Cards

4 cards in a `SimpleGrid` (2 cols mobile, 4 cols desktop) using the merchant `SpendSummary` pattern:

- **Net Worth** - sum of all account balances, no trend indicator
- **Expenses This Month** - current month total, % change vs last month (red/teal with trending icon), sub-text showing "Avg by today: $X" and "Current: $Y"
- **Income This Month** - same pattern as expenses, sub-text with average vs current
- **Profit This Month** - income minus expenses, % change vs last month

Each card: `Paper withBorder p="md" radius="md"`, big number (`size xxl fw 700`), dimmed title, trend indicator.

## Detail Sections

### 1. Account Balances
- `CollapsibleCard`, default collapsed
- Same expandable balance cards inside, unchanged functionality

### 2. Profit & Loss
- `Paper` container (always visible)
- Same chart + table layout
- Header styled like merchant `TrendChart` (title left, month selector right)
- No Card wrapper with icon

### 3. Monthly Trends
- `Paper` container (always visible)
- `SegmentedControl` to toggle between Spend and Income line charts
- Same `MonthlyLineChart` component inside, one chart at a time

## Removed
- MoM Trends section (data merged into summary cards)
- Card + icon/title header pattern (replaced with Paper or CollapsibleCard)

## Files Changed
- `DashboardPage.tsx` - new layout structure
- `MoMTrends.tsx` - deleted
- New `DashboardSummary.tsx` - the 4 summary stat cards
- `ProfitAndLoss.tsx` - remove Card wrapper, restyle header
- `AccountBalances.tsx` - wrap in CollapsibleCard
- Extend existing hooks/utils to compute net worth from account balances

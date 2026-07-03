# Feature Comparison: Bear Budget vs. the Market

A comparison of Bear Budget's feature set against the leading personal-finance apps:
**Monarch Money**, **YNAB**, **Copilot Money**, **Actual Budget**, and **Lunch Money**
(with brief notes on Empower and PocketGuard).

*Researched July 2026. Bear Budget column derived from the current codebase; competitor
details from vendor docs, help centers, and 2026 reviews. Pricing and fast-moving
features (especially AI) may drift — see caveats at the bottom.*

---

## Quick Matrix

| Feature | **Bear Budget** | Monarch | YNAB | Copilot | Actual Budget | Lunch Money |
|---|---|---|---|---|---|---|
| **Bank aggregators** | Plaid only | Plaid + MX + Finicity | Plaid + MX + TrueLayer | Plaid + Finicity | BYO: SimpleFIN, GoCardless, Enable, Akahu, Pluggy | Plaid |
| **Manual accounts** | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Budget model** | Monthly target per leaf category, roll-up to parents | Category or Flex budgeting, rollover | Zero-based envelope | Category, rollover | Zero-based envelope | Category, rollover, multi-currency |
| **Budget rollover** | ❌ | ✅ | ✅ (native) | ✅ | ✅ (native) | ✅ |
| **Rules engine** | Per-merchant defaults only | ✅ Rich | Payee-level only | Name rules + ML | ✅ Rich (regex) | ✅ Rich |
| **Auto-categorization** | Plaid categories + merchant defaults + sign inference | ML-assisted | Payee memory | ML (signature feature) | Rules only | Rules only |
| **Transaction splits** | ✅ | ✅ | ✅ | ✅ (iOS only) | ✅ | ✅ (+ grouping) |
| **Review workflow** | ✅ "Needs review" filter + inline confirm | ✅ Dedicated UI | Approve imports | ✅ Daily inbox (signature) | Reconciliation | Reviewed flag |
| **Merchant grouping** | ✅ With auto-suggestions (unique) | Merchant-level only | Payees | Merchant-level | Payees | Payee rules |
| **Recurring / bills** | `recurring` flag only, no detection or reminders | Auto-detect + Bill Sync | Manual schedules | Auto-detect (strong) | Manual schedules | Auto-detect |
| **Net worth report** | ❌ (balances by type only) | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Cash flow / P&L** | ✅ P&L + moving averages | ✅ (+ Sankey) | ✅ | ✅ | ✅ | ✅ |
| **Custom reports** | Tag reports only | ✅ + CSV export | Limited | ❌ | ✅ Dashboards | Query tool |
| **Investments** | Balance sync only | ✅ Full (+ Morningstar on Plus) | Balances only | ✅ Full | Balances only | Balances + crypto |
| **Goals / debt payoff** | ❌ | ✅ | Targets + Loan Planner | Basic (iOS) | Goal templates | ❌ |
| **Multi-user household** | ✅ Multi-user account + per-connection sharing | ✅ Unlimited + advisor invites | 6 via YNAB Together | ❌ | OIDC multi-login | Budget collaborators |
| **Platforms** | Web + Android | Web/iOS/Android | Web/iOS/Android | iOS/iPad/Mac/Web (no Android) | Self-hosted web/PWA/desktop | Web/iOS/Android |
| **AI features** | ❌ | Assistant + ML | None notable | ML categorization | ❌ | ❌ |
| **CSV export** | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **CSV/OFX import** | ❌ | ✅ | ✅ | Limited | ✅ (+ YNAB migration) | ✅ |
| **Public API** | REST API (own clients; no 3rd-party keys) | ❌ | ✅ Official REST | ❌ | ✅ Node library | ✅ v1 beta, v2 |
| **Push notifications** | ❌ (daily email only) | ✅ | Limited | ✅ Rich | ❌ | Email + apps |
| **Alerts (budget/bills/balance)** | ❌ | ✅ Configurable | Underfunded alerts | ✅ | ❌ | Limited |
| **MFA / password reset** | ❌ | ✅ | ✅ | ✅ | Self-hosted (OIDC) | ✅ |
| **Self-hosting** | ✅ (your own deployment) | ❌ | ❌ | ❌ | ✅ (core identity) | ❌ |
| **Price (2026)** | Free (self-run; Plaid costs) | $99.99/yr Core; $199/yr Plus | $109/yr | $95/yr | Free (open source) | $100/yr |

---

## Where Bear Budget Stands Out

These are genuinely differentiated or above-par relative to the market:

1. **Merchant grouping with auto-suggestions** — grouping related merchants (all Walmart
   variants, etc.) with similarity-, Plaid-entity-, and location-based suggestions and
   combined spend stats. No mainstream competitor has an equivalent; they stop at
   payee renaming.
2. **Transparent classification provenance** — every transaction records *why* it was
   classified (`user` > `merchant_default` > `category_default` > `plaid_category` >
   `sign_inference`), feeding a "needs review" queue. Competitors auto-categorize but
   don't expose the source chain.
3. **Hierarchical income/expense category trees** — typed roots (expense vs. income)
   cascading to descendants, leaf-level budgets rolling up to parents, per-category
   colors and trend sparklines.
4. **Income tracking as a first-class concern** — expected monthly income per income
   category, income moving averages, refund-vs-income distinction, transfer exclusion.
   Most competitors treat income as an afterthought to expense budgeting.
5. **Pace-vs-normal analytics** — per-day-of-month 6-month moving averages with
   cumulative overlays ("are we above or below our normal pace this month") is a more
   sophisticated view than the standard month-to-date bar.
6. **Household connection sharing** — granting another household member access to a
   *specific* linked bank account is finer-grained than most (Monarch shares everything
   with the household).
7. **Data ownership** — self-deployed, audit trails on core models, soft deletes.
   Only Actual Budget competes on this axis, and it has no bank-side Plaid sync
   of comparable quality.
8. **Daily email report with connection-health warnings** — proactive "your bank link
   is broken" surfacing that some paid apps still bury.

---

## Gap Analysis

### Tier 1 — Table stakes (every competitor has these)

| Gap | Notes |
|---|---|
| **Net worth view** | Balance-history-by-type exists; a single assets-minus-liabilities line with history is a small step and the single most universal PFM feature. |
| **CSV export** | Every competitor exports transactions. No `to_csv` anywhere in the codebase. Blocks users' taxes/spreadsheet workflows. |
| **Manual accounts & manual transactions** | Everything must flow through Plaid. Cash spending, unsupported institutions, and one-off assets (car, house) can't be represented. |
| **Password reset / email verification / MFA** | No forgot-password flow exists. A hard blocker for any user beyond the developer's household; MFA is expected for a finance app. |
| **Recurring detection & bill tracking** | A `recurring` boolean exists but nothing detects, forecasts, or reminds. Monarch's Bill Sync (statement balances + due dates) is the high bar; Copilot and Lunch Money auto-detect from history. |
| **iOS app** | Android-only is inverted from the market — Copilot is iOS-only, everyone else ships both. |

### Tier 2 — Competitive differentiators (most competitors have these)

| Gap | Notes |
|---|---|
| **Savings goals / debt payoff** | Monarch maps goals to account balances; YNAB has targets + Loan Planner; Actual has goal templates. Bear Budget has no goal model at all. |
| **Budget rollover** | Unused budget vanishes at month end. Rollover (or full envelope semantics) is now standard even in category-budget apps. |
| **User-defined rules engine** | Per-merchant defaults cover the common case, but "if name contains X → category Y, tag Z" rules (Monarch, Actual, Lunch Money) handle the long tail without per-merchant clicking. |
| **Alerts & push notifications** | No budget-threshold, large-transaction, or low-balance alerts; no FCM in the Android app. The daily email is unconditional and unconfigurable. |
| **Investment holdings** | Balances sync (Plaid supports investments) but no holdings, allocation, or performance. Monarch and Copilot are full-featured here. |
| **CSV/OFX import** | No path to bring in history from another tool or an unsupported bank. Actual even migrates YNAB budgets wholesale. |
| **Mobile feature parity** | The Android app is view-mostly (dashboard, transactions, tags, profile) — no splits, category/budget editing, merchant management, or reconnect flows on mobile. |

### Tier 3 — Frontier features (some competitors have these)

| Gap | Notes |
|---|---|
| **AI assistant / ML categorization** | Monarch shipped a natural-language assistant and weekly AI recap; Copilot's ML categorization learns from corrections. Bear Budget's rule-chain is transparent but static. |
| **Sankey / custom report builder** | Monarch's Sankey and Actual's widget dashboards are popular power-user features; Bear Budget's tag reports are the closest analog. |
| **Multi-aggregator fallback** | Monarch/YNAB route around broken Plaid connections via MX/Finicity. Single-aggregator apps (including Lunch Money) share this limitation. |
| **Multi-currency** | Lunch Money's headline feature. Bear Budget stores currency but is effectively single-currency. |
| **Forecasting / what-if** | Monarch Plus ($199/yr tier) added retirement and scenario forecasting. |
| **Cash-flow calendar** | Monarch and Lunch Money render bills/recurring on a calendar. |

---

## Per-App Snapshots

### Monarch Money — the feature-completeness benchmark
Multi-aggregator sync (Plaid + MX + Finicity), category or Flex budgeting with
rollover, rich rules engine with household-member review assignment, Bill Sync
(statement balances + due dates), full investment tracking, goals, Sankey and custom
reports with CSV export, unlimited household members plus advisor invites, AI
assistant (2026), web/iOS/Android. No public API, no self-hosting.
**$99.99/yr Core, $199/yr Plus.** The closest model to what Bear Budget would look
like "finished" — its household collaboration and merchant/rules workflows overlap
most with Bear Budget's strengths.

### YNAB — the methodology app
Zero-based envelope budgeting is the product; everything else is secondary. Native
rollover, targets, Loan Planner, YNAB Together (6 users), the most mature official
public API, web/iOS/Android. Weak on reporting and investments (balance-only).
**$109/yr.** Bear Budget's monthly-target model is philosophically closer to Monarch
than YNAB; there's little overlap to chase here unless envelope budgeting is a goal.

### Copilot Money — the polish/ML app
Apple-ecosystem-first (iOS/iPad/Mac; web added Dec 2025, still behind; **no Android**).
Signature ML categorization that learns from review swipes, strong recurring
detection, full investment tracking, rich push notifications. No household sharing,
no public API. **$95/yr.** Interesting contrast: Copilot's daily review inbox is the
polished version of Bear Budget's "needs review" filter.

### Actual Budget — the open-source peer
Bear Budget's nearest philosophical neighbor: self-hosted, free, data-owned.
Envelope budgeting, powerful regex rules (can auto-split), schedules, customizable
report dashboards, goal templates, OIDC multi-user, broad file import including
full YNAB migration, official Node API. Bank sync is bring-your-own (SimpleFIN
$15/yr in North America) and weaker than Plaid. **Free, MIT-licensed.** Where Actual
wins on budgeting mechanics and import/export, Bear Budget wins on sync quality,
merchant intelligence, and income analytics.

### Lunch Money — the indie/power-user app
Web-first with official iOS/Android companions (2026), rules engine, recurring
detection, splits *and* grouping, best-in-class multi-currency, crypto balance
syncing, query tool, v2 public API. Solo-developer indie with a strong data-
portability stance. **$100/yr.** The most realistic single-competitor benchmark for
an indie-scale product.

### Briefly: Empower & PocketGuard
**Empower** (free) is a net-worth/investment dashboard with token budgeting — the
benchmark for investment analytics, not budgeting. **PocketGuard** ($74.99/yr Plus)
centers on "In My Pocket" safe-to-spend, bill negotiation, and overspend-pace
alerts — a lighter-touch model than any of the above.

---

## Suggested Priorities

If closing the gap is the goal, roughly in order of impact-to-effort:

1. **Net worth line** — the data (balance history by type) already exists; this is
   mostly a presentation feature.
2. **CSV export** — small, unblocks taxes/spreadsheets, table stakes everywhere.
3. **Password reset + email verification** (and eventually MFA) — prerequisites for
   any user base beyond a trusted household.
4. **Budget rollover** — biggest budgeting-model gap vs. all five competitors.
5. **Recurring detection → bill calendar → reminders** — the `recurring` flag and
   daily email are the seeds; recurring detection from transaction history is the
   highest-value analytics feature missing.
6. **Savings goals** — new model, but conceptually adjacent to existing
   `target_budget` machinery.
7. **Manual accounts/transactions and CSV import** — opens the door to cash
   tracking and migration from other tools.
8. **Push notifications + alert rules** — requires FCM plumbing on Android and a
   notification-preferences model.
9. **Mobile parity / iOS** — largest effort; the web-responsive or PWA route may be
   cheaper than a Swift app.

---

## Caveats

- Competitor facts were gathered July 2026 from vendor docs and reviews; **pricing
  and AI features move fast** — verify before citing externally.
- Unconfirmed items from research: exact scope of Monarch's AI assistant, Copilot's
  Canada coverage, Lunch Money push notifications, Actual's Sankey support.
- Bear Budget facts reflect the codebase as of commit `604070d` (July 2026).

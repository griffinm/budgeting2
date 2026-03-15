# Budgeting Mobile App (Android)

Native Android client for the Budgeting API. Displays financial dashboards, transaction history, tag-based spend analysis, and user profile management.

## Tech Stack

- **Kotlin 2.1.0** / **AGP 8.7.3** / **Gradle 8.11.1**
- **Jetpack Compose** (BOM 2024.12.01) with **Material 3**
- **Retrofit 2.11.0** + **kotlinx.serialization 1.7.3** for networking
- **Hilt 2.53.1** for dependency injection
- **Paging 3** (3.3.5) for infinite scroll
- **Vico 2.0.0-beta.3** for charts
- **AndroidX Security Crypto** for encrypted token storage
- **Coil 3.0.4** for image loading
- **kotlinx-datetime 0.6.1** for date handling
- Compile SDK 35, Min SDK 26, Target SDK 35

## Architecture

MVVM with Repository pattern using StateFlow for reactive UI state.

```
Compose UI → ViewModel → Repository → Retrofit API → Rails Backend
                                         ↓
                                   TokenStore (EncryptedSharedPreferences)
```

## Project Structure

```
app/src/main/java/com/griffin/budgeting/
├── data/
│   ├── local/             # TokenStore (encrypted SharedPreferences)
│   ├── model/             # Data classes for API responses
│   ├── paging/            # TransactionPagingSource (Paging 3)
│   ├── remote/
│   │   ├── api/           # Retrofit API interfaces
│   │   └── interceptor/   # Auth & JSON interceptors
│   └── repository/        # Repository pattern for data access
├── di/                    # Hilt NetworkModule
├── ui/
│   ├── auth/              # Login & Signup screens + ViewModels
│   ├── dashboard/         # Financial overview screen
│   ├── transactions/      # Transaction list with search & filters
│   ├── tags/              # Tag management & spend reports
│   ├── profile/           # User info & logout
│   ├── navigation/        # Navigation routing (Screen, AppNavigation, MainNavigation)
│   ├── theme/             # Material 3 theming (Color, Type, Theme)
│   └── common/            # Shared components (AnimatedCounter, Currency, GlassCard)
├── BudgetingApp.kt        # Hilt Application class
└── MainActivity.kt        # Single-activity entry point
```

## API Integration

- **Base URL:** `http://10.0.2.2:3000/` (Android emulator → host localhost)
- **Auth:** JWT via `x-budgeting-token` header, injected by `AuthInterceptor`
- **Token storage:** AES256-encrypted SharedPreferences
- See [API Endpoints](../../documentation/API.md) for the full backend API reference

### API Interfaces

| Interface | Key Endpoints |
|-----------|--------------|
| `AuthApi` | `POST api/users/login`, `POST api/signup`, `GET api/users/current` |
| `TransactionApi` | `GET api/transactions`, `GET/PATCH api/transactions/{id}` |
| `TagApi` | `GET/POST api/tags`, `GET api/tags/spend_stats` |
| `MerchantCategoryApi` | `GET api/merchant_tags`, `GET api/merchant_tags/spend_stats` |
| `DataApi` | `GET api/data/total_for_date_range`, `profit_and_loss`, `spend_moving_average`, `income_moving_average` |
| `PlaidAccountApi` | `GET api/plaid_accounts` |
| `AccountBalanceApi` | Account balance endpoints |
| `SyncEventApi` | Latest sync event |
| `TagReportApi` | Tag report CRUD |

## Screens

- **Login / Signup** — Email + password auth, error display
- **Dashboard** — Available cash, monthly expenses/income/profit with % change, account balances by type, P&L chart, moving average charts, top 10 spending categories, recent transactions, last sync time
- **Transactions** — Paginated list (25/page) with search (300ms debounce), date range filter, type filter (income/expense), merchant category filter, amount range, tag include/omit, plaid account filter
- **Tags** — Tag list with spend stats, configurable time range (1-24 months), save/load/delete tag reports (filter combinations)
- **Profile** — User info, last sync, logout

## Key Data Models

- `User`, `Transaction`, `Tag`, `TagReport`, `MerchantCategory`, `PlaidAccount`, `AccountBalance`, `MovingAverage`, `ProfitAndLossItem`, `SyncEvent`
- `PaginatedResponse<T>` — items + page info (currentPage, totalPages, totalCount)
- `LoginResponse` / `SignupResponse` — token + user

## Building & Running

```bash
# From apps/mobile-app/
./gradlew assembleDebug        # Build debug APK
./gradlew installDebug         # Install on connected device/emulator

# Requires the Rails API running on localhost:3000
# Emulator accesses host via 10.0.2.2
```

No product flavors — single debug/release build variant. ProGuard is disabled for release builds.

## Testing

```bash
./gradlew test                 # Run unit tests
```

Uses JUnit 5, Turbine (Flow testing), MockWebServer, and Coroutines Test.

Test files cover:
- `LoginViewModelTest` — Login UI state
- `CurrencyTest` — Currency formatting
- `DashboardComputationsTest` — Moving averages, cash calculations
- `TransactionSearchParamsTest` — Query map generation from filters

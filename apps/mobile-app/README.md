# Budgeting - Android App

Native Android client for the [Budgeting API](../../documentation/API.md). Track spending, view financial dashboards, manage tags, and monitor account balances — all from your phone.

## Screenshots

_Coming soon_

## Features

- **Dashboard** — At-a-glance financial overview: available cash, monthly expenses/income/profit with percent change vs. average, account balances grouped by type, P&L and moving average charts, top spending categories
- **Transactions** — Infinite-scroll transaction list with search (debounced), filtering by date range, type, merchant category, amount range, tags, and plaid account
- **Tags** — Create and manage tags, view spend stats over configurable time ranges, save/load filter presets as tag reports
- **Profile** — View account info and last sync time, log out
- **Secure Auth** — JWT tokens stored in AES256-encrypted SharedPreferences

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Language | Kotlin 2.1.0 |
| UI | Jetpack Compose (Material 3) |
| Networking | Retrofit 2.11 + kotlinx.serialization |
| DI | Hilt 2.53 |
| Pagination | Paging 3 |
| Charts | Vico 2.0 |
| Image loading | Coil 3.0 |
| Token storage | AndroidX Security Crypto (AES256) |
| Min SDK | 26 (Android 8.0) |

## Prerequisites

- Android Studio Ladybug or later
- JDK 17
- The Rails API running on `localhost:3000` (the emulator reaches it via `10.0.2.2`)

```bash
# From the repo root — start the backend
docker compose up -d db
foreman start
```

## Building & Running

```bash
cd apps/mobile-app

# Build
./gradlew assembleDebug

# Install on a connected device or emulator
./gradlew installDebug
```

There are no product flavors — just standard debug and release build variants.

## Running Tests

```bash
./gradlew test
```

Tests use JUnit 5, Turbine, MockWebServer, and Coroutines Test.

## Project Structure

```
app/src/main/java/com/griffin/budgeting/
├── data/
│   ├── local/             # Encrypted token storage
│   ├── model/             # API response data classes
│   ├── paging/            # Paging 3 data source
│   ├── remote/
│   │   ├── api/           # Retrofit service interfaces
│   │   └── interceptor/   # Auth & JSON interceptors
│   └── repository/        # Data access layer
├── di/                    # Hilt dependency injection module
├── ui/
│   ├── auth/              # Login & Signup
│   ├── dashboard/         # Financial overview
│   ├── transactions/      # Transaction list & filters
│   ├── tags/              # Tag management & reports
│   ├── profile/           # User profile & logout
│   ├── navigation/        # Screen routes & nav graphs
│   ├── theme/             # Material 3 colors, typography, theme
│   └── common/            # Shared components
├── BudgetingApp.kt        # Application class
└── MainActivity.kt        # Single-activity entry point
```

## Architecture

The app follows **MVVM** with a Repository layer:

```
Compose Screen → ViewModel → Repository → Retrofit → Rails API
                                 ↓
                           TokenStore (EncryptedSharedPreferences)
```

- **ViewModels** expose `StateFlow` for UI state
- **Repositories** coordinate between API calls and local storage
- **Hilt** wires everything together as singletons via `NetworkModule`

## API

The app communicates with the Rails backend over REST. Authentication uses a JWT passed in the `x-budgeting-token` header, automatically injected by `AuthInterceptor`.

See the full [API reference](../../documentation/API.md) for endpoint details.

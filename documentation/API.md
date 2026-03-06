# API Documentation

This documents the REST API endpoints for the budgeting app, scoped to what the mobile app consumes.

## General

- **Base path:** `/api`
- **Auth header:** `x-budgeting-token` — JWT token returned from login
- **Content type:** All requests and responses are JSON
- **Pagination:** Paginated endpoints accept `currentPage` (default 1) and `perPage` (default 25) query params. Responses include a `page` object:

```json
{
  "page": {
    "currentPage": 1,
    "totalPages": 10,
    "totalCount": 243
  }
}
```

- **Error responses:** Unauthorized requests return `401` with `{ "error": "Unauthorized" }`. Validation errors return `422` with `{ "errors": ["..."] }`.

---

## 1. Authentication

### POST /api/users/login

Log in with email and password. No auth header required.

**Request body:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**

```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "Jane",
    "lastName": "Doe",
    "accountId": 1,
    "createdAt": "2025-01-15T12:00:00.000Z",
    "linkedAccounts": 3
  },
  "token": "eyJhbGciOiJIUzI1NiJ9..."
}
```

**Error (401):**

```json
{
  "messages": ["Invalid email or password"]
}
```

---

### GET /api/users/current

Get the currently authenticated user. Also serves as token validation — a `401` means the token is expired or invalid.

**Auth required:** Yes

**Response (200):**

```json
{
  "id": 1,
  "email": "user@example.com",
  "firstName": "Jane",
  "lastName": "Doe",
  "accountId": 1,
  "createdAt": "2025-01-15T12:00:00.000Z",
  "linkedAccounts": 3
}
```

---

## 2. Profile

### PATCH /api/users/current

Update the current user's profile. Returns the updated user and a new JWT token (since user data is embedded in the token).

**Auth required:** Yes

**Request body:** (all fields optional)

```json
{
  "user": {
    "email": "new@example.com",
    "first_name": "Jane",
    "last_name": "Doe",
    "password": "newpassword123"
  }
}
```

**Response (200):**

```json
{
  "user": {
    "id": 1,
    "email": "new@example.com",
    "firstName": "Jane",
    "lastName": "Doe",
    "accountId": 1,
    "createdAt": "2025-01-15T12:00:00.000Z",
    "linkedAccounts": 3
  },
  "token": "eyJhbGciOiJIUzI1NiJ9..."
}
```

**Error (422):**

```json
{
  "errors": ["Email has already been taken"]
}
```

---

## 3. Transactions

### GET /api/transactions

List transactions with filtering and pagination.

**Auth required:** Yes

**Query params:**

| Param | Type | Description |
|---|---|---|
| `currentPage` | integer | Page number (default 1) |
| `perPage` | integer | Items per page (default 25) |
| `start_date` | date | Filter from this date |
| `end_date` | date | Filter to this date |
| `merchant_id` | integer | Filter by merchant |
| `merchant_name` | string | Filter by merchant name |
| `transaction_type` | string | `"expense"` or `"income"` |
| `check_number` | string | Filter by check number |
| `search_term` | string | Free text search |
| `amount_greater_than` | decimal | Min amount |
| `amount_less_than` | decimal | Max amount |
| `amount_equal_to` | decimal | Exact amount |
| `has_no_category` | boolean | Only uncategorized transactions |
| `merchant_tag_id` | integer | Filter by category |
| `merchant_group_id` | integer | Filter by merchant group |
| `plaid_account_ids` | integer[] | Filter by account IDs |

**Response (200):**

```json
{
  "items": [
    {
      "id": 1,
      "name": "WALMART",
      "accountId": 1,
      "authorizedAt": "2025-01-10T00:00:00.000Z",
      "date": "2025-01-10",
      "amount": 45.67,
      "pending": false,
      "plaidCategoryPrimary": "Shopping",
      "plaidCategoryDetail": "Supermarkets and Groceries",
      "paymentChannel": "in store",
      "transactionType": "expense",
      "isCheck": false,
      "checkNumber": null,
      "currencyCode": "USD",
      "hasDefaultMerchantTag": true,
      "note": "Weekly groceries",
      "recurring": false,
      "categoryPrimary": "Shopping",
      "categoryDetail": "Supermarkets and Groceries",
      "categoryConfidenceLevel": "VERY_HIGH",
      "merchant": {
        "id": 10,
        "name": "Walmart",
        "logoUrl": "https://...",
        "address": "123 Main St",
        "city": "Springfield",
        "state": "IL",
        "zip": "62701",
        "customName": null,
        "plaidEntityId": "abc123",
        "website": "walmart.com",
        "defaultTransactionType": "expense",
        "defaultMerchantTagId": 5,
        "plaidCategoryPrimary": "Shopping",
        "plaidCategoryDetail": "Supermarkets and Groceries",
        "plaidCategoryConfidenceLevel": "VERY_HIGH",
        "defaultMerchantTag": {
          "id": 5,
          "name": "Groceries",
          "parentMerchantTagId": null,
          "color": "#4CAF50",
          "createdAt": "2025-01-01T00:00:00.000Z",
          "updatedAt": "2025-01-01T00:00:00.000Z",
          "targetBudget": 500,
          "isLeaf": true
        },
        "merchantGroup": {
          "id": 1,
          "name": "Walmart Stores",
          "description": "All Walmart locations",
          "createdAt": "2025-01-01T00:00:00.000Z",
          "updatedAt": "2025-01-01T00:00:00.000Z",
          "primaryMerchant": {
            "id": 10,
            "name": "Walmart",
            "customName": null
          },
          "merchants": [
            { "id": 10, "name": "Walmart", "customName": null }
          ],
          "merchantCount": 1
        }
      },
      "plaidAccount": {
        "id": 1,
        "accountType": "checking",
        "plaidMask": "1234",
        "plaidOfficialName": "Checking Account",
        "plaidType": "depository",
        "plaidSubtype": "checking",
        "nickname": "Main Checking",
        "createdAt": "2025-01-01T00:00:00.000Z",
        "updatedAt": "2025-01-01T00:00:00.000Z"
      },
      "merchantTag": {
        "id": 5,
        "name": "Groceries",
        "parentMerchantTagId": null,
        "color": "#4CAF50",
        "createdAt": "2025-01-01T00:00:00.000Z",
        "updatedAt": "2025-01-01T00:00:00.000Z",
        "targetBudget": 500,
        "isLeaf": true
      }
    }
  ],
  "page": {
    "currentPage": 1,
    "totalPages": 10,
    "totalCount": 243
  }
}
```

Note: `merchantTag` will be an empty object `{}` when the transaction has no category assigned.

---

### PATCH /api/transactions/:id

Update a transaction's category, notes, or transaction type.

**Auth required:** Yes

**Request body:**

```json
{
  "transaction": {
    "merchant_tag_id": 5,
    "note": "Weekly groceries",
    "transaction_type": "expense"
  },
  "merchant_id": 10,
  "use_as_default": true
}
```

| Field | Description |
|---|---|
| `transaction[merchant_tag_id]` | Category ID to assign |
| `transaction[note]` | Free text note |
| `transaction[transaction_type]` | `"expense"` or `"income"` |
| `merchant_id` | Required when `use_as_default` is true |
| `use_as_default` | When true, applies the category to all transactions for the merchant and sets it as the merchant's default |

**Response (200):** Returns the full transaction object (same shape as a single item in the list response).

**Error (422):**

```json
{
  "errors": ["Merchant ID is required when updating all transactions"]
}
```

---

## 4. Categories (Merchant Tags)

### GET /api/merchant_tags

List all categories for the current account, sorted alphabetically by name.

**Auth required:** Yes

**Response (200):**

```json
[
  {
    "id": 5,
    "name": "Groceries",
    "parentMerchantTagId": null,
    "color": "#4CAF50",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z",
    "targetBudget": 500,
    "isLeaf": true
  }
]
```

---

## 5. Dashboard Data

### GET /api/plaid_accounts/account_balance

Get the latest balance for each of the user's linked accounts.

**Auth required:** Yes

**Response (200):**

```json
[
  {
    "id": 1,
    "currentBalance": 5432.10,
    "availableBalance": 5400.00,
    "limit": null,
    "createdAt": "2025-01-15T12:00:00.000Z",
    "plaidAccount": {
      "id": 1,
      "accountType": "checking",
      "plaidMask": "1234",
      "plaidOfficialName": "Checking Account",
      "plaidType": "depository",
      "plaidSubtype": "checking",
      "nickname": "Main Checking",
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-01T00:00:00.000Z"
    }
  }
]
```

---

### GET /api/plaid_accounts/account_balance_history_by_type

Get historical balance data aggregated by account type, for rendering balance charts.

**Auth required:** Yes

**Query params:**

| Param | Type | Description |
|---|---|---|
| `account_type` | string | **Required.** One of: `deposit`, `credit`, `loan`, `investment` |
| `time_range` | string | `"1m"`, `"3m"`, `"6m"`, `"12m"`, or `"all"` (default: all) |

**Response (200):**

```json
[
  {
    "id": "2025-01-15",
    "currentBalance": 12500.00,
    "createdAt": "2025-01-15"
  }
]
```

Each entry represents the summed balance across all accounts of the given type for that date.

**Error (400):**

```json
{
  "error": "Invalid account type"
}
```

---

### GET /api/data/total_for_date_range

Get the total spend or income for a date range.

**Auth required:** Yes

**Query params:**

| Param | Type | Default | Description |
|---|---|---|---|
| `transaction_type` | string | `"expense"` | `"expense"` or `"income"` |
| `start_date` | date | 1 month ago | Start of date range |
| `end_date` | date | today | End of date range |

**Response (200):**

```json
{
  "transactionType": "expense",
  "startDate": "2025-01-01",
  "endDate": "2025-01-31",
  "total": 2345.67
}
```

---

### GET /api/data/profit_and_loss

Get a monthly breakdown of income, expenses, and profit.

**Auth required:** Yes

**Query params:**

| Param | Type | Default | Description |
|---|---|---|---|
| `months_back` | integer | 12 | Number of months of history |

**Response (200):**

```json
[
  {
    "date": "2025-01-01",
    "expense": 3200.50,
    "income": 5000.00,
    "profit": 1799.50,
    "profitPercentage": 56.22
  }
]
```

`profitPercentage` is `(income - expense) / expense * 100`, or `0` if expense is zero.

---

### GET /api/data/spend_moving_average

Get the daily spending moving average, averaged over the last 6 months. Used for the spending chart on the dashboard.

**Auth required:** Yes

**Response (200):**

```json
[
  {
    "dayOfMonth": 1,
    "dayAverage": 85.50,
    "cumulativeTotal": 85.50,
    "cumulativeAveragePerDay": 85.50
  },
  {
    "dayOfMonth": 2,
    "dayAverage": 120.30,
    "cumulativeTotal": 205.80,
    "cumulativeAveragePerDay": 102.90
  }
]
```

Returns one entry for each day of the month (1-31). Missing days are filled with the previous day's values.

---

### GET /api/data/income_moving_average

Same as spend moving average, but for income transactions. Same response shape.

**Auth required:** Yes

**Response (200):** Same shape as `/api/data/spend_moving_average`.

---

### GET /api/sync_events/latest

Get the timestamp of the last completed data sync from Plaid.

**Auth required:** Yes

**Response (200):**

```json
{
  "id": 42,
  "startedAt": "2025-01-15T06:00:00.000Z",
  "completedAt": "2025-01-15T06:01:30.000Z"
}
```

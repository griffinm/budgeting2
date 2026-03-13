# API Documentation

Complete REST API reference for the budgeting application.

## General

- **Base path:** `/api`
- **Auth header:** `x-budgeting-token` — JWT token returned from login or signup
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

- **Error responses:**
  - Unauthorized: `401` with `{ "error": "Unauthorized" }`
  - Validation errors: `422` with `{ "errors": ["..."] }`
  - Bad request: `400` with `{ "error": "..." }` or `{ "errors": ["..."] }`

---

## 1. Health

### GET /api/health

Health check endpoint. No authentication required.

**Auth required:** No

**Response (200):**

```json
{
  "status": "ok"
}
```

---

## 2. Authentication

### POST /api/signup

Create a new account and user. Returns the user and a JWT token.

**Auth required:** No

**Request body:**

```json
{
  "user": {
    "email": "user@example.com",
    "first_name": "Jane",
    "last_name": "Doe",
    "password": "password123"
  }
}
```

**Response (201):**

```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "Jane",
    "lastName": "Doe",
    "accountId": 1,
    "createdAt": "2025-01-15T12:00:00.000Z",
    "linkedAccounts": 0
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

### POST /api/users/login

Log in with email and password.

**Auth required:** No

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

## 3. Users

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

### GET /api/accounts/:account_id/users

List all users belonging to an account. The authenticated user must belong to the requested account.

**Auth required:** Yes

**Response (200):**

```json
[
  {
    "id": 1,
    "email": "user@example.com",
    "firstName": "Jane",
    "lastName": "Doe",
    "accountId": 1,
    "createdAt": "2025-01-15T12:00:00.000Z",
    "updatedAt": "2025-01-15T12:00:00.000Z"
  }
]
```

**Error (401):**

```json
{
  "messages": ["You are not authorized to access this account. Account ID: 2, Current User Account ID: 1"]
}
```

---

## 4. Transactions

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
| `tag_ids` | integer[] | Filter to transactions with these tags |
| `omit_tag_ids` | integer[] | Exclude transactions with these tags |

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
      "merchant": { ... },
      "plaidAccount": { ... },
      "merchantTag": { ... },
      "transactionTags": [
        {
          "id": 1,
          "tagId": 5,
          "tag": {
            "id": 5,
            "name": "vacation",
            "color": "#FF5722",
            "userId": 1,
            "accountId": 1,
            "createdAt": "2025-01-01T00:00:00.000Z",
            "updatedAt": "2025-01-01T00:00:00.000Z"
          }
        }
      ]
    }
  ],
  "page": {
    "currentPage": 1,
    "totalPages": 10,
    "totalCount": 243
  }
}
```

The nested `merchant`, `plaidAccount`, and `merchantTag` objects follow the shapes documented in their respective sections. `merchantTag` will be an empty object `{}` when the transaction has no category assigned.

---

### GET /api/transactions/:id

Get a single transaction by ID.

**Auth required:** Yes

**Response (200):** Same shape as a single item in the list response above.

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

**Response (200):** Returns the full transaction object (same shape as show).

**Error (422):**

```json
{
  "errors": "Merchant ID is required when updating all transactions"
}
```

---

## 5. Merchants

### GET /api/merchants

List merchants with search and filtering. Paginated.

**Auth required:** Yes

**Query params:**

| Param | Type | Description |
|---|---|---|
| `currentPage` | integer | Page number (default 1) |
| `perPage` | integer | Items per page (default 25) |
| `search_term` | string | Search merchants by name |
| `merchant_tag_id` | integer | Filter by category |
| `merchant_group_id` | integer | Filter by merchant group |

**Response (200):**

```json
{
  "items": [
    {
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
      "defaultTags": [
        { "id": 3, "name": "essentials", "color": "#2196F3" }
      ],
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
    }
  ],
  "page": {
    "currentPage": 1,
    "totalPages": 5,
    "totalCount": 120
  }
}
```

`defaultMerchantTag` will be an empty object `{}` if no default category is set. `merchantGroup` will be an empty object `{}` if the merchant is not in a group.

---

### GET /api/merchants/:id

Get a single merchant by ID.

**Auth required:** Yes

**Response (200):** Same shape as a single item in the list response above.

---

### PATCH /api/merchants/:id

Update a merchant's custom name, default transaction type, default category, and/or default tags.

**Auth required:** Yes

**Request body:**

```json
{
  "merchant": {
    "custom_name": "My Walmart",
    "default_transaction_type": "expense",
    "default_merchant_tag_id": 5
  },
  "default_tag_ids": [3, 7],
  "apply_to_existing": true
}
```

| Field | Description |
|---|---|
| `merchant[custom_name]` | Custom display name for the merchant |
| `merchant[default_transaction_type]` | `"expense"` or `"income"` |
| `merchant[default_merchant_tag_id]` | Default category ID |
| `default_tag_ids` | Array of tag IDs to set as default tags for this merchant |
| `apply_to_existing` | When true, applies the defaults (category, transaction type, tags) to all existing transactions for this merchant |

**Response (200):** Returns the full merchant object.

**Error (422):**

```json
{
  "errors": ["Custom name is too long"]
}
```

---

### GET /api/merchants/:merchant_id/spend_stats

Get spending statistics for a merchant, including monthly breakdown.

**Auth required:** Yes

**Query params:**

| Param | Type | Default | Description |
|---|---|---|---|
| `months_back` | integer | 6 | Number of months of history |

**Response (200):**

```json
{
  "monthsBack": 6,
  "monthlySpend": [
    { "month": "2025-01", "amount": 150.00 }
  ],
  "allTimeSpend": 2500.00
}
```

---

### GET /api/merchants/:merchant_id/suggest_groups

Get suggested merchant groups for a merchant based on name similarity.

**Auth required:** Yes

**Response (200):**

```json
{
  "suggestions": [
    {
      "merchant": {
        "id": 11,
        "name": "Walmart Supercenter",
        "customName": null
      },
      "reason": "Similar name",
      "confidence": 0.85
    }
  ]
}
```

**Error (404):**

```json
{
  "errors": ["Merchant not found"]
}
```

---

### POST /api/merchants/:merchant_id/create_group

Create a new merchant group containing the specified merchant.

**Auth required:** Yes

**Request body:**

```json
{
  "group_name": "Walmart Stores",
  "description": "All Walmart locations"
}
```

| Field | Description |
|---|---|
| `group_name` | Name for the group (defaults to the merchant's name if omitted) |
| `description` | Optional description |

**Response (200):**

```json
{
  "message": "Group created successfully",
  "group": {
    "id": 1,
    "name": "Walmart Stores",
    "description": "All Walmart locations"
  }
}
```

**Error (404):**

```json
{
  "errors": ["Merchant not found"]
}
```

**Error (422):**

```json
{
  "errors": ["Failed to create group"]
}
```

---

## 6. Merchant Groups

### GET /api/merchant_groups

List all merchant groups for the current account.

**Auth required:** Yes

**Response (200):**

```json
[
  {
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
    "merchantCount": 3,
    "merchants": [
      { "id": 10, "name": "Walmart", "customName": null },
      { "id": 11, "name": "Walmart Supercenter", "customName": null },
      { "id": 12, "name": "Walmart Neighborhood Market", "customName": null }
    ]
  }
]
```

---

### GET /api/merchant_groups/:id/spend_stats

Get spending statistics for a merchant group.

**Auth required:** Yes

**Query params:**

| Param | Type | Default | Description |
|---|---|---|---|
| `months_back` | integer | 6 | Number of months of history |

**Response (200):**

```json
{
  "monthlySpend": [
    { "month": "2025-01", "amount": 450.00 }
  ],
  "allTimeSpend": 7500.00
}
```

---

### POST /api/merchant_groups/:id/add_merchant

Add a merchant to an existing group.

**Auth required:** Yes

**Request body:**

```json
{
  "merchant_id": 11
}
```

**Response (200):** Returns the full merchant group object:

```json
{
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
    { "id": 10, "name": "Walmart", "customName": null, "isPrimary": true },
    { "id": 11, "name": "Walmart Supercenter", "customName": null, "isPrimary": false }
  ]
}
```

**Error (422):**

```json
{
  "errors": ["Failed to add merchant to group"]
}
```

---

### DELETE /api/merchant_groups/:id/remove_merchant

Remove a merchant from a group.

**Auth required:** Yes

**Request body:**

```json
{
  "merchant_id": 11
}
```

**Response (200):** Returns the updated merchant group object (same shape as add_merchant response).

**Error (422):**

```json
{
  "errors": ["Failed to remove merchant from group"]
}
```

---

### PATCH /api/merchant_groups/:id/set_primary_merchant

Set the primary merchant for a group.

**Auth required:** Yes

**Request body:**

```json
{
  "merchant_id": 10
}
```

**Response (200):** Returns the updated merchant group object (same shape as add_merchant response).

**Error (422):**

```json
{
  "errors": ["Failed to set primary merchant"]
}
```

---

## 7. Categories (Merchant Tags)

Categories are hierarchical labels for merchants/transactions. Internally called "merchant tags."

### GET /api/merchant_tags

List all categories for the current account, sorted alphabetically.

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

### GET /api/merchant_tags/:id

Get a single category by ID.

**Auth required:** Yes

**Response (200):** Same shape as a single item in the list response.

---

### POST /api/merchant_tags

Create a new category.

**Auth required:** Yes

**Request body:**

```json
{
  "merchant_tag": {
    "name": "Groceries",
    "parent_merchant_tag_id": null,
    "target_budget": 500
  }
}
```

| Field | Description |
|---|---|
| `merchant_tag[name]` | Category name (required) |
| `merchant_tag[parent_merchant_tag_id]` | Parent category ID for nesting (optional) |
| `merchant_tag[target_budget]` | Monthly budget target (optional) |

**Response (200):** Returns the created category object.

**Error (400):**

```json
{
  "errors": ["Name can't be blank"]
}
```

---

### PUT /api/merchant_tags/:id

Update an existing category.

**Auth required:** Yes

**Request body:**

```json
{
  "merchant_tag": {
    "name": "Groceries & Food",
    "parent_merchant_tag_id": null,
    "target_budget": 600
  }
}
```

**Response (200):** Returns the updated category object.

**Error (400):**

```json
{
  "errors": ["Name can't be blank"]
}
```

---

### DELETE /api/merchant_tags/:id

Delete a category.

**Auth required:** Yes

**Response (200):**

```json
{
  "message": "Merchant tag deleted"
}
```

**Error (400):**

```json
{
  "errors": ["Cannot delete category with associated transactions"]
}
```

---

### GET /api/merchant_tags/spend_stats

Get spend statistics for all categories in a date range.

**Auth required:** Yes

**Query params:**

| Param | Type | Default | Description |
|---|---|---|---|
| `start_date` | date | 6 months ago | Start of date range |
| `end_date` | date | today | End of date range |

**Response (200):** Returns all categories with their total transaction amounts:

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
    "isLeaf": true,
    "totalTransactionAmount": 2345.67
  }
]
```

---

### GET /api/merchant_tags/:merchant_tag_id/spend_stats

Get monthly spend statistics for a single category.

**Auth required:** Yes

**Query params:**

| Param | Type | Default | Description |
|---|---|---|---|
| `months_back` | integer | — | Number of months of history |

**Response (200):**

```json
[
  {
    "month": 1,
    "year": 2025,
    "tagId": 5,
    "totalAmount": 487.50
  }
]
```

---

## 8. Tags

Tags are user-defined labels that can be applied to individual transactions (distinct from categories/merchant tags which are applied at the merchant level).

### GET /api/tags

List all tags for the current account, sorted alphabetically.

**Auth required:** Yes

**Response (200):**

```json
[
  {
    "id": 1,
    "name": "vacation",
    "color": "#FF5722",
    "userId": 1,
    "accountId": 1,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
]
```

---

### POST /api/tags

Create a new tag.

**Auth required:** Yes

**Request body:**

```json
{
  "tag": {
    "name": "vacation"
  }
}
```

**Response (200):** Returns the created tag object.

**Error (400):**

```json
{
  "errors": ["Name can't be blank"]
}
```

---

### GET /api/tags/spend_stats

Get monthly spend statistics filtered by tags.

**Auth required:** Yes

**Query params:**

| Param | Type | Default | Description |
|---|---|---|---|
| `tag_ids[]` | integer[] | `[]` | Tag IDs to include |
| `omit_tag_ids[]` | integer[] | `[]` | Tag IDs to exclude |
| `months_back` | integer | 6 | Number of months of history |

**Response (200):**

```json
[
  {
    "month": 1,
    "year": 2025,
    "tagId": 1,
    "totalAmount": 1200.00
  }
]
```

---

## 9. Transaction Tags

Manage the association between tags and transactions.

### POST /api/transaction_tags

Add a tag to a transaction.

**Auth required:** Yes

**Request body:**

```json
{
  "transaction_tag": {
    "tag_id": 1,
    "plaid_transaction_id": 42
  }
}
```

**Response (200):**

```json
{
  "id": 1,
  "tagId": 1,
  "plaidTransactionId": 42,
  "userId": 1,
  "createdAt": "2025-01-15T12:00:00.000Z",
  "updatedAt": "2025-01-15T12:00:00.000Z",
  "tag": {
    "id": 1,
    "name": "vacation",
    "color": "#FF5722",
    "userId": 1,
    "accountId": 1,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
}
```

**Error (400):**

```json
{
  "errors": ["Tag has already been taken"]
}
```

---

### DELETE /api/transaction_tags/:id

Remove a tag from a transaction.

**Auth required:** Yes

**Response (200):**

```json
{
  "message": "Transaction tag removed"
}
```

---

## 10. Tag Reports

Tag reports are saved configurations for filtering transactions by tag combinations.

### GET /api/tag_reports

List all tag reports for the current account, sorted alphabetically.

**Auth required:** Yes

**Response (200):**

```json
[
  {
    "id": 1,
    "name": "Vacation Spending",
    "description": "All vacation-related transactions",
    "userId": 1,
    "accountId": 1,
    "includedTagIds": [1, 2],
    "omittedTagIds": [3],
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
]
```

---

### POST /api/tag_reports

Create a new tag report.

**Auth required:** Yes

**Request body:**

```json
{
  "tag_report": {
    "name": "Vacation Spending",
    "description": "All vacation-related transactions",
    "tag_report_tags_attributes": [
      { "tag_id": 1, "role": "include" },
      { "tag_id": 2, "role": "include" },
      { "tag_id": 3, "role": "omit" }
    ]
  }
}
```

| Field | Description |
|---|---|
| `tag_report[name]` | Report name (required) |
| `tag_report[description]` | Optional description |
| `tag_report[tag_report_tags_attributes]` | Array of tag associations with `tag_id` and `role` (`"include"` or `"omit"`) |

**Response (200):** Returns the created tag report object.

**Error (400):**

```json
{
  "errors": ["Name can't be blank"]
}
```

---

### DELETE /api/tag_reports/:id

Delete a tag report.

**Auth required:** Yes

**Response (200):**

```json
{
  "message": "Tag report deleted"
}
```

---

## 11. Plaid Accounts

### GET /api/plaid_accounts

List all linked bank accounts for the current user.

**Auth required:** Yes

**Response (200):**

```json
[
  {
    "id": 1,
    "accountType": "checking",
    "plaidOfficialName": "Checking Account",
    "plaidType": "depository",
    "plaidSubtype": "checking",
    "plaidMask": "1234",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z",
    "nickname": "Main Checking",
    "users": [
      {
        "id": 1,
        "email": "user@example.com",
        "firstName": "Jane",
        "lastName": "Doe",
        "accountId": 1,
        "createdAt": "2025-01-15T12:00:00.000Z",
        "updatedAt": "2025-01-15T12:00:00.000Z"
      }
    ]
  }
]
```

---

### PATCH /api/plaid_accounts/:id

Update a Plaid account's nickname.

**Auth required:** Yes

**Request body:**

```json
{
  "nickname": "Main Checking"
}
```

**Response (200):** Returns the updated Plaid account object (same shape as list items).

**Error (422):**

```json
{
  "error": ["Nickname is too long"]
}
```

---

### POST /api/plaid_accounts/create_link_token

Create a Plaid Link token for the Plaid Link flow to connect a new bank account.

**Auth required:** Yes

**Response (200):**

```json
{
  "link_token": "link-sandbox-af1a0311-..."
}
```

**Error (500):**

```json
{
  "error": "Failed to create link token"
}
```

---

### POST /api/plaid_accounts/exchange_public_token

Exchange a Plaid public token (from the Link flow) for access tokens, creating new Plaid account records and triggering an initial transaction sync.

**Auth required:** Yes

**Request body:**

```json
{
  "public_token": "public-sandbox-b0e2c4ee-..."
}
```

**Response (200):**

```json
{
  "message": "Accounts connected successfully",
  "accounts": [
    { "id": 1, "name": "Checking Account", "mask": "1234" },
    { "id": 2, "name": "Savings Account", "mask": "5678" }
  ]
}
```

**Error (400):**

```json
{
  "error": "Public token is required"
}
```

**Error (500):**

```json
{
  "error": "Failed to connect accounts"
}
```

---

### POST /api/users/:user_id/plaid_accounts/:plaid_account_id

Grant another user access to a Plaid account. The authenticated user must own the Plaid account, and the target user must belong to the same account.

**Auth required:** Yes

**Response (200):**

```json
{
  "message": "Access updated"
}
```

---

### DELETE /api/users/:user_id/plaid_accounts/:plaid_account_id

Remove a user's access to a Plaid account.

**Auth required:** Yes

**Response (200):**

```json
{
  "message": "Access removed"
}
```

---

## 12. Account Balances

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

### GET /api/plaid_accounts/account_balance_history

Get historical balance data for a specific Plaid account.

**Auth required:** Yes

**Query params:**

| Param | Type | Description |
|---|---|---|
| `plaid_account_id` | integer | **Required.** The Plaid account ID |
| `time_range` | string | `"1m"`, `"3m"`, `"6m"`, `"12m"`, or `"all"` (default: all) |

**Response (200):**

```json
[
  {
    "id": 42,
    "currentBalance": 5432.10,
    "createdAt": "2025-01-15T12:00:00.000Z"
  }
]
```

**Error (404):**

```json
{
  "error": "Account not found"
}
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

## 13. Financial Data

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

Returns one entry for each day of the month (1–31). Missing days are filled with the previous day's values.

---

### GET /api/data/income_moving_average

Same as spend moving average, but for income transactions.

**Auth required:** Yes

**Response (200):** Same shape as `/api/data/spend_moving_average`.

---

## 14. Sync Events

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

---

## 15. System

These endpoints trigger data syncs from Plaid. They use a shared secret token (not JWT) for authentication.

### GET /api/update_all

Sync transactions for all live accounts.

**Auth required:** No (uses `token` query param, validated against `UPDATE_ALL_TOKEN` env var)

**Query params:**

| Param | Type | Description |
|---|---|---|
| `token` | string | **Required.** Must match the `UPDATE_ALL_TOKEN` environment variable |

**Response (200):**

```json
{
  "message": "Updates complete"
}
```

**Error (401):**

```json
{
  "error": "Unauthorized"
}
```

---

### GET /api/plaid_accounts/update_all

Sync transactions and balances (for loan and investment accounts) for all accounts.

**Auth required:** No (uses `token` query param, validated against `UPDATE_ALL_TOKEN` env var)

**Query params:**

| Param | Type | Description |
|---|---|---|
| `token` | string | **Required.** Must match the `UPDATE_ALL_TOKEN` environment variable |

**Response (200):**

```json
{
  "message": "Updates complete"
}
```

**Error (401):**

```json
{
  "error": "Unauthorized"
}
```

#!/bin/bash

set -e

rails import_access_tokens

# Import merchants
rails import_merchants

# Import plaid accounts
rails import_plaid_accounts

# Import transactions
rails import_transactions

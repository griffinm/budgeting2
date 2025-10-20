#!/bin/bash

# Test Data Generation Script for Budgeting App
# This script generates comprehensive test data for an account

echo "🚀 Budgeting App Test Data Generator"
echo "====================================="
echo ""

# Check if we're in the right directory
if [ ! -f "Gemfile" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Check if Rails is available
if ! command -v rails &> /dev/null; then
    echo "❌ Error: Rails is not installed or not in PATH"
    exit 1
fi

echo "📊 This will generate test data including:"
echo "   • User account with realistic profile"
echo "   • 3 months of transaction history"
echo "   • Multiple account types (checking, savings, credit)"
echo "   • Realistic merchants and categories"
echo "   • Hierarchical merchant tags"
echo "   • Account balances reflecting transaction history"
echo ""

# Ask if user wants to proceed
read -p "🤔 Do you want to proceed? (y/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Cancelled by user"
    exit 0
fi

echo ""
echo "🔄 Generating test data..."
echo ""

# Run the rake task
if rails test_data:generate_account; then
    echo ""
    echo "✅ Test data generation completed successfully!"
    echo ""
    echo "📋 What was created:"
    echo "   • A new account with user profile"
    echo "   • 3 months of realistic transaction data"
    echo "   • Multiple merchants with proper categorization"
    echo "   • Hierarchical merchant tags for organization"
    echo "   • Checking, savings, and credit card accounts"
    echo "   • Realistic account balances"
    echo ""
    echo "🎯 You can now:"
    echo "   • Login with email: testuser_account_[ACCOUNT_ID]@example.com"
    echo "   • Password: TestUser123!"
    echo "   • View transactions, merchants, and categories"
    echo "   • Test the budgeting features with realistic data"
    echo ""
else
    echo ""
    echo "❌ Test data generation failed!"
    echo "   Please check the error messages above and try again."
    exit 1
fi

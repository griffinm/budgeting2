#!/bin/bash

# Helper script to generate production keys

set -e

echo "🔐 Generating production keys..."
echo ""

# Generate secret key base using OpenSSL (simpler and more reliable)
echo "Generating SECRET_KEY_BASE..."
SECRET_KEY=$(openssl rand -hex 64)

# Check if .env.production exists
if [ -f .env.production ]; then
    echo ""
    echo "⚠️  .env.production already exists!"
    read -p "Do you want to update it with a new SECRET_KEY_BASE? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        # Check if SECRET_KEY_BASE already exists in the file
        if grep -q "^SECRET_KEY_BASE=" .env.production; then
            # Update existing line
            sed -i "s|^SECRET_KEY_BASE=.*|SECRET_KEY_BASE=$SECRET_KEY|" .env.production
            echo "✅ Updated SECRET_KEY_BASE in .env.production"
        else
            # Append new line
            echo "SECRET_KEY_BASE=$SECRET_KEY" >> .env.production
            echo "✅ Added SECRET_KEY_BASE to .env.production"
        fi
    fi
else
    # Create new file from template
    if [ -f env.production.template ]; then
        cp env.production.template .env.production
        echo "SECRET_KEY_BASE=$SECRET_KEY" >> .env.production
        echo "✅ Created .env.production with SECRET_KEY_BASE"
    else
        echo "❌ Error: env.production.template not found!"
        exit 1
    fi
fi

echo ""
echo "🎉 Keys generated successfully!"
echo ""
echo "Next steps:"
echo "1. Review and edit .env.production for any other configuration"
echo "2. For Rails credentials:"
if [ -f config/master.key ]; then
    echo "   ✅ config/master.key found - it will be mounted automatically"
else
    echo "   ⚠️  No config/master.key found. If you use Rails credentials:"
    echo "      a) Set RAILS_MASTER_KEY in .env.production, OR"
    echo "      b) Add your config/master.key file"
fi
echo "3. Run ./deploy-prod.sh to deploy"
echo ""


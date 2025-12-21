#!/bin/bash

# Script to rename directory to fix Vercel CLI bug
# This renames "recipe" to "app" to avoid the path bug

CURRENT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PARENT_DIR="$(dirname "$CURRENT_DIR")"
# You can change this to: "recipe-frontend", "frontend", "app-frontend", etc.
# WARNING: If you use "recipe-frontend", Vercel might still extract "recipe" and cause the bug
# Recommended: Use a name WITHOUT "recipe" like "frontend" or "app-frontend"
NEW_DIR_NAME="frontend"

echo "🔧 Fixing Vercel CLI bug by renaming directory..."
echo "📁 Current: $CURRENT_DIR"
echo "📁 New: $PARENT_DIR/$NEW_DIR_NAME"
echo ""
echo "⚠️  This will rename the 'recipe' directory to '$NEW_DIR_NAME'"
echo "   You'll need to:"
echo "   1. Close any editors/terminals using this directory"
echo "   2. Run this script"
echo "   3. Update your IDE workspace if needed"
echo ""
read -p "Continue? (y/N) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Cancelled"
    exit 1
fi

# Check if we're in the recipe directory
if [[ "$(basename "$CURRENT_DIR")" != "recipe" ]]; then
    echo "❌ This script must be run from the 'recipe' directory"
    exit 1
fi

# Check if new directory already exists
if [ -d "$PARENT_DIR/$NEW_DIR_NAME" ]; then
    echo "❌ Directory '$NEW_DIR_NAME' already exists in parent directory"
    exit 1
fi

# Rename the directory
echo "🔄 Renaming directory..."
cd "$PARENT_DIR" || exit 1
mv recipe "$NEW_DIR_NAME" || {
    echo "❌ Failed to rename directory. Make sure nothing is using it."
    exit 1
}

echo "✅ Directory renamed successfully!"
echo ""
echo "📝 Next steps:"
echo "   1. cd $PARENT_DIR/$NEW_DIR_NAME"
echo "   2. npm run dev"
echo "   3. Update your IDE workspace path if needed"


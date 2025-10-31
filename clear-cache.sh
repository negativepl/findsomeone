#!/bin/bash
# Skrypt do szybkiego czyszczenia cache Next.js

echo "🧹 Czyszczenie cache Next.js..."

# Kill all node processes running next dev
echo "⏹️  Zatrzymywanie serwera..."
pkill -f "next dev" || true

# Remove .next directory
echo "🗑️  Usuwanie folderu .next..."
rm -rf .next

# Optional: clear node_modules/.cache if exists
if [ -d "node_modules/.cache" ]; then
  echo "🗑️  Usuwanie node_modules/.cache..."
  rm -rf node_modules/.cache
fi

echo "✅ Cache wyczyszczony!"
echo "🚀 Uruchamianie serwera..."
npm run dev

#!/bin/bash

# Load environment variables from .env.local
set -a
source .env.local 2>/dev/null || true
set +a

# Run the TypeScript script
npx tsx scripts/generate-site-embeddings.ts

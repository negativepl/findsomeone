#!/bin/bash

# Apply search_posts function fix
echo "Applying search_posts function fix..."

# Get database connection string from Supabase Dashboard:
# Settings > Database > Connection string (Direct connection)
# Format: postgresql://postgres:[YOUR-PASSWORD]@db.muotqfczovjxckzucnhh.supabase.co:5432/postgres

# For now, we'll show the SQL that needs to be executed
echo ""
echo "================================================"
echo "Please copy and run this SQL in Supabase SQL Editor:"
echo "https://supabase.com/dashboard/project/muotqfczovjxckzucnhh/sql/new"
echo "================================================"
echo ""
cat supabase/migrations/20250131000000_fix_search_posts_columns.sql
echo ""
echo "================================================"

#!/bin/bash

# Navigate to the project directory
cd /Users/marcinbaszewski/findsomeone

# Start Claude Code in this directory
# The -c flag runs a command after starting
claude --cwd "$(pwd)"

# Note: If you want npm run dev to start automatically when Claude Code opens,
# you can add it to your .claude/settings.json with a hook, or run it manually

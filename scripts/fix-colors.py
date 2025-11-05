#!/usr/bin/env python3
"""
Script to replace hardcoded colors with CSS variables
"""
import re
import sys
from pathlib import Path

# Color mappings
REPLACEMENTS = [
    # bg-[#C44E35] -> bg-brand
    (r'bg-\[#C44E35\]', 'bg-brand'),
    # hover:bg-[#B33D2A] -> hover:bg-brand/90
    (r'hover:bg-\[#B33D2A\]', 'hover:bg-brand/90'),
    # text-[#C44E35] -> text-brand
    (r'text-\[#C44E35\]', 'text-brand'),
    # border-[#C44E35] -> border-brand
    (r'border-\[#C44E35\]', 'border-brand'),
    # from-[#C44E35] -> from-brand
    (r'from-\[#C44E35\]', 'from-brand'),
    # to-[#F4A261] -> to-accent
    (r'to-\[#F4A261\]', 'to-accent'),
    # ring-[#C44E35] -> ring-brand
    (r'ring-\[#C44E35\]', 'ring-brand'),
    # focus:ring-[#C44E35] -> focus:ring-brand
    (r'focus:ring-\[#C44E35\]', 'focus:ring-brand'),
    # focus:border-[#C44E35] -> focus:border-brand
    (r'focus:border-\[#C44E35\]', 'focus:border-brand'),
    # text-[#C44E35]/10 -> text-brand/10
    (r'text-\[#C44E35\]/(\d+)', r'text-brand/\1'),
    # bg-[#C44E35]/10 -> bg-brand/10
    (r'bg-\[#C44E35\]/(\d+)', r'bg-brand/\1'),
    # SVG fill="#C44E35" -> className with fill-brand
    (r'fill="#C44E35"', 'className="fill-brand"'),
    # className="text-[#C44E35]" (in SVG contexts) -> className="text-brand"
    (r'className="([^"]*)\s*text-\[#C44E35\]([^"]*)"', r'className="\1 text-brand\2"'),
]

def fix_file(filepath):
    """Fix colors in a single file"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        original_content = content

        # Apply all replacements
        for pattern, replacement in REPLACEMENTS:
            content = re.sub(pattern, replacement, content)

        # Only write if content changed
        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"✓ Fixed: {filepath}")
            return True
        return False
    except Exception as e:
        print(f"✗ Error fixing {filepath}: {e}", file=sys.stderr)
        return False

def main():
    """Main function"""
    base_dir = Path('/Users/marcinbaszewski/findsomeone')

    # File patterns to process
    patterns = ['**/*.tsx', '**/*.ts', '**/*.jsx', '**/*.js']
    exclude_dirs = {'node_modules', '.next', 'dist', 'build'}

    files_fixed = 0

    for pattern in patterns:
        for filepath in base_dir.glob(pattern):
            # Skip excluded directories
            if any(excluded in filepath.parts for excluded in exclude_dirs):
                continue

            if fix_file(filepath):
                files_fixed += 1

    print(f"\n✓ Fixed {files_fixed} files")

if __name__ == '__main__':
    main()

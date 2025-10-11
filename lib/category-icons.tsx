import * as LucideIcons from 'lucide-react'
import { type LucideIcon } from 'lucide-react'

// Convert icon name to PascalCase for dynamic import
function toPascalCase(str: string): string {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('')
}

// Get icon component by name dynamically
export function getCategoryIcon(iconName?: string | null): LucideIcon {
  if (!iconName) return LucideIcons.HelpCircle

  const pascalName = toPascalCase(iconName)
  const Icon = (LucideIcons as any)[pascalName]

  return Icon || LucideIcons.HelpCircle
}

// Render icon with optional className
export function CategoryIcon({
  iconName,
  className = "w-5 h-5"
}: {
  iconName?: string | null
  className?: string
}) {
  const Icon = getCategoryIcon(iconName)
  return <Icon className={className} />
}

// Popular icons for quick selection
export const POPULAR_ICONS = [
  'wrench', 'hammer', 'zap', 'laptop', 'book-open', 'heart',
  'sparkles', 'truck', 'leaf', 'home', 'briefcase', 'paint-bucket',
  'scissors', 'car', 'utensils', 'baby', 'graduation-cap', 'stethoscope',
  'camera', 'music', 'dumbbell', 'tree', 'droplet', 'flame',
  'shield', 'key', 'wrench-screwdriver', 'drill', 'ruler', 'palette'
]

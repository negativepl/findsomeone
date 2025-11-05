# FindSomeone Design System

Complete design system documentation for the FindSomeone project. This guide defines all visual design tokens, patterns, and guidelines used throughout the application.

**Last Updated:** November 5, 2025
**Version:** 1.0.0

---

## Table of Contents

1. [Color System](#color-system)
2. [Typography](#typography)
3. [Spacing](#spacing)
4. [Borders](#borders)
5. [Shadows](#shadows)
6. [Border Radius](#border-radius)
7. [Component Patterns](#component-patterns)
8. [Best Practices](#best-practices)

---

## Color System

We use **OKLCH color space** for better perceptual uniformity and a complete light/dark theme system.

### Color Format

```css
oklch(lightness chroma hue)
```

- **Lightness**: 0-1 (0 = black, 1 = white)
- **Chroma**: 0-0.4 (color intensity)
- **Hue**: 0-360 (color wheel angle)

### Semantic Color Variables

#### Light Mode Colors

| Variable | Value | Usage |
|----------|-------|-------|
| `--background` | `oklch(0.98 0.008 70)` | Main app background |
| `--foreground` | `oklch(0.145 0 0)` | Primary text |
| `--card` | `oklch(1 0 0)` | Card backgrounds |
| `--card-foreground` | `oklch(0.145 0 0)` | Text on cards |
| `--primary` | `oklch(0.205 0 0)` | Primary actions |
| `--primary-foreground` | `oklch(0.985 0 0)` | Text on primary |
| `--secondary` | `oklch(0.97 0.008 70)` | Secondary actions |
| `--secondary-foreground` | `oklch(0.205 0 0)` | Text on secondary |
| `--muted` | `oklch(0.97 0.008 70)` | Muted backgrounds |
| `--muted-foreground` | `oklch(0.556 0 0)` | Muted text |
| `--accent` | `oklch(0.97 0.008 70)` | Accent/hover states |
| `--accent-foreground` | `oklch(0.205 0 0)` | Text on accent |
| `--destructive` | `oklch(0.577 0.245 27.325)` | Error/delete actions |
| `--border` | `oklch(0.9 0.008 70)` | Border color |
| `--input` | `oklch(0.9 0.008 70)` | Input borders |
| `--ring` | `oklch(0.708 0 0)` | Focus rings |
| `--brand` | `oklch(0.549 0.155 30.5)` | Brand orange |
| `--brand-foreground` | `oklch(0.985 0 0)` | Text on brand |

#### Dark Mode Colors

| Variable | Value | Usage |
|----------|-------|-------|
| `--background` | `oklch(0.18 0.01 70)` | Main app background |
| `--foreground` | `oklch(0.95 0.005 70)` | Primary text |
| `--card` | `oklch(0.22 0.012 70)` | Card backgrounds |
| `--card-foreground` | `oklch(0.95 0.005 70)` | Text on cards |
| `--primary` | `oklch(0.92 0.008 70)` | Primary actions |
| `--primary-foreground` | `oklch(0.22 0.012 70)` | Text on primary |
| `--secondary` | `oklch(0.28 0.015 70)` | Secondary actions |
| `--secondary-foreground` | `oklch(0.95 0.005 70)` | Text on secondary |
| `--muted` | `oklch(0.28 0.015 70)` | Muted backgrounds |
| `--muted-foreground` | `oklch(0.65 0.008 70)` | Muted text |
| `--accent` | `oklch(0.28 0.015 70)` | Accent/hover states |
| `--accent-foreground` | `oklch(0.95 0.005 70)` | Text on accent |
| `--destructive` | `oklch(0.704 0.191 22.216)` | Error/delete actions |
| `--border` | `oklch(0.35 0.015 70)` | Border color |
| `--input` | `oklch(0.35 0.015 70)` | Input borders |
| `--ring` | `oklch(0.556 0.008 70)` | Focus rings |
| `--brand` | `oklch(0.549 0.155 30.5)` | Brand orange (same) |
| `--brand-foreground` | `oklch(0.985 0 0)` | Text on brand (same) |

### Usage Examples

```tsx
// ✅ CORRECT - Uses semantic variables
<div className="bg-card text-foreground border-border">
  <h1 className="text-2xl font-bold">Title</h1>
  <p className="text-muted-foreground">Description</p>
</div>

// ❌ INCORRECT - Hardcoded colors
<div className="bg-white text-black border-gray-200">
  <h1 className="text-2xl font-bold">Title</h1>
  <p className="text-gray-600">Description</p>
</div>
```

### Color Hierarchy

1. **Primary Text**: `text-foreground`
2. **Secondary Text**: `text-muted-foreground`
3. **Disabled Text**: `text-muted-foreground/50`
4. **Links**: `text-foreground hover:text-brand`
5. **Errors**: `text-destructive`

---

## Typography

### Font Families

```css
--font-sans: Geist Sans, system-ui, sans-serif
--font-mono: Geist Mono, monospace
```

### Font Sizes

| Class | Size | Usage |
|-------|------|-------|
| `text-xs` | 0.75rem (12px) | Captions, labels |
| `text-sm` | 0.875rem (14px) | Body text (small) |
| `text-base` | 1rem (16px) | Default body text |
| `text-lg` | 1.125rem (18px) | Subheadings |
| `text-xl` | 1.25rem (20px) | Headings (small) |
| `text-2xl` | 1.5rem (24px) | Headings (medium) |
| `text-3xl` | 1.875rem (30px) | Page titles |
| `text-4xl` | 2.25rem (36px) | Hero titles |

### Font Weights

| Class | Weight | Usage |
|-------|--------|-------|
| `font-normal` | 400 | Body text |
| `font-medium` | 500 | Emphasized text |
| `font-semibold` | 600 | Subheadings |
| `font-bold` | 700 | Headings |

### Line Heights

| Class | Height | Usage |
|-------|--------|-------|
| `leading-none` | 1 | Tight headings |
| `leading-tight` | 1.25 | Headings |
| `leading-normal` | 1.5 | Body text |
| `leading-relaxed` | 1.625 | Comfortable reading |

### Typography Examples

```tsx
// Page title
<h1 className="text-3xl font-bold text-foreground">
  Admin Dashboard
</h1>

// Section heading
<h2 className="text-2xl font-semibold text-foreground">
  Recent Posts
</h2>

// Body text
<p className="text-base text-muted-foreground leading-relaxed">
  This is a description paragraph with comfortable line height.
</p>

// Label
<label className="text-sm font-medium text-foreground">
  Email Address
</label>

// Caption
<span className="text-xs text-muted-foreground">
  Last updated 2 hours ago
</span>
```

---

## Spacing

We use Tailwind's default spacing scale (4px increments).

### Spacing Scale

| Class | Size | Pixels | Usage |
|-------|------|--------|-------|
| `p-0` | 0 | 0px | No padding |
| `p-1` | 0.25rem | 4px | Minimal padding |
| `p-2` | 0.5rem | 8px | Compact spacing |
| `p-3` | 0.75rem | 12px | Small spacing |
| `p-4` | 1rem | 16px | Standard spacing |
| `p-6` | 1.5rem | 24px | Medium spacing |
| `p-8` | 2rem | 32px | Large spacing |
| `p-12` | 3rem | 48px | Extra large spacing |
| `p-16` | 4rem | 64px | Section spacing |

### Common Spacing Patterns

```tsx
// Card padding
<Card className="p-6">
  <CardHeader className="px-0 pt-0">
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent className="px-0 pb-0">
    Content
  </CardContent>
</Card>

// Page container
<div className="container mx-auto px-4 py-8">
  {/* Content */}
</div>

// Grid gap
<div className="grid grid-cols-2 gap-4">
  {/* Items */}
</div>

// Stack spacing
<div className="space-y-4">
  <div>Item 1</div>
  <div>Item 2</div>
</div>
```

### Spacing Guidelines

- **Cards**: `p-6` (24px)
- **Page margins**: `px-4 py-8` (16px horizontal, 32px vertical)
- **Section gaps**: `space-y-8` or `gap-8` (32px)
- **Element gaps**: `space-y-4` or `gap-4` (16px)
- **Tight spacing**: `space-y-2` or `gap-2` (8px)

---

## Borders

### Border Widths

| Class | Width | Usage |
|-------|-------|-------|
| `border` | 1px | Default borders |
| `border-2` | 2px | Emphasized borders |
| `border-0` | 0px | No border |

### Border Colors

Always use semantic border variables:

```tsx
// Default border
<div className="border border-border">...</div>

// Input border
<input className="border border-input" />

// Hover state
<button className="border border-border hover:border-ring">
  Button
</button>

// Focus state
<input className="border border-input focus:border-ring" />
```

### Border Styles

```tsx
// All sides
<div className="border border-border">...</div>

// Specific sides
<div className="border-b border-border">...</div>
<div className="border-t border-l border-border">...</div>

// No border
<div className="border-0">...</div>

// Dividers
<div className="divide-y divide-border">
  <div>Item 1</div>
  <div>Item 2</div>
</div>
```

---

## Shadows

We use minimal, subtle shadows for depth.

### Shadow Scale

| Class | Shadow | Usage |
|-------|--------|-------|
| `shadow-none` | none | No shadow |
| `shadow-sm` | Small | Subtle elevation |
| `shadow` | Default | Card elevation |
| `shadow-md` | Medium | Dropdowns, modals |
| `shadow-lg` | Large | Popovers |
| `shadow-xl` | Extra large | Dialogs |

### Shadow Examples

```tsx
// Card
<Card className="shadow-sm">
  Card content
</Card>

// Dropdown
<DropdownMenu className="shadow-md">
  Menu items
</DropdownMenu>

// Modal
<Dialog className="shadow-xl">
  Dialog content
</Dialog>

// Button hover
<Button className="shadow-sm hover:shadow-md transition-shadow">
  Click me
</Button>
```

### Shadow Guidelines

- **Cards**: `shadow-sm` - Subtle elevation
- **Dropdowns**: `shadow-md` - Clear separation
- **Modals**: `shadow-lg` or `shadow-xl` - Strong elevation
- **Hover states**: Increase shadow on hover for interactive elements
- **Transitions**: Always add `transition-shadow` when animating shadows

---

## Border Radius

### Radius Variables

```css
--radius: 0.625rem (10px)
--radius-sm: calc(var(--radius) - 4px) = 6px
--radius-md: calc(var(--radius) - 2px) = 8px
--radius-lg: var(--radius) = 10px
--radius-xl: calc(var(--radius) + 4px) = 14px
```

### Radius Scale

| Class | Size | Pixels | Usage |
|-------|------|--------|-------|
| `rounded-none` | 0 | 0px | No rounding |
| `rounded-sm` | sm | 6px | Small elements |
| `rounded` | md | 8px | Default radius |
| `rounded-md` | md | 8px | Same as rounded |
| `rounded-lg` | lg | 10px | Cards, buttons |
| `rounded-xl` | xl | 14px | Large cards |
| `rounded-full` | 9999px | Full | Avatars, pills |

### Radius Examples

```tsx
// Button
<Button className="rounded-lg">Click me</Button>

// Card
<Card className="rounded-lg">Card content</Card>

// Input
<Input className="rounded-md" />

// Avatar
<Avatar className="rounded-full">...</Avatar>

// Pill/Badge
<Badge className="rounded-full px-3 py-1">New</Badge>

// Mixed radius
<div className="rounded-t-lg rounded-b-none">
  Top rounded, bottom square
</div>
```

### Radius Guidelines

- **Buttons**: `rounded-lg` (10px)
- **Cards**: `rounded-lg` (10px)
- **Inputs**: `rounded-md` (8px)
- **Badges**: `rounded-full` or `rounded-md`
- **Avatars**: `rounded-full`
- **Modals**: `rounded-xl` (14px)

---

## Component Patterns

### Cards

```tsx
<Card className="border-0 bg-card shadow-sm">
  <CardHeader>
    <CardTitle className="text-foreground">Title</CardTitle>
    <CardDescription className="text-muted-foreground">
      Description
    </CardDescription>
  </CardHeader>
  <CardContent>
    <p className="text-foreground">Content</p>
  </CardContent>
  <CardFooter className="flex justify-end gap-2">
    <Button variant="outline">Cancel</Button>
    <Button>Submit</Button>
  </CardFooter>
</Card>
```

### Buttons

```tsx
// Primary
<Button className="bg-brand text-brand-foreground hover:bg-brand/90">
  Primary Action
</Button>

// Secondary
<Button variant="secondary">
  Secondary Action
</Button>

// Outline
<Button variant="outline">
  Cancel
</Button>

// Destructive
<Button variant="destructive">
  Delete
</Button>

// Ghost
<Button variant="ghost">
  Ghost
</Button>
```

### Inputs

```tsx
<div className="space-y-2">
  <label className="text-sm font-medium text-foreground">
    Email
  </label>
  <Input
    type="email"
    placeholder="Enter your email"
    className="border-input bg-background text-foreground"
  />
  <p className="text-xs text-muted-foreground">
    We'll never share your email.
  </p>
</div>
```

### Tables

```tsx
<Table>
  <TableHeader>
    <TableRow className="border-border">
      <TableHead className="text-muted-foreground">Name</TableHead>
      <TableHead className="text-muted-foreground">Status</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow className="border-border hover:bg-accent">
      <TableCell className="text-foreground">John Doe</TableCell>
      <TableCell>
        <Badge className="bg-brand text-brand-foreground">Active</Badge>
      </TableCell>
    </TableRow>
  </TableBody>
</Table>
```

---

## Best Practices

### Color Usage

1. **Always use semantic variables** - Never hardcode colors
2. **Test in both themes** - Ensure components work in light and dark mode
3. **Use opacity sparingly** - Prefer semantic variables over opacity variations
4. **Brand color** - Use `text-brand` or `bg-brand` for brand elements

### Dark Mode Checklist

- [ ] No `text-black` or `bg-white`
- [ ] No hardcoded hex colors (except brand color)
- [ ] All borders use `border-border` or `border-input`
- [ ] Text uses `text-foreground` or `text-muted-foreground`
- [ ] Backgrounds use `bg-card`, `bg-background`, or `bg-muted`
- [ ] Hover states use `hover:bg-accent`

### Accessibility

1. **Color contrast** - Ensure text has sufficient contrast (WCAG AA)
2. **Focus states** - Always provide visible focus indicators using `ring`
3. **Semantic HTML** - Use proper heading hierarchy
4. **Interactive elements** - Must have clear hover and active states

### Consistency

1. **Spacing** - Use consistent spacing patterns (4px increments)
2. **Typography** - Maintain hierarchy with font sizes and weights
3. **Radius** - Use consistent border radius across components
4. **Shadows** - Use minimal shadows, increase for elevated UI

### Performance

1. **Transitions** - Use `transition-colors`, `transition-shadow` for smooth UI
2. **Avoid heavy shadows** - Prefer subtle shadows for better performance
3. **Minimize repaints** - Use CSS variables for theme switching

---

## Quick Reference

### Common Classes

```css
/* Backgrounds */
bg-background    /* Page background */
bg-card          /* Card/panel background */
bg-muted         /* Muted background */
bg-accent        /* Hover state */

/* Text */
text-foreground         /* Primary text */
text-muted-foreground   /* Secondary text */
text-brand              /* Brand orange */

/* Borders */
border-border    /* Default border */
border-input     /* Input border */

/* Interactive States */
hover:bg-accent          /* Hover background */
hover:text-foreground    /* Hover text */
focus:ring-ring          /* Focus ring */
focus:border-ring        /* Focus border */
```

### Component Defaults

```tsx
// Card
<Card className="border-0 bg-card shadow-sm rounded-lg p-6">

// Button
<Button className="rounded-lg">

// Input
<Input className="rounded-md border-input">

// Text heading
<h1 className="text-3xl font-bold text-foreground">

// Text paragraph
<p className="text-base text-muted-foreground">
```

---

## Resources

- [OKLCH Color Space](https://oklch.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Accessibility Guidelines (WCAG)](https://www.w3.org/WAI/WCAG21/quickref/)

---

**Questions or suggestions?** Open an issue or discussion on GitHub.

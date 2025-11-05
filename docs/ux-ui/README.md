# UX/UI Documentation

Design system and component guidelines for FindSomeone.

## Documentation Files

### [Design System](./DESIGN_SYSTEM.md)
Complete design system documentation including:
- Color palette (light & dark mode)
- Typography scale
- Spacing system
- Border and shadow guidelines
- Border radius
- Best practices

### [Component Examples](./COMPONENT_EXAMPLES.md)
Practical, copy-paste ready examples:
- Admin dashboard cards
- Forms and inputs
- Tables and data displays
- Navigation patterns
- Modals and dialogs
- Badges and status indicators
- Loading states
- Search and filters
- Alerts and messages
- Page layouts

## Quick Start

### Using Semantic Colors

Always use CSS variables instead of hardcoded colors:

```tsx
// ✅ CORRECT
<div className="bg-card text-foreground border-border">

// ❌ INCORRECT
<div className="bg-white text-black border-gray-200">
```

### Common Patterns

```tsx
// Card with proper theming
<Card className="border-0 bg-card shadow-sm">
  <CardHeader>
    <CardTitle className="text-foreground">Title</CardTitle>
  </CardHeader>
  <CardContent>
    <p className="text-muted-foreground">Description</p>
  </CardContent>
</Card>

// Button with brand color
<Button className="bg-brand text-brand-foreground hover:bg-brand/90">
  Action
</Button>

// Input with semantic colors
<Input className="border-input bg-background text-foreground" />
```

## Design Principles

1. **Consistency** - Use the design system tokens consistently
2. **Accessibility** - Ensure proper contrast and keyboard navigation
3. **Responsiveness** - Mobile-first, adaptive layouts
4. **Performance** - Minimize repaints, use efficient animations
5. **Theme Support** - All components must work in light and dark modes

## Color Variables

| Variable | Light | Dark | Usage |
|----------|-------|------|-------|
| `background` | Very light | Dark | Page background |
| `foreground` | Very dark | Very light | Primary text |
| `card` | White | Darker | Card background |
| `muted-foreground` | Gray | Light gray | Secondary text |
| `border` | Light gray | Medium gray | Borders |
| `brand` | Orange | Orange | Brand color (same in both) |

## Typography Hierarchy

```tsx
<h1 className="text-3xl font-bold text-foreground">Page Title</h1>
<h2 className="text-2xl font-semibold text-foreground">Section</h2>
<p className="text-base text-muted-foreground">Body text</p>
<span className="text-sm text-muted-foreground">Caption</span>
```

## Spacing Scale

- `p-2` (8px) - Tight spacing
- `p-4` (16px) - Standard spacing
- `p-6` (24px) - Card padding
- `p-8` (32px) - Section spacing
- `gap-4` (16px) - Grid/flex gaps

## Common Mistakes to Avoid

1. ❌ Hardcoding colors: `bg-white`, `text-black`
2. ❌ Using Tailwind gray scale: `bg-gray-100`
3. ❌ Inconsistent spacing: random px values
4. ❌ Missing dark mode testing
5. ❌ Poor contrast ratios

## Resources

- [OKLCH Color Picker](https://oklch.com/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)
- [WCAG Contrast Checker](https://webaim.org/resources/contrastchecker/)

---

**Need help?** Check the [Design System](./DESIGN_SYSTEM.md) for detailed guidelines or [Component Examples](./COMPONENT_EXAMPLES.md) for copy-paste code.

# Component Examples

Practical examples of common UI patterns used in FindSomeone.

---

## Admin Dashboard Cards

### Statistics Card

```tsx
<Card className="border-0 bg-card shadow-sm">
  <CardContent className="py-6">
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-lg bg-brand/10 flex items-center justify-center flex-shrink-0">
        <IconComponent className="w-6 h-6 text-brand" />
      </div>
      <div>
        <p className="text-sm font-medium text-muted-foreground mb-1">
          Metric Label
        </p>
        <div className="flex items-baseline gap-2">
          <div className="text-3xl font-bold text-foreground">1,234</div>
          <p className="text-xs text-muted-foreground">total</p>
        </div>
      </div>
    </div>
  </CardContent>
</Card>
```

### Action Card

```tsx
<Card className="border border-border bg-card hover:shadow-md transition-shadow">
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <IconComponent className="w-5 h-5 text-brand" />
      Card Title
    </CardTitle>
    <CardDescription className="text-muted-foreground">
      Brief description of the action
    </CardDescription>
  </CardHeader>
  <CardFooter>
    <Button className="w-full bg-brand text-brand-foreground hover:bg-brand/90">
      Take Action
    </Button>
  </CardFooter>
</Card>
```

---

## Forms

### Standard Form Field

```tsx
<div className="space-y-2">
  <label htmlFor="field" className="text-sm font-medium text-foreground">
    Field Label
  </label>
  <Input
    id="field"
    type="text"
    placeholder="Enter value"
    className="border-input bg-background text-foreground"
  />
  <p className="text-xs text-muted-foreground">
    Helpful description or validation message
  </p>
</div>
```

### Form with Validation Error

```tsx
<div className="space-y-2">
  <label htmlFor="email" className="text-sm font-medium text-foreground">
    Email Address
  </label>
  <Input
    id="email"
    type="email"
    placeholder="email@example.com"
    className="border-destructive focus:ring-destructive"
  />
  <p className="text-xs text-destructive">
    Please enter a valid email address
  </p>
</div>
```

### Checkbox with Label

```tsx
<div className="flex items-center space-x-2">
  <Checkbox
    id="terms"
    className="border-input data-[state=checked]:bg-brand data-[state=checked]:border-brand"
  />
  <label
    htmlFor="terms"
    className="text-sm font-medium text-foreground cursor-pointer"
  >
    Accept terms and conditions
  </label>
</div>
```

---

## Tables

### Data Table

```tsx
<div className="rounded-lg border border-border bg-card">
  <Table>
    <TableHeader>
      <TableRow className="border-border bg-muted/50">
        <TableHead className="text-muted-foreground font-semibold">
          Name
        </TableHead>
        <TableHead className="text-muted-foreground font-semibold">
          Status
        </TableHead>
        <TableHead className="text-muted-foreground font-semibold text-right">
          Actions
        </TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow className="border-border hover:bg-accent transition-colors">
        <TableCell className="font-medium text-foreground">
          John Doe
        </TableCell>
        <TableCell>
          <Badge className="bg-brand/10 text-brand border-0">
            Active
          </Badge>
        </TableCell>
        <TableCell className="text-right">
          <Button variant="ghost" size="sm">
            Edit
          </Button>
        </TableCell>
      </TableRow>
    </TableBody>
  </Table>
</div>
```

### Table with Empty State

```tsx
<div className="rounded-lg border border-border bg-card">
  <Table>
    <TableHeader>
      {/* ... headers ... */}
    </TableHeader>
    <TableBody>
      <TableRow>
        <TableCell colSpan={3} className="h-24 text-center">
          <div className="flex flex-col items-center gap-2">
            <p className="text-sm text-muted-foreground">No results found</p>
            <Button size="sm" className="bg-brand text-brand-foreground">
              Add New Item
            </Button>
          </div>
        </TableCell>
      </TableRow>
    </TableBody>
  </Table>
</div>
```

---

## Navigation

### Tab Navigation

```tsx
<Tabs defaultValue="overview" className="w-full">
  <TabsList className="bg-muted">
    <TabsTrigger
      value="overview"
      className="data-[state=active]:bg-background data-[state=active]:text-foreground"
    >
      Overview
    </TabsTrigger>
    <TabsTrigger
      value="details"
      className="data-[state=active]:bg-background data-[state=active]:text-foreground"
    >
      Details
    </TabsTrigger>
  </TabsList>
  <TabsContent value="overview">
    {/* Content */}
  </TabsContent>
</Tabs>
```

### Breadcrumbs

```tsx
<nav className="flex items-center space-x-2 text-sm">
  <Link
    href="/admin"
    className="text-muted-foreground hover:text-foreground transition-colors"
  >
    Admin
  </Link>
  <ChevronRight className="w-4 h-4 text-muted-foreground" />
  <Link
    href="/admin/posts"
    className="text-muted-foreground hover:text-foreground transition-colors"
  >
    Posts
  </Link>
  <ChevronRight className="w-4 h-4 text-muted-foreground" />
  <span className="text-foreground font-medium">Edit Post</span>
</nav>
```

---

## Modals & Dialogs

### Confirmation Dialog

```tsx
<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="destructive">Delete Item</Button>
  </AlertDialogTrigger>
  <AlertDialogContent className="bg-card border-border">
    <AlertDialogHeader>
      <AlertDialogTitle className="text-foreground">
        Are you absolutely sure?
      </AlertDialogTitle>
      <AlertDialogDescription className="text-muted-foreground">
        This action cannot be undone. This will permanently delete the item
        from our servers.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel className="border-border">
        Cancel
      </AlertDialogCancel>
      <AlertDialogAction className="bg-destructive text-destructive-foreground">
        Delete
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

### Form Dialog

```tsx
<Dialog>
  <DialogTrigger asChild>
    <Button className="bg-brand text-brand-foreground">
      Create New
    </Button>
  </DialogTrigger>
  <DialogContent className="bg-card border-border sm:max-w-md">
    <DialogHeader>
      <DialogTitle className="text-foreground">Create Item</DialogTitle>
      <DialogDescription className="text-muted-foreground">
        Fill in the details below to create a new item.
      </DialogDescription>
    </DialogHeader>
    <div className="space-y-4 py-4">
      {/* Form fields */}
    </div>
    <DialogFooter>
      <Button variant="outline" className="border-border">
        Cancel
      </Button>
      <Button className="bg-brand text-brand-foreground">
        Create
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

---

## Badges & Pills

### Status Badges

```tsx
// Active/Success
<Badge className="bg-emerald-500/10 text-emerald-600 border-0 dark:bg-emerald-500/20 dark:text-emerald-400">
  Active
</Badge>

// Warning
<Badge className="bg-amber-500/10 text-amber-600 border-0 dark:bg-amber-500/20 dark:text-amber-400">
  Pending
</Badge>

// Error/Inactive
<Badge className="bg-red-500/10 text-red-600 border-0 dark:bg-red-500/20 dark:text-red-400">
  Inactive
</Badge>

// Info
<Badge className="bg-blue-500/10 text-blue-600 border-0 dark:bg-blue-500/20 dark:text-blue-400">
  Draft
</Badge>

// Brand
<Badge className="bg-brand/10 text-brand border-0">
  Featured
</Badge>
```

### Count Badge

```tsx
<div className="relative">
  <Button variant="ghost" size="icon">
    <Bell className="w-5 h-5" />
  </Button>
  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand text-brand-foreground text-xs font-bold">
    3
  </span>
</div>
```

---

## Loading States

### Skeleton Loader

```tsx
<Card className="border-0 bg-card shadow-sm">
  <CardContent className="py-6">
    <div className="flex items-center gap-4">
      <Skeleton className="w-12 h-12 rounded-lg bg-muted" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-4 w-24 bg-muted" />
        <Skeleton className="h-8 w-16 bg-muted" />
      </div>
    </div>
  </CardContent>
</Card>
```

### Spinner

```tsx
<div className="flex items-center justify-center p-8">
  <Loader2 className="w-8 h-8 animate-spin text-brand" />
</div>
```

---

## Search & Filters

### Search Bar

```tsx
<div className="relative">
  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
  <Input
    type="search"
    placeholder="Search..."
    className="pl-9 border-input bg-background"
  />
</div>
```

### Filter Dropdown

```tsx
<Select>
  <SelectTrigger className="w-[180px] border-input bg-background">
    <SelectValue placeholder="Filter by status" />
  </SelectTrigger>
  <SelectContent className="bg-popover border-border">
    <SelectItem value="all" className="hover:bg-accent">
      All Items
    </SelectItem>
    <SelectItem value="active" className="hover:bg-accent">
      Active
    </SelectItem>
    <SelectItem value="inactive" className="hover:bg-accent">
      Inactive
    </SelectItem>
  </SelectContent>
</Select>
```

---

## Alerts & Messages

### Info Alert

```tsx
<Alert className="border-blue-500/50 bg-blue-500/10">
  <InfoIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
  <AlertTitle className="text-blue-900 dark:text-blue-100">
    Information
  </AlertTitle>
  <AlertDescription className="text-blue-800 dark:text-blue-200">
    This is an informational message.
  </AlertDescription>
</Alert>
```

### Success Alert

```tsx
<Alert className="border-emerald-500/50 bg-emerald-500/10">
  <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
  <AlertTitle className="text-emerald-900 dark:text-emerald-100">
    Success
  </AlertTitle>
  <AlertDescription className="text-emerald-800 dark:text-emerald-200">
    Operation completed successfully.
  </AlertDescription>
</Alert>
```

### Error Alert

```tsx
<Alert variant="destructive">
  <AlertCircle className="h-4 w-4" />
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>
    Something went wrong. Please try again.
  </AlertDescription>
</Alert>
```

---

## Page Layouts

### Admin Page Template

```tsx
export default function AdminPage() {
  return (
    <>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Page Title
        </h1>
        <p className="text-muted-foreground">
          Page description or subtitle
        </p>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Stat cards */}
      </div>

      {/* Main Content */}
      <Card className="border-0 bg-card shadow-sm">
        <CardHeader>
          <CardTitle>Section Title</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Content */}
        </CardContent>
      </Card>
    </>
  )
}
```

### Dashboard Grid

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <Card className="border-0 bg-card shadow-sm">
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <IconComponent className="w-5 h-5 text-brand" />
        Card Title
      </CardTitle>
    </CardHeader>
    <CardContent>
      {/* Content */}
    </CardContent>
  </Card>
</div>
```

---

## Interactive Elements

### Dropdown Menu

```tsx
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline" size="icon">
      <MoreVertical className="w-4 h-4" />
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end" className="bg-popover border-border">
    <DropdownMenuItem className="hover:bg-accent cursor-pointer">
      <Edit className="w-4 h-4 mr-2" />
      Edit
    </DropdownMenuItem>
    <DropdownMenuItem className="hover:bg-accent cursor-pointer">
      <Trash className="w-4 h-4 mr-2" />
      Delete
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

### Tooltip

```tsx
<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <Button variant="ghost" size="icon">
        <HelpCircle className="w-4 h-4" />
      </Button>
    </TooltipTrigger>
    <TooltipContent className="bg-popover border-border">
      <p className="text-sm text-popover-foreground">
        Helpful tooltip text
      </p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
```

---

## Responsive Patterns

### Mobile-First Grid

```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  {/* Items automatically adjust to screen size */}
</div>
```

### Hide/Show on Breakpoints

```tsx
{/* Show only on mobile */}
<div className="block md:hidden">
  Mobile content
</div>

{/* Hide on mobile */}
<div className="hidden md:block">
  Desktop content
</div>

{/* Different layouts */}
<div className="flex flex-col md:flex-row gap-4">
  {/* Stacked on mobile, side-by-side on desktop */}
</div>
```

---

**Pro Tip:** Always test components in both light and dark modes to ensure proper contrast and visibility.

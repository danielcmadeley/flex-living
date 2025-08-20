# Dashboard Sidebar Structure

This document outlines the new sidebar-based dashboard structure for the Flex Living application.

## Overview

The dashboard has been restructured from a tab-based layout to a modern sidebar navigation pattern using shadcn/ui's Sidebar component. This provides better navigation, improved UX, and a more scalable architecture.

## Structure

### Main Components

- **DashboardSidebar** (`components/DashboardSidebar.tsx`): Main sidebar layout wrapper
- **DashboardContent** (`components/DashboardContent.tsx`): Route-based content router
- **Page Components** (`pages/`): Individual page implementations

### Navigation Sections

#### Main Navigation
- **Home** (`/dashboard`) - Dashboard overview with key metrics and performance summaries
- **Properties** (`/dashboard/properties`) - Individual property analytics and insights
- **Reviews** (`/dashboard/reviews`) - Review management and moderation
- **Analytics** (`/dashboard/analytics`) - Advanced analytics and reports  
- **Search** (`/dashboard/search`) - Search and filter reviews

#### Management Section
- **Seed Database** (`/dashboard/seed`) - Database seeding and management tools
- **Settings** (`/dashboard/settings`) - Application configuration

### Features

#### Sidebar Features
- **Collapsible Navigation**: Responsive sidebar that can collapse on smaller screens
- **Active State Indication**: Visual feedback for current page
- **User Profile Dropdown**: Quick access to user settings and logout
- **Notification Center**: Integrated notifications in the header
- **Tooltips**: Helpful descriptions for navigation items

#### Page-Specific Features

##### Home Page
- Dashboard overview cards
- Performance charts
- Advanced analytics summary
- Key metrics summary

##### Properties Page
- Property selection grid
- Individual property metrics
- Rating trends over time
- Category performance radar charts
- Monthly review volume charts

##### Reviews Page
- Review management table
- Status updates
- Filtering and search
- Export functionality

##### Analytics Page
- Advanced analytics components
- Deep insights and metrics
- Specialized charts and visualizations

##### Search Page
- Search analytics
- Filter interface
- Review pattern analysis

##### Seed Page
- Sample data sets
- Custom data upload
- Database management tools
- Progress indicators

## File Structure

```
src/app/dashboard/
├── README.md                          # This file
├── page.tsx                          # Main dashboard route
├── components/
│   ├── DashboardSidebar.tsx          # Main sidebar layout
│   ├── DashboardContent.tsx          # Route-based content router
│   ├── DashboardOverview.tsx         # Overview metrics cards
│   ├── DashboardFilters.tsx          # Filtering interface
│   ├── AdvancedAnalytics.tsx         # Advanced analytics component
│   ├── PerformanceCharts.tsx         # Performance visualization
│   ├── ReviewsTable.tsx              # Review management table
│   ├── ReviewStatusSelect.tsx        # Review status updates
│   ├── NotificationCenter.tsx        # Notification system
│   └── LogoutButton.tsx              # Logout functionality
├── pages/
│   ├── HomePage.tsx                  # Dashboard home content
│   ├── PropertiesPage.tsx            # Properties analytics
│   └── SeedPage.tsx                  # Database seeding
├── properties/
│   └── page.tsx                      # Properties route
├── reviews/
│   └── page.tsx                      # Reviews route
├── analytics/
│   └── page.tsx                      # Analytics route
├── search/
│   └── page.tsx                      # Search route
├── seed/
│   └── page.tsx                      # Seed route
└── settings/
    └── page.tsx                      # Settings route
```

## Navigation Flow

1. **Authentication**: All routes require authentication and redirect to `/login` if not authenticated
2. **Sidebar Navigation**: Click sidebar items to navigate between sections
3. **Content Rendering**: `DashboardContent` component routes to appropriate page based on URL
4. **Data Loading**: Each page manages its own data fetching and state
5. **Responsive Design**: Sidebar collapses on mobile devices

## Key Benefits

### User Experience
- **Consistent Navigation**: Always-visible sidebar for easy navigation
- **Visual Hierarchy**: Clear section grouping (Navigation vs Management)
- **Quick Access**: User profile and notifications always accessible
- **Responsive Design**: Works well on all screen sizes

### Developer Experience
- **Route-Based Architecture**: Each page is a separate component
- **Reusable Components**: Shared components across different pages
- **Type Safety**: Full TypeScript support throughout
- **Scalable Structure**: Easy to add new pages and features

### Performance
- **Code Splitting**: Each route can be lazy loaded
- **Efficient Re-renders**: Only active page components render
- **Optimized Queries**: Data fetching scoped to individual pages

## Usage Examples

### Adding a New Page

1. Create page component in `pages/` directory:
```tsx
export function NewPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">New Page</h1>
        <p className="text-muted-foreground">Page description</p>
      </div>
      {/* Page content */}
    </div>
  );
}
```

2. Add route to `DashboardContent.tsx`:
```tsx
case "/dashboard/new-page":
  return <NewPage />;
```

3. Add navigation item to `DashboardSidebar.tsx`:
```tsx
{
  title: "New Page",
  url: "/dashboard/new-page",
  icon: IconComponent,
  description: "Page description",
}
```

4. Create route file:
```tsx
// src/app/dashboard/new-page/page.tsx
import DashboardContent from "../components/DashboardContent";
// ... auth logic
return <DashboardContent user={user} />;
```

### Customizing Sidebar

The sidebar can be customized by modifying the navigation arrays in `DashboardSidebar.tsx`:

- `navigationItems`: Main navigation section
- `managementItems`: Management section items

### Styling and Theming

The sidebar uses shadcn/ui's theming system with CSS custom properties. Colors and spacing can be customized in `globals.css` under the sidebar-specific variables.

## Dependencies

- **@radix-ui/react-***: UI component primitives
- **shadcn/ui**: UI component library
- **next/navigation**: Next.js routing hooks
- **recharts**: Chart library for analytics
- **@tanstack/react-query**: Data fetching and caching

## Future Enhancements

- **Breadcrumb Navigation**: Add breadcrumbs for deeper page hierarchies
- **Search**: Global search functionality in sidebar
- **Shortcuts**: Keyboard shortcuts for navigation
- **Customization**: User-configurable sidebar layout
- **Progressive Enhancement**: Enhanced features for users with JavaScript enabled
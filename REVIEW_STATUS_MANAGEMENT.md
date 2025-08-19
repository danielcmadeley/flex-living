# Review Status Management System

## Overview

The Flex Living dashboard now includes a comprehensive review status management system that allows property managers to control which reviews are displayed on the public website. This system implements three status levels: **Published**, **Pending**, and **Draft**.

## Status Types

### 📢 Published
- Reviews that are visible on the public website
- Fully approved and ready for public viewing
- These reviews appear in the public reviews feed at `/`

### ⏳ Pending
- Reviews awaiting manager approval
- Not visible on the public website
- Managers can review and decide to publish or move to draft

### 📝 Draft
- Reviews that are hidden from public view
- May need editing, follow-up, or are inappropriate for public display
- Completely private to the management dashboard

## Features

### 1. Review Status Selection
- **Location**: Dashboard → Review Management tab
- **Interface**: Dropdown selector for each review
- **Real-time Updates**: Status changes are immediately saved to the database
- **Visual Feedback**: 
  - Color-coded status badges
  - Loading indicators during updates
  - Success/error toast notifications

### 2. Status Filtering
- **Filter by Status**: View only published, pending, or draft reviews
- **Combined Filters**: Status can be combined with other filters (property, type, rating)
- **Quick Overview**: See count of reviews by status

### 3. Public Website Integration
- **Automatic Filtering**: Public page (`/`) only shows published reviews
- **SEO Friendly**: Only quality, approved content is publicly visible
- **Performance**: Efficient database queries with status filtering

## Implementation Details

### Database Schema
```sql
-- Reviews table includes status column
status VARCHAR(20) NOT NULL DEFAULT 'published'
```

### API Endpoints

#### Update Review Status
```
PATCH /api/reviews/[id]
Body: { "status": "published" | "pending" | "draft" }
```

#### Get Reviews with Status Filter
```
GET /api/reviews/hostaway?status=published
```

### Components

#### ReviewStatusSelect
- Interactive dropdown for status changes
- Optimistic updates with error handling
- Visual state indicators

#### DashboardFilters
- Status filtering capabilities
- Integration with existing filter system

## Usage Guide

### For Property Managers

1. **Navigate to Dashboard**
   - Log in to the management dashboard
   - Go to "Review Management" tab

2. **Change Review Status**
   - Find the review you want to manage
   - Click the status dropdown in the "Status" column
   - Select the new status (Published/Pending/Draft)
   - Changes are saved automatically

3. **Filter Reviews by Status**
   - Use the "Status" filter dropdown above the table
   - Select specific status or "All Statuses"
   - Combine with other filters as needed

4. **Monitor Public Content**
   - Only "Published" reviews appear on the public website
   - Use filters to review pending items
   - Move inappropriate content to "Draft" status

### Status Change Workflow

```
New Review → Pending → Manager Review → Published/Draft
                                    ↓
                              Public Website
```

## Technical Architecture

### Frontend
- **React Components**: Status selection with real-time updates
- **State Management**: TanStack Query for data fetching and caching
- **UI Components**: Shadcn/ui for consistent interface
- **Notifications**: Sonner for user feedback

### Backend
- **API Routes**: RESTful endpoints for status management
- **Database**: PostgreSQL with Drizzle ORM
- **Validation**: Zod schemas for type safety
- **Error Handling**: Comprehensive error responses

### Security
- **Authentication**: Supabase Auth integration
- **Authorization**: Manager-only access to status changes
- **Validation**: Server-side status validation
- **Audit Trail**: Updated timestamps for changes

## Benefits

### For Business
- **Quality Control**: Only approved reviews are public
- **Brand Protection**: Hide inappropriate or problematic reviews
- **Content Curation**: Showcase the best guest experiences
- **Compliance**: Manage reviews according to platform policies

### For Managers
- **Easy Management**: Intuitive interface for status changes
- **Bulk Operations**: Filter and manage multiple reviews
- **Real-time Updates**: Instant feedback on changes
- **Comprehensive View**: See all reviews regardless of status

### For Users
- **Quality Content**: Public page shows only curated reviews
- **Better Experience**: Higher quality, relevant reviews
- **Trust Building**: Consistent, professional review presentation

## Future Enhancements

### Planned Features
- **Bulk Status Updates**: Select multiple reviews for status changes
- **Automated Rules**: Auto-publish based on rating thresholds
- **Review Comments**: Internal notes for managers
- **Status History**: Track status change timeline
- **Email Notifications**: Alert managers of new pending reviews

### Advanced Features
- **AI Content Moderation**: Automatic inappropriate content detection
- **Review Templates**: Suggested responses for different scenarios
- **Analytics Dashboard**: Status change metrics and trends
- **Integration APIs**: Connect with property management systems

## Troubleshooting

### Common Issues

1. **Status not updating**
   - Check internet connection
   - Refresh the page
   - Verify manager permissions

2. **Reviews not appearing on public page**
   - Ensure status is set to "Published"
   - Check if other filters are applied
   - Verify database connection

3. **Performance issues**
   - Status filtering is optimized for large datasets
   - Pagination handles thousands of reviews
   - Database indexes optimize query performance

### Support
For technical issues or feature requests, contact the development team or check the project repository for updates.
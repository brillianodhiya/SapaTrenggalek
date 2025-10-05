# Implementation Plan

- [ ] 1. Set up database schema for urgent items tracking

  - [x] 1.1 Create urgent_item_actions table for action tracking

    - Create table with proper foreign key relationships to data_entries
    - Add indexes for performance optimization on item_id and created_at
    - Include action types (handled, escalated, assigned) and user tracking
    - _Requirements: 3.2, 3.3, 3.4, 3.5_

  - [x] 1.2 Extend data_entries table with status and assignment fields

    - Add status, assigned_to, handled_by, handled_at, escalated_at columns
    - Create composite index for urgency_level, status, and created_at
    - Update existing entries to have default 'baru' status
    - _Requirements: 3.1, 3.2, 3.4_

- [ ] 2. Create API endpoints for urgent items management

  - [ ] 2.1 Implement GET /api/urgent-items endpoint

    - Create endpoint to fetch urgent items with urgency_level >= 7
    - Add filtering by category, source, time range, and status
    - Implement pagination and sorting by urgency level and recency
    - _Requirements: 1.1, 1.2, 2.1, 2.2, 2.3_

  - [ ] 2.2 Implement action endpoints for item management

    - Create POST /api/urgent-items/:id/handle endpoint for marking items as handled
    - Create POST /api/urgent-items/:id/escalate endpoint for escalating items
    - Create POST /api/urgent-items/:id/assign endpoint for assigning items
    - Add proper error handling and validation for all action endpoints
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [ ] 2.3 Create statistics endpoint for urgent items dashboard
    - Implement GET /api/urgent-items/stats endpoint
    - Calculate total urgent items, category breakdown, and response metrics
    - Add trending data for hourly and daily patterns
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 3. Build urgent items page components

  - [ ] 3.1 Create main UrgentItemsPage component

    - Build page layout with header, filters, and items list
    - Implement auto-refresh functionality every 5 minutes
    - Add loading states and error handling
    - _Requirements: 1.1, 1.4, 5.4_

  - [ ] 3.2 Implement FilterPanel component

    - Create filter controls for category, source, and time range
    - Add search functionality with debounced input
    - Display filter result counts and active filter indicators
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [ ] 3.3 Build UrgentItemCard component
    - Design card layout with urgency indicators and color coding
    - Display item content, source, author, and timestamp
    - Add action buttons for handle, escalate, and assign
    - _Requirements: 1.3, 4.1, 4.2, 3.1_

- [ ] 4. Implement action handling system

  - [ ] 4.1 Create action handlers for urgent item management

    - Implement handle item functionality with status updates
    - Create escalation logic with priority increase
    - Build assignment system with department/person selection
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [ ] 4.2 Add action logging and audit trail
    - Log all actions with user information and timestamps
    - Create action history display for each item
    - Implement rollback capability for incorrect actions
    - _Requirements: 3.5, 5.1_

- [ ] 5. Build detailed item view and modal

  - [ ] 5.1 Create ItemModal component for detailed view

    - Display full item content and AI analysis results
    - Show related entries and engagement metrics
    - Provide direct link to original source
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [ ] 5.2 Implement expandable item details
    - Add expand/collapse functionality for item cards
    - Show additional metadata and analysis when expanded
    - Include action history and status timeline
    - _Requirements: 4.1, 4.2, 4.3_

- [ ] 6. Add real-time updates and notifications

  - [ ] 6.1 Implement auto-refresh mechanism

    - Set up automatic data refresh every 5 minutes
    - Add manual refresh button with loading indicator
    - Show last updated timestamp in header
    - _Requirements: 1.4, 5.4_

  - [ ] 6.2 Add visual indicators and notifications
    - Implement urgency level color coding (red, orange, yellow)
    - Add notification badges for new urgent items
    - Create toast notifications for successful actions
    - _Requirements: 1.3, 1.5, 3.1_

- [ ] 7. Create statistics and monitoring dashboard

  - [ ] 7.1 Build QuickStats component

    - Display total urgent items and category breakdown
    - Show average response time and handled items count
    - Add trend indicators for increasing/decreasing urgency
    - _Requirements: 5.1, 5.2, 5.3_

  - [ ] 7.2 Implement export functionality
    - Create export button for urgent items data
    - Support CSV and JSON export formats
    - Include filtering options in exported data
    - _Requirements: 5.5_

- [ ] 8. Add navigation and routing

  - [ ] 8.1 Create urgent items page route

    - Add /admin/urgent-items route to Next.js app
    - Implement proper authentication and authorization
    - Add navigation link in admin sidebar
    - _Requirements: 1.1, 3.1_

  - [ ] 8.2 Update admin navigation
    - Add "Item Mendesak" link to AdminSidebar component
    - Include urgent items count badge in navigation
    - Add keyboard shortcuts for quick access
    - _Requirements: 1.1, 1.3_

- [ ]\* 9. Add comprehensive testing

  - [ ]\* 9.1 Create unit tests for components

    - Test UrgentItemsPage component with different states
    - Test FilterPanel functionality and state management
    - Test UrgentItemCard rendering and action handling
    - _Requirements: 1.1, 2.1, 3.1_

  - [ ]\* 9.2 Create integration tests for API endpoints

    - Test urgent items fetching with various filters
    - Test action endpoints (handle, escalate, assign)
    - Test statistics endpoint and data accuracy
    - _Requirements: 3.1, 3.2, 3.3, 5.1_

  - [ ]\* 9.3 Add end-to-end tests for user workflows
    - Test complete urgent item handling workflow
    - Test filtering and search functionality
    - Test real-time updates and refresh mechanisms
    - _Requirements: 1.1, 2.1, 3.1, 1.4_

- [ ] 10. Optimize performance and accessibility

  - [ ] 10.1 Implement performance optimizations

    - Add virtual scrolling for large urgent items lists
    - Implement debounced search and filtering
    - Add caching for frequently accessed data
    - _Requirements: 1.1, 2.4, 5.4_

  - [ ] 10.2 Ensure accessibility compliance
    - Add proper ARIA labels and roles for urgent indicators
    - Implement keyboard navigation for all actions
    - Ensure color contrast meets accessibility standards
    - _Requirements: 1.3, 3.1, 4.1_

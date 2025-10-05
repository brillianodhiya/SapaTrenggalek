# Design Document: Urgent Items Page

## Overview

The Urgent Items page provides a dedicated interface for government officials and administrators to monitor and respond to high-priority data entries. The design emphasizes immediate visibility, quick action capabilities, and efficient workflow management for critical situations requiring prompt government response.

## Architecture

### Page Structure

```
┌─────────────────────────────────────────────────────────────┐
│                    Header with Stats                        │
│  🚨 12 Urgent Items | 🔄 Last Updated: 2 min ago | 📊 Stats │
├─────────────────────────────────────────────────────────────┤
│                    Filters & Actions                        │
│  [Category ▼] [Source ▼] [Time ▼] [🔍 Search] [📤 Export]   │
├─────────────────────────────────────────────────────────────┤
│                    Urgent Items List                        │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ 🔴 LEVEL 9 | 📰 News | 🕐 5 min ago                    │ │
│  │ Banjir besar melanda Kecamatan Panggul...              │ │
│  │ [👁️ View] [✅ Handle] [⬆️ Escalate] [👤 Assign]        │ │
│  └─────────────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ 🟠 LEVEL 8 | 🐦 Twitter | 🕐 12 min ago                │ │
│  │ Jalan rusak parah di Trenggalek, mohon segera...       │ │
│  │ [👁️ View] [✅ Handle] [⬆️ Escalate] [👤 Assign]        │ │
│  └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                    Quick Stats Panel                        │
│  📊 Response Time: 15 min avg | 🎯 Handled Today: 8/12     │
└─────────────────────────────────────────────────────────────┘
```

### Component Architecture

```
UrgentItemsPage
├── UrgentHeader (stats, refresh indicator)
├── FilterPanel (category, source, time filters)
├── UrgentItemsList
│   ├── UrgentItemCard (individual urgent items)
│   ├── ActionButtons (handle, escalate, assign)
│   └── ItemDetails (expandable details)
├── QuickStats (response metrics)
└── ItemModal (detailed view and actions)
```

## Components and Interfaces

### 1. UrgentItemsPage Component

**Main page component with real-time updates:**

```typescript
interface UrgentItemsPageProps {
  initialItems: UrgentItem[];
  refreshInterval?: number; // default 5 minutes
}

interface UrgentItem {
  id: string;
  content: string;
  source: string;
  source_url: string;
  author: string;
  category: string;
  urgency_level: number;
  sentiment: string;
  timestamp: Date;
  status: "new" | "handled" | "escalated" | "assigned";
  assigned_to?: string;
  handled_by?: string;
  handled_at?: Date;
  escalated_at?: Date;
  ai_analysis: {
    urgency_factors: string[];
    keywords: string[];
    confidence: number;
  };
  metadata?: {
    like_count?: number;
    retweet_count?: number;
    reply_count?: number;
  };
}
```

### 2. Filter System

**Advanced filtering capabilities:**

```typescript
interface FilterState {
  categories: string[];
  sources: string[];
  timeRange: "hour" | "6hours" | "24hours" | "all";
  urgencyMin: number;
  searchQuery: string;
  status: string[];
}

interface FilterPanelProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  itemCounts: Record<string, number>;
}
```

### 3. Action System

**Action handling for urgent items:**

```typescript
interface ActionHandlers {
  onMarkHandled: (itemId: string, notes?: string) => Promise<void>;
  onEscalate: (itemId: string, reason: string) => Promise<void>;
  onAssign: (
    itemId: string,
    assignee: string,
    department: string
  ) => Promise<void>;
  onViewDetails: (itemId: string) => void;
}

interface ActionLog {
  id: string;
  item_id: string;
  action: "handled" | "escalated" | "assigned";
  user_id: string;
  timestamp: Date;
  notes?: string;
  previous_status: string;
  new_status: string;
}
```

## Data Models

### Database Schema Extensions

**Add action tracking table:**

```sql
CREATE TABLE urgent_item_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID REFERENCES data_entries(id),
  action_type VARCHAR(20) NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  assigned_to VARCHAR(255),
  department VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX idx_urgent_actions_item_id ON urgent_item_actions(item_id);
CREATE INDEX idx_urgent_actions_created_at ON urgent_item_actions(created_at);
```

**Update data_entries table:**

```sql
ALTER TABLE data_entries
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'baru',
ADD COLUMN IF NOT EXISTS assigned_to VARCHAR(255),
ADD COLUMN IF NOT EXISTS handled_by VARCHAR(255),
ADD COLUMN IF NOT EXISTS handled_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS escalated_at TIMESTAMP;

-- Add index for urgent items query
CREATE INDEX idx_data_entries_urgency_status ON data_entries(urgency_level, status, created_at);
```

### API Endpoints

**New API routes needed:**

```typescript
// GET /api/urgent-items - Get urgent items with filters
interface UrgentItemsQuery {
  categories?: string[];
  sources?: string[];
  timeRange?: string;
  urgencyMin?: number;
  status?: string[];
  limit?: number;
  offset?: number;
}

// POST /api/urgent-items/:id/handle - Mark item as handled
interface HandleItemRequest {
  notes?: string;
  user_id: string;
}

// POST /api/urgent-items/:id/escalate - Escalate item
interface EscalateItemRequest {
  reason: string;
  user_id: string;
  new_urgency_level?: number;
}

// POST /api/urgent-items/:id/assign - Assign item
interface AssignItemRequest {
  assigned_to: string;
  department: string;
  user_id: string;
  notes?: string;
}

// GET /api/urgent-items/stats - Get urgent items statistics
interface UrgentItemsStats {
  total_urgent: number;
  by_category: Record<string, number>;
  by_source: Record<string, number>;
  avg_response_time: number;
  handled_today: number;
  escalated_today: number;
  trends: {
    hourly: number[];
    daily: number[];
  };
}
```

## Error Handling

### Error Scenarios and Responses

1. **No Urgent Items Available**

   - Display friendly empty state
   - Show last update time
   - Provide refresh button

2. **Action Failures**

   - Show toast notifications for errors
   - Retry mechanism for network failures
   - Rollback UI state on failure

3. **Real-time Update Failures**

   - Graceful degradation to manual refresh
   - Connection status indicator
   - Offline mode support

4. **Permission Errors**
   - Role-based action availability
   - Clear error messages for unauthorized actions
   - Redirect to login if session expired

## Testing Strategy

### Unit Tests

- Filter logic and state management
- Action handlers and API calls
- Data transformation and sorting
- Component rendering with different states

### Integration Tests

- End-to-end urgent item workflow
- Real-time updates and WebSocket connections
- Database operations and transactions
- API endpoint functionality

### User Experience Tests

- Response time under load
- Mobile responsiveness
- Accessibility compliance
- Color contrast for urgency indicators

### Performance Tests

- Large dataset rendering (1000+ urgent items)
- Real-time update performance
- Memory usage monitoring
- API response time optimization

## Implementation Considerations

### Real-time Updates

- WebSocket connection for live updates
- Optimistic UI updates for actions
- Conflict resolution for concurrent actions
- Fallback to polling if WebSocket fails

### Visual Design Principles

- **High Contrast**: Red/orange for urgent, clear visual hierarchy
- **Scannable Layout**: Easy to scan multiple items quickly
- **Action-Oriented**: Prominent action buttons
- **Status Indicators**: Clear visual status representation

### Performance Optimization

- Virtual scrolling for large lists
- Debounced search and filtering
- Cached filter results
- Lazy loading of item details

### Mobile Considerations

- Touch-friendly action buttons
- Swipe gestures for quick actions
- Responsive layout for small screens
- Offline capability for critical functions

### Security Considerations

- Role-based access control
- Action logging and audit trail
- Rate limiting for actions
- Input validation and sanitization

This design ensures that urgent items are immediately visible, actionable, and trackable while providing the necessary tools for effective emergency response and public service management.

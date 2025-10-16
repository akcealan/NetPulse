# System Patterns

## Architecture Overview

- Frontend-only web application
- Local storage for data persistence
- Component-based structure

## Key Components

1. Navigation System

   - Shared navbar across pages
   - Consistent UI elements

2. Data Management

   - LocalStorage for data persistence
   - JSON data structure

3. Timer System

   - Independent timer state
   - Data transfer mechanism

4. Form Handling
   - Dynamic course/topic selection
   - Validation system

## Data Flow

1. User Input Flow

   - Course creation → Topic addition → Session recording
   - Timer → Data entry integration
   - Real-time UI updates on data changes

2. Storage Pattern
   - Centralized Storage module (storage.js)
   - JSON-based LocalStorage persistence
   - Automatic data validation
   - CRUD operations for all entities
   - Cascading deletes (course → topics → sessions)

3. Module Communication
   - Storage module as single source of truth
   - Event-driven UI updates
   - Page-specific controllers (dataentry.js, dashboard.js, timer.js, stats.js, settings.js)
   - Cross-page data transfer via LocalStorage
   - State persistence and restoration
   - Modal management (global functions)
   - Local timezone handling for dates

## Interface Patterns

- Consistent navigation across all pages
- Form-based data entry with validation
- **Modern modal system** (replaced browser prompts)
  - Course/topic addition modals
  - Delete confirmation modals
  - ESC key and click-outside closing
  - Enter key form submission
- Real-time updates without page refresh
- Animated statistics (requestAnimationFrame)
- Progress bars with smooth transitions
- Card-based dashboard layout
- Responsive grid system
- Notification toasts for user feedback

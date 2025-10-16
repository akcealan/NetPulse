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
   - Page-specific controllers (dataentry.js)

## Interface Patterns

- Consistent navigation
- Form-based data entry
- Modal/popup for new entries
- Real-time updates

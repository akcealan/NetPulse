# Technical Context

## Technologies

- HTML5
- CSS3
- JavaScript (Vanilla)
- LocalStorage API

## Development Setup

- Web browser
- Text editor/IDE
- No build tools required
- No external dependencies

## Technical Requirements

- Modern browser with LocalStorage support
- JavaScript enabled
- No backend required

## Data Structure

```javascript
// Courses
{
  id: string,
  name: string,
  topics: Topic[],
  createdAt: string (ISO)
}

// Topics
{
  id: string,
  courseId: string,
  name: string,
  createdAt: string (ISO)
}

// Study Sessions
{
  id: string,
  courseId: string,
  courseName: string,
  topicId: string,
  topicName: string,
  date: string,
  correct: number,
  incorrect: number,
  blank: number,
  net: number, // calculated: correct - (incorrect / 4)
  duration: number, // in minutes
  createdAt: string (ISO)
}
```

## JavaScript Modules

- **storage.js**: Centralized data management
  - CRUD operations for courses, topics, sessions
  - Data validation and error handling
  - Helper functions (ID generation, formatting)
  
- **dataentry.js**: Data entry page controller
  - Form handling and validation
  - Dynamic UI updates
  - Event management
  - Modal-based course/topic addition
  - Enter key form submission
  - Real-time course/topic list updates
  
- **dashboard.js**: Dashboard/Index page controller
  - Statistics calculation and display
  - Animated number counters
  - Progress visualization
  - Recent sessions display
  - Course distribution charts

- **timer.js**: Timer/Stopwatch controller
  - Stopwatch functionality (start/pause/reset)
  - Time tracking with setInterval
  - LocalStorage state persistence
  - Auto-resume on page reload
  - Elapsed time calculation
  - Data entry integration
  - Keyboard shortcuts

- **settings.js**: Settings page controller
  - Data statistics calculation
  - JSON export (Blob + download)
  - JSON import (FileReader API)
  - File validation
  - Modal-based delete confirmation (replaced confirm dialogs)
  - Page refresh after operations
  - ESC key modal closing

- **stats.js**: Enhanced statistics page controller
  - Time-based filtering (Today/Week/Month/All)
  - **Local timezone handling** (fixed UTC issues)
  - Week filtering (Monday-based, not last 7 days)
  - Month filtering (1st day-based, not last 30 days)
  - General statistics calculations
  - Course-based performance analysis
  - Topic-based analysis (top 5 best/worst)
  - **Dynamic trend analysis**:
    - Daily charts for Today/Week/Month
    - Monthly charts for All Time (ergonomic for 1-year data)
  - Detailed metrics (streak, avg time per question)
  - Success rate and net calculations
  - Weekly improvement tracking
  - Study streak calculation algorithm
  - Empty state handling
  - Filter-specific empty states
  
- **theme.js**: Dark/light mode toggle

## Storage Keys

- 'netpulse_courses'
- 'netpulse_sessions'
- 'netpulse_timer_state'

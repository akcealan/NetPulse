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
  
- **dashboard.js**: Dashboard/Index page controller
  - Statistics calculation and display
  - Animated number counters
  - Progress visualization
  - Recent sessions display
  - Course distribution charts
  
- **theme.js**: Dark/light mode toggle

## Storage Keys

- 'netpulse_courses'
- 'netpulse_sessions'
- 'netpulse_timer_state'

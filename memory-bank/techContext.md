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
  topics: Topic[]
}

// Topics
{
  id: string,
  courseId: string,
  name: string
}

// Study Sessions
{
  id: string,
  courseId: string,
  topicId: string,
  date: string,
  duration: number,
  performance: 'correct' | 'incorrect' | 'blank'
}
```

## Storage Keys

- 'netpulse_courses'
- 'netpulse_sessions'
- 'netpulse_timer_state'

# CueSesh Project Context

## Overview
CueSesh is an adaptive media curation platform that intelligently surfaces podcast and audio content based on user context, available time, and preferences. Built with React and Redux.

## Architecture
- **Frontend**: React 19, Redux Toolkit, TailwindCSS
- **State Management**: Redux with specialized slices (user, playback, content, categories)
- **Audio System**: Custom audio proxy with intelligent routing
- **APIs**: Apple Podcasts (discovery), Listen Notes (enrichment), RSS (fallback)
- **Caching**: Multi-layer (client & server) with TTL management

## Key Features
- On-select content enrichment for performance
- Adaptive playback speeds (0.75x - 2.0x)
- Creator diversity algorithm to prevent repetitive listening
- Episode-first architecture
- Anonymous session tracking
- PWA-ready with service workers

## Current Working Directory
{{PROJECT_PATH}}

## Tech Stack
- React 19.1.1
- Redux Toolkit 2.8.2
- React Router (for navigation)
- Axios for API calls
- TailwindCSS for styling
- Express.js for proxy server

## API Keys Required
- Listen Notes API key (for audio enrichment)
- Optional: Spotify credentials

## Development Commands
```bash
npm start          # Start dev server
npm run build      # Production build
npm run proxy      # Start audio proxy server
```

## Recent Redux Migration
Successfully migrated from Context API to Redux:
- User preferences and settings
- Playback state and controls
- Content management pipeline
- Category system with dynamic updates

## Performance Optimizations
- Lazy loading for all screens
- Virtual scrolling for large lists
- Debounced search and API calls
- Optimistic UI updates
- Service worker caching

## Current Focus Areas
- Extended session management
- Content recommendation engine
- Analytics integration
- Performance monitoring
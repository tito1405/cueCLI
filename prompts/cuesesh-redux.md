# CueSesh Redux Architecture Context

## Redux Store Structure
The application uses Redux Toolkit with the following slices:

### User Slice (`userSlice.js`)
- User preferences (topics, speed, volume)
- Setup completion status
- Session tracking
- Feature flags
- Anonymous session ID

### Playback Slice (`playbackSlice.js`)
- Current episode and show details
- Playback state (playing, paused, position)
- Audio URL and metadata
- Queue management
- Playback history

### Content Slice (`contentSlice.js`)
- Dashboard episodes cache
- Discover content cache
- Search results
- Content enrichment data
- Loading states

### Categories Slice (`categoriesSlice.js`)
- Dynamic category management
- Topic hierarchies
- Category metadata
- Filter states

## Key Redux Patterns

### Thunks for Async Operations
- `enrichEpisode` - Fetches detailed episode data
- `loadDashboardContent` - Loads initial content
- `searchContent` - Handles search operations

### Selectors
- Memoized selectors for performance
- Computed values (time saved, session stats)
- Filtered content lists

### Middleware
- Redux Logger (dev only)
- Custom analytics middleware
- Error tracking middleware

## State Persistence
- LocalStorage for user preferences
- SessionStorage for temporary data
- IndexedDB for large content caches

## Migration from Context API
Recently migrated from React Context to Redux for:
- Better performance with large state
- Time-travel debugging
- Cleaner component code
- Centralized state management

## Common Redux Operations

### Update user preferences
```javascript
dispatch(setSelectedTopics(['Technology', 'Science']))
dispatch(setSelectedSpeed(1.5))
```

### Control playback
```javascript
dispatch(play())
dispatch(pause())
dispatch(seek(timestamp))
```

### Load content
```javascript
dispatch(loadDashboardContent())
dispatch(enrichEpisode(episodeId))
```

## Performance Considerations
- Uses Redux Toolkit's Immer for immutability
- Normalized state shape for entities
- Careful selector memoization
- Batch updates when possible
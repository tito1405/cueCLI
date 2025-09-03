# CueSesh Audio System Context

## Audio Architecture

### Audio Proxy System
Located in `/api/audio-proxy`, handles:
- Secure audio streaming
- CORS bypass for external audio URLs
- Byte-range requests for seeking
- Caching headers for performance

### Playback Engine
Custom React-based audio player with:
- HTML5 Audio API integration
- Playback speed control (0.75x - 2.0x)
- Precise seek functionality
- Buffer management
- Error recovery

## Audio Data Flow

1. **Episode Selection**
   - User selects episode
   - System checks for cached audio URL
   
2. **Enrichment**
   - Calls Listen Notes API for audio URL
   - Falls back to RSS feed if needed
   - Caches enriched data

3. **Playback**
   - Audio URL proxied through `/api/audio-proxy`
   - Stream delivered to client
   - Progress tracked in Redux

## Key Audio Components

### PlayerScreen (`src/screens/PlayerScreen.js`)
- Full playback controls
- Progress bar with seeking
- Speed adjustment dial
- Volume control
- Chapter navigation

### AudioContext Hook
- Manages HTML5 audio element
- Handles play/pause/seek
- Reports playback progress
- Error handling and recovery

## Audio URL Management

### Priority Order:
1. Listen Notes `audio` field
2. RSS enclosure URL
3. Apple Podcasts preview URL (30s only)

### URL Processing:
- Validate audio URLs
- Handle redirects
- Support various audio formats (mp3, m4a, ogg)
- Proxy through server for CORS

## Playback State Management

Redux `playbackSlice` tracks:
```javascript
{
  isPlaying: boolean,
  currentTime: number,
  duration: number,
  buffered: array,
  playbackRate: number,
  volume: number,
  currentEpisode: object,
  audioUrl: string
}
```

## Error Handling

### Common Issues:
- Network interruptions → Auto-retry with backoff
- Invalid audio URLs → Fallback to RSS
- CORS errors → Use proxy server
- Format unsupported → Transcode notification

### Recovery Strategies:
- Automatic reconnection
- Position preservation
- Quality degradation
- User notification

## Performance Optimizations

- Preload metadata only
- Progressive buffering
- Cache audio URLs (7 days)
- Compress metadata
- CDN integration ready

## Analytics Events

Tracked audio events:
- Play/pause actions
- Seek operations
- Speed changes
- Completion rates
- Error occurrences
- Buffer performance
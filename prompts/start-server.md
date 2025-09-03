# Start Server and Vercel Dev

## Startup Sequence

### Step 1: Pre-Launch Verification
```bash
# Check port availability
lsof -i :3001  # Should return nothing (port free)

# Verify environment variables
cat .env.local | grep -E "VITE_|REACT_APP_|NEXT_PUBLIC_"  # All required vars present

# Clean previous builds
rm -rf .next node_modules/.cache
```

### Step 2: Start Development Server
```bash
# Start Vercel dev environment
vercel dev --listen 3001

# Expected output:
# ✓ Ready! Available at http://localhost:3001
# ✓ Loaded env from .env.local
```

### Step 3: Local Health Checks

#### API Verification:
```bash
# Test health endpoint
curl http://localhost:3001/api/health
# ✅ Expected: {"ok": true, "timestamp": "..."}

# Test critical endpoints
curl http://localhost:3001/api/rss
# ✅ Expected: 200 status, no CORS errors

curl http://localhost:3001/api/audio-proxy/test
# ✅ Expected: Proxy configuration confirmed
```

#### Frontend Verification:
- Open http://localhost:3001
- Check console for errors (should be ZERO)
- Verify initial load time < 3 seconds
- Confirm no hydration errors

### Step 4: Critical User Flows

#### Dashboard Content:
- [ ] Content cards load within 2 seconds
- [ ] Images display correctly (no broken images)
- [ ] Infinite scroll works on scroll
- [ ] No duplicate content items
- [ ] Mock data fallback works if APIs fail

#### Navigation Flow:
- [ ] Topics → Dashboard transition smooth
- [ ] Dashboard → Player transition < 500ms
- [ ] Back navigation maintains state
- [ ] No white flashes between screens
- [ ] Bottom navigation highlights correct tab

#### Audio Player:
- [ ] Play button initiates playback
- [ ] Progress bar updates in real-time
- [ ] Volume controls responsive
- [ ] Speed controls maintain pitch
- [ ] No audio stuttering

### Step 5: Production Verification

#### Check Deployment:
```bash
# Verify production build
curl -I https://cuesesh.vercel.app
# ✅ Expected: 200 OK

# Test production health
curl https://cuesesh.vercel.app/api/health
# ✅ Expected: {"ok": true, "environment": "production"}
```

#### Production Smoke Tests:
Open https://cuesesh.vercel.app

Verify:
- [ ] Loads in < 3 seconds
- [ ] No console errors
- [ ] Content displays immediately
- [ ] Navigation responsive
- [ ] Audio playback functional

### Step 6: Performance Metrics

#### Local Metrics:
```bash
# Check bundle size
npm run analyze  # Main bundle < 500KB

# Memory usage
# In Chrome DevTools → Performance Monitor
# ✅ Expected: Heap size < 50MB after interaction
```

#### Production Metrics:
- [ ] Lighthouse score > 90
- [ ] FCP < 1.5s
- [ ] TTI < 3.5s
- [ ] No memory leaks after 5 min usage

## Troubleshooting

### Common Issues & Fixes:

#### Port 3001 Already in Use:
```bash
kill -9 $(lsof -t -i:3001)  # Force kill process
vercel dev --listen 3002    # Use alternate port
```

#### Environment Variables Missing:
```bash
cp .env.example .env.local
# Add required keys:
# VITE_AUDIO_PROXY_URL=
# VITE_RSS_PROXY_URL=
```

#### Content Not Loading:
- Check API rate limits
- Verify CORS proxy configuration
- Confirm mock data fallback enabled
- Check network tab for 429 errors

#### Build Failures:
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

## Success Criteria

### All Systems Green When:
✅ Local server starts without errors
✅ API health check returns ok: true
✅ Dashboard loads with content in < 2s
✅ Navigation between all screens smooth
✅ Audio playback initiates without errors
✅ Production deployment accessible
✅ No console errors in browser
✅ Memory usage stable
✅ All user flows completable

## Post-Startup Commands

```bash
# Watch logs
vercel dev --debug

# Monitor performance
npm run dev:analyze

# Test specific features
npm run test:e2e
```

## Emergency Rollback

If production issues detected:
```bash
vercel rollback
vercel promote [last-good-deployment-url]
```

## Remember
Never push to production without completing ALL verification steps.
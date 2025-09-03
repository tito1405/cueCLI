# CueSesh RTK Migration

## Task: Refactor CueSesh to Redux Toolkit (RTK) Architecture

### Migration Directive
Convert existing React Context/useState architecture to Redux Toolkit while maintaining **EXACT** UI/UX parity. Zero visual or functional changes allowed.

## Pre-Migration Audit

### Current State Analysis:
```javascript
// Document existing state management:
- [ ] Map all useState hooks → RTK slices
- [ ] Map all Context providers → RTK store
- [ ] Map all useContext calls → useSelector
- [ ] Map all setState calls → dispatch actions
- [ ] Map all useEffect dependencies → RTK listeners
```

## RTK Architecture Structure

### Store Configuration:
```javascript
// src/app/store.js
import { configureStore } from '@reduxjs/toolkit';

export const store = configureStore({
  reducer: {
    audio: audioSlice.reducer,
    user: userSlice.reducer,
    content: contentSlice.reducer,
    navigation: navigationSlice.reducer,
    session: sessionSlice.reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['audio/setContext'],
        ignoredPaths: ['audio.context']
      }
    })
});
```

### Slice Pattern (STRICT):
```javascript
// src/features/[domain]/[domain]Slice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async actions
export const fetchContent = createAsyncThunk(
  'content/fetch',
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.getContent(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Slice definition
const contentSlice = createSlice({
  name: 'content',
  initialState: {
    items: [],
    loading: false,
    error: null
  },
  reducers: {
    // Synchronous actions only
    addItem: (state, action) => {
      state.items.push(action.payload);
    },
    clearItems: (state) => {
      state.items = [];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchContent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchContent.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchContent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

// Selectors co-located with slice
export const selectAllContent = (state) => state.content.items;
export const selectContentLoading = (state) => state.content.loading;

export const { addItem, clearItems } = contentSlice.actions;
export default contentSlice;
```

## Migration Rules

### Component Conversion Pattern:

#### Before (Context/useState):
```javascript
const Component = () => {
  const [data, setData] = useState([]);
  const { user } = useContext(AppContext);
  
  useEffect(() => {
    fetchData().then(setData);
  }, []);
  
  return <div>{/* UI */}</div>;
};
```

#### After (RTK):
```javascript
const Component = () => {
  const dispatch = useDispatch();
  const data = useSelector(selectData);
  const user = useSelector(selectUser);
  
  useEffect(() => {
    dispatch(fetchData());
  }, [dispatch]);
  
  return <div>{/* EXACT SAME UI */}</div>;
};
```

### State Preservation Rules:
1. Local UI state (modals, dropdowns) → Keep as useState
2. Shared component state → Move to RTK slice
3. Server/API state → RTK with createAsyncThunk
4. Form state → Keep local unless shared
5. Navigation state → RTK slice

## Directory Structure

### Required Structure:
```
src/
├── app/
│   └── store.js              # Store configuration
├── features/                 # Domain-based slices
│   ├── audio/
│   │   ├── audioSlice.js
│   │   └── audioSelectors.js
│   ├── content/
│   │   ├── contentSlice.js
│   │   └── contentSelectors.js
│   └── user/
│       ├── userSlice.js
│       └── userSelectors.js
├── components/               # UI components (unchanged)
├── screens/                  # Screen components
├── hooks/                    # Custom hooks
├── utils/                    # Utilities (unchanged)
├── styles/                   # Tailwind styles (unchanged)
└── assets/                   # Static assets (unchanged)
```

## Refactoring Process

### Phase 1: Setup RTK Infrastructure
```bash
# Install dependencies
npm install @reduxjs/toolkit react-redux

# Create store structure
mkdir -p src/app src/features/{audio,content,user,navigation,session}
```

### Phase 2: Create Store & Provider
```javascript
// 1. Create store.js
// 2. Wrap App with <Provider store={store}>
// 3. Verify Redux DevTools connection
// 4. No UI changes should occur
```

### Phase 3: Migrate State (Per Feature)
For each Context/useState:
1. Create corresponding RTK slice
2. Define initial state matching current
3. Create actions for all state updates
4. Create selectors for all state reads
5. Test slice in isolation

### Phase 4: Component Migration
For each component:
1. Replace useContext → useSelector
2. Replace setState → dispatch
3. Maintain EXACT Tailwind classes
4. Preserve all event handlers
5. Keep component structure unchanged
6. Test component functionality

## Validation Checklist

### Before Committing Each File:

#### Code Quality:
- [ ] No useState for shared state
- [ ] All actions follow RTK patterns
- [ ] Selectors are memoized where needed
- [ ] No direct state mutations
- [ ] Async logic in createAsyncThunk

#### UI/UX Preservation:
- [ ] Zero visual changes
- [ ] All animations preserved
- [ ] Loading states identical
- [ ] Error states unchanged
- [ ] Responsive behavior intact

#### Performance:
- [ ] No additional re-renders
- [ ] Bundle size < 10KB increase
- [ ] No memory leaks
- [ ] DevTools shows clean state

#### Testing:
- [ ] All existing tests pass
- [ ] User flows unchanged
- [ ] No console errors
- [ ] RTK DevTools functional

## Best Practices Applied

### RTK Patterns:
```javascript
// ✅ CORRECT
dispatch(audioSlice.actions.play());
const status = useSelector(selectAudioStatus);

// ❌ WRONG
dispatch({ type: 'PLAY_AUDIO' });
const status = useSelector(state => state.audio.status);
```

### Performance Optimizations:
```javascript
// Memoized selectors
export const selectExpensiveData = createSelector(
  [selectItems, selectFilter],
  (items, filter) => items.filter(item => item.type === filter)
);

// Normalized state
const contentSlice = createSlice({
  initialState: {
    byId: {},      // Normalized
    allIds: []     // Order preserved
  }
});
```

## Documentation Requirements

### File Header:
```javascript
/**
 * Audio Feature Slice
 * Manages audio playback state, controls, and metadata
 * 
 * State Shape:
 * - currentTrack: Currently playing track object
 * - playbackState: 'playing' | 'paused' | 'stopped'
 * - progress: Current playback position (0-100)
 * - volume: Volume level (0-100)
 * - speed: Playback speed (0.5-3.0)
 */
```

### Inline Comments:
```javascript
// Critical: Preserve audio context for iOS compatibility
// Migration: Moved from AppContext.audioState
// Performance: Debounced to prevent excessive updates
```

## Changelog Format

### Per-File Documentation:
```markdown
## Migration Changelog

### src/features/audio/audioSlice.js
**Created**: New RTK slice for audio management
**Replaces**: AppContext.audioState, useAudioHook
**Lines**: 1-245
**Rationale**: Centralized audio state management with better debugging

### src/screens/PlayerScreen.jsx  
**Modified**: Lines 45-67, 123-145
**Changes**:
  - Replaced useContext(AppContext) with useSelector
  - Changed setAudioState to dispatch(updateAudio())
**Rationale**: RTK migration while preserving exact UI behavior

### src/components/VolumeControl.jsx
**Modified**: Lines 12-34
**Changes**:
  - Connected to RTK store instead of Context
  - No visual or functional changes
**Testing**: Verified slider behavior identical
```

## Success Criteria

### Migration Complete When:
✅ All Context providers removed
✅ Redux DevTools shows complete state tree
✅ Zero visual regressions
✅ All user flows functional
✅ Performance metrics unchanged or improved
✅ No console warnings/errors
✅ Test coverage maintained
✅ Bundle size increase < 10KB
✅ Time-travel debugging works
✅ Tailwind classes 100% preserved

## Rollback Plan

### If Issues Arise:
```bash
# Immediate rollback
git stash
git checkout main

# Partial rollback (per feature)
git checkout main -- src/features/[feature]
git checkout main -- src/screens/[affected-screens]
```

## Testing Commands

```bash
# After each slice migration
npm run test:unit -- [slice-name]

# After component updates  
npm run test:components -- [component-name]

# Full regression test
npm run test:e2e

# Visual regression
npm run test:visual
```

## Remember
This is a PURE architectural refactor. If anything looks or behaves differently, STOP and reassess. The user should never know this change happened.
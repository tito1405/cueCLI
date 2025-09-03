# Commit and Push to Git

## Task: Stage, Commit, and Push Changes

### Step 1: Pre-Commit Verification

#### Clean Working Directory:
```bash
# Check current status
git status

# Remove any unwanted files
git clean -n  # Dry run to see what would be removed

# Ensure no Anthropic/Claude mentions
grep -r "anthropic\|claude\|noreply" --exclude-dir=node_modules --exclude-dir=.git .
# If found, remove or replace with generic terms
```

### Step 2: Configure Git Author

```bash
# Set author for this commit
git config user.name "Alex Kisin"
git config user.email "Alex@cuesesh.com"

# Verify configuration
git config user.name  # Should show: Alex Kisin
git config user.email # Should show: Alex@cuesesh.com
```

### Step 3: Stage Changes

#### Selective Staging:
```bash
# Review all changes
git diff

# Stage specific files
git add src/          # Add all source changes
git add package.json  # Add dependency updates
git add README.md     # Add documentation

# Or stage everything except specific files
git add .
git reset -- .env.local  # Unstage sensitive files
```

### Step 4: Create Conventional Commit

#### Commit Format:
```
<type>(<scope>): <subject>

<body>

<footer>
```

#### Type Prefixes:
- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation only
- **style**: Formatting, no code change
- **refactor**: Code change that neither fixes nor adds feature
- **perf**: Performance improvement
- **test**: Adding tests
- **chore**: Maintenance, dependencies
- **build**: Build system changes
- **ci**: CI configuration

#### Commit Template:
```bash
git commit -m "feat(audio): implement advanced playback controls

## Changes
- Added volume slider with persistence
- Implemented playback speed controls (0.5x - 2x)
- Added keyboard shortcuts for player control
- Integrated with Redux for state management

## Fixes
- Fixed audio stuttering on speed change
- Resolved memory leak in audio context
- Corrected progress bar calculation

## Features
- Real-time waveform visualization
- Chapter navigation support
- Auto-resume on app restart
- Background playback capability

## Configuration Updates
- Updated Redux store structure for audio state
- Added environment variables for audio proxy
- Modified Tailwind config for player animations

## Known Issues
- iOS Safari requires user interaction for first play
- Bluetooth controls not yet implemented
- Seeking performance degraded on long episodes

Closes #123, #124
Breaking Change: Audio state structure modified"
```

### Step 5: Execute Commit

#### Single-Line Format (Simple Changes):
```bash
git commit -m "fix(dashboard): resolve content loading race condition"
```

#### Multi-Line Format (Complex Changes):
```bash
git commit -F- <<EOF
feat(api): integrate Listen Notes podcast API

## Changes
- Implemented ListenNotesService with search and enrichment
- Added quota management system with rate limiting
- Created fallback mechanism to RSS feeds
- Integrated with Decision Engine for smart routing

## Fixes
- Resolved CORS issues with audio proxy
- Fixed duplicate API calls in useEffect
- Corrected error handling in fetch operations

## Features  
- Full-text podcast search
- Episode enrichment with chapters and transcripts
- Related content recommendations
- Creator profile fetching

## Configuration Updates
- Added LISTEN_NOTES_API_KEY to .env
- Updated API route handlers in /api
- Modified content adapters for new data structure

## Known Issues
- API quota limited to 1000 requests/month
- Transcript availability varies by podcast
- Some older episodes lack enrichment data

Testing: All endpoints verified with Postman
Performance: <200ms average response time
EOF
```

### Step 6: Push to Remote

```bash
# Push to current branch
git push origin HEAD

# Or push to specific branch
git push origin main

# Force push if needed (use with caution)
git push origin HEAD --force-with-lease
```

### Step 7: Post-Commit Summary

#### Generate Summary:
```bash
# Show what was committed
echo "═══════════════════════════════════════"
echo "COMMIT SUMMARY"
echo "═══════════════════════════════════════"
echo ""
echo "Author: Alex Kisin <Alex@cuesesh.com>"
echo "Branch: $(git branch --show-current)"
echo "Commit: $(git rev-parse --short HEAD)"
echo ""
echo "Files Changed:"
git diff --stat HEAD~1 HEAD
echo ""
echo "Commit Message:"
git log -1 --pretty=format:"%s%n%n%b"
echo ""
echo "═══════════════════════════════════════"

# Verify push succeeded
git log origin/$(git branch --show-current)..HEAD --oneline
# Should show nothing if push succeeded
```

### Step 8: Validation Checklist

#### Before Committing:
- [ ] No console.log statements in production code
- [ ] No hardcoded API keys or secrets
- [ ] No references to anthropic/claude/noreply
- [ ] All tests passing
- [ ] Linting errors resolved
- [ ] Package-lock.json included if packages changed

#### Commit Message Validates:
- [ ] Type prefix is correct (feat/fix/docs/etc)
- [ ] Scope in parentheses when applicable
- [ ] Subject line < 50 characters
- [ ] Body explains what and why
- [ ] Bullet points for clarity
- [ ] Known issues documented
- [ ] Breaking changes noted

### Step 9: Error Recovery

#### If Commit Needs Editing:
```bash
# Amend last commit
git commit --amend

# Change just the message
git commit --amend -m "new message"

# Add forgotten files
git add forgotten-file.js
git commit --amend --no-edit
```

#### If Push Fails:
```bash
# Pull and rebase
git pull --rebase origin main
git push origin HEAD

# Or merge
git pull origin main
git push origin HEAD
```

## Example Output

```
Staged Files:
- src/features/audio/audioSlice.js
- src/components/Player/Player.jsx
- src/services/audioController.js

Commit Created:
feat(audio): implement advanced playback controls

Files: 3 changed, 247 insertions(+), 52 deletions(-)

Pushed to: origin/main
Commit SHA: abc1234

Deploy Preview: https://cuesesh-abc1234.vercel.app
```

## Quick Commands

#### For Hotfix:
```bash
git add . && git commit -m "fix: emergency patch for production issue" && git push
```

#### For Feature:
```bash
git add . && git commit -m "feat: $(git diff --staged --name-only | head -1 | xargs basename | cut -d. -f1) implementation" && git push
```

## Remember
Every commit tells a story. Make it clear, complete, and valuable for future developers (including yourself).
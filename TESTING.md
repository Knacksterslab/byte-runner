# Byte Runner - Testing Checklist

## Local Testing

### Desktop Browser Testing
- [ ] Navigate to http://localhost:3000
- [ ] Click "START GAME" button
- [ ] Game loads and shows player character
- [ ] Background scrolls smoothly
- [ ] Arrow keys work (left/right to move, up to jump)
- [ ] Player can switch between 3 lanes
- [ ] Player can jump
- [ ] Obstacles spawn and move toward player
- [ ] Data packets spawn and can be collected
- [ ] Score increases when collecting data packets
- [ ] Distance counter increases
- [ ] Collision with firewall triggers game over
- [ ] Game over screen shows final stats
- [ ] Restart button works
- [ ] Puzzle appears after ~1000m distance
- [ ] Can select email in puzzle
- [ ] Correct answer shows success message
- [ ] Game resumes after puzzle

### Mobile Browser Testing (Actual Device Required)
- [ ] Visit deployed URL on mobile device
- [ ] Game scales to fit mobile screen
- [ ] Swipe left/right changes lanes
- [ ] Tap anywhere to jump
- [ ] Touch controls are responsive
- [ ] Game runs at stable FPS (30-60)
- [ ] No lag or stuttering
- [ ] Twitter share button works
- [ ] Can share score on Twitter

## Performance Testing

### Frame Rate
- [ ] Game maintains 30+ FPS on desktop
- [ ] Game maintains 25+ FPS on mobile
- [ ] No frame drops during obstacle spawning
- [ ] Smooth scrolling background

### Memory
- [ ] No memory leaks after 5 minutes of gameplay
- [ ] Memory usage stabilizes (object pooling working)
- [ ] Game doesn't crash after multiple restarts

## Game Balance Testing

### Difficulty Progression
- [ ] Early game (0-500m): Only virus obstacles
- [ ] Mid game (500-1000m): Virus + data breach
- [ ] Late game (1000m+): All obstacle types
- [ ] Game feels challenging but fair

### Scoring
- [ ] Data packet = 10 points
- [ ] Correct puzzle answer = 100 points bonus
- [ ] Data breach damage = -50 points
- [ ] High score persists across sessions

## Browser Compatibility

### Desktop
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Edge (latest)
- [ ] Safari (if available)

### Mobile
- [ ] iOS Safari (iPhone)
- [ ] Android Chrome
- [ ] Samsung Internet (if available)

## Edge Cases

- [ ] Rapidly switching lanes doesn't break game
- [ ] Jumping while changing lanes works
- [ ] Multiple collisions in quick succession handled
- [ ] Puzzle timer reaches 0 correctly
- [ ] Game over during puzzle is handled
- [ ] Restart during puzzle works
- [ ] Browser refresh clears game state
- [ ] High score persists after page reload

## Visual/UI Testing

- [ ] All sprites load correctly
- [ ] Text is readable on all screens
- [ ] Colors follow neon cyber theme
- [ ] Buttons are clearly visible
- [ ] Game over overlay is readable
- [ ] Stats HUD doesn't overlap game
- [ ] Tutorial hint appears and disappears
- [ ] Animations are smooth

## Educational Content

- [ ] Phishing puzzle has clear instructions
- [ ] Email content is realistic
- [ ] Red flags are educational
- [ ] Learning tips are helpful
- [ ] Feedback is clear (correct/incorrect)

## Known Issues

Document any issues found:
- Issue: [Description]
- Reproduction: [Steps]
- Expected: [What should happen]
- Actual: [What actually happens]
- Workaround: [Temporary fix if any]

## Pre-Launch Checklist

Before deploying to production:
- [ ] All critical bugs fixed
- [ ] Game tested on at least 3 devices
- [ ] README.md is complete
- [ ] DEPLOYMENT.md has correct instructions
- [ ] package.json has correct metadata
- [ ] Git repository is clean
- [ ] Build passes without errors
- [ ] All assets are optimized
- [ ] Social media text is finalized
- [ ] Analytics tracking (if needed)

## Post-Launch Monitoring

After deployment:
- [ ] Monitor Vercel analytics for errors
- [ ] Check browser console for warnings
- [ ] Collect user feedback
- [ ] Track completion rates
- [ ] Monitor mobile vs desktop usage
- [ ] Track average session duration
- [ ] Note common failure points

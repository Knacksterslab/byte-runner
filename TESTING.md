# Byte Runner - Testing Checklist

## Local Testing

### Desktop Browser Testing
- [ ] Navigate to http://localhost:3000
- [ ] Loading screen appears with progress bar
- [ ] Click "START GAME" button
- [ ] Game canvas loads and shows player
- [ ] Background displays galactic gradient with twinkling stars
- [ ] WASD keys move player smoothly
- [ ] Arrow keys work as alternative
- [ ] Player stays within canvas bounds
- [ ] Obstacles spawn and move toward player
- [ ] Protection kits spawn and can be collected
- [ ] HUD shows level and score (top-left panel)
- [ ] Threat panel shows current attacker (top-right)
- [ ] Desktop HUD is collapsible (click to expand/collapse)
- [ ] Collision with obstacle (no kit) triggers game over
- [ ] Collecting kit adds to inventory
- [ ] Using kit when hit prevents game over
- [ ] Score increases correctly
- [ ] Level progression works

### Slow-Motion Quiz Testing
- [ ] Quiz triggers after reaching level milestone
- [ ] 3-2-1 countdown displays
- [ ] Game enters slow motion (0.15x speed)
- [ ] Quiz items spawn with spacing (150px apart)
- [ ] Correct items are green
- [ ] Incorrect items are red
- [ ] Collecting items updates quiz score panel (bottom-right)
- [ ] Quiz completes when all items collected
- [ ] Pass/fail determined correctly (must collect only greens)
- [ ] Game resumes normal speed after quiz
- [ ] Speed bonus applied on quiz pass

### Mobile Browser Testing (Actual Device)
- [ ] Visit deployed URL on mobile device
- [ ] Game scales to fit mobile screen
- [ ] Touch and drag controls player
- [ ] Mobile HUD shows L: and S: at top
- [ ] Touch controls are responsive
- [ ] Game runs at stable FPS (30-60)
- [ ] No lag or stuttering
- [ ] Mobile HUD expandable (tap to expand)
- [ ] Auto-collapses after 5 seconds

### Tutorial System
- [ ] Tutorial button (?) appears on start screen
- [ ] Tutorial overlay opens on click
- [ ] Content is readable and well-formatted
- [ ] Click outside to close works
- [ ] Close button (X) works
- [ ] Legal links (Privacy, Terms, FAQ) open correctly

### Game Over Flow
- [ ] Game over triggers when hit without kit
- [ ] ELIMINATED screen displays
- [ ] Shows attacker name and level
- [ ] Shows threat type used
- [ ] Displays final level and score
- [ ] Educational section shows protection kit info
- [ ] "Why You Died" section expandable
- [ ] Deep dive button works
- [ ] Restart button works
- [ ] Quiz retry option works (if available)

## Performance Testing

### Frame Rate
- [ ] Game maintains 60 FPS on desktop
- [ ] Game maintains 30+ FPS on mobile
- [ ] No frame drops during object spawning
- [ ] Slow-motion transitions smoothly
- [ ] No stuttering during HUD updates

### Memory
- [ ] No memory leaks after 10 minutes of gameplay
- [ ] Memory usage stabilizes (object pooling working)
- [ ] Game doesn't crash after multiple restarts
- [ ] DevTools memory profiler shows flat line
- [ ] No growing arrays or dangling references

### Browser DevTools Checks
```
1. Open DevTools (F12)
2. Go to Performance tab
3. Start recording
4. Play game for 2 minutes
5. Stop recording
6. Check:
   - FPS stays at 60
   - No long tasks (>50ms)
   - No memory growth
```

## Game Balance Testing

### Kit System
- [ ] Kits spawn at reasonable frequency
- [ ] Kit capacity limit works (max 3)
- [ ] Correct kit consumed on threat hit
- [ ] Backup kit gives extra life
- [ ] Kit inventory displays correctly

### Difficulty Progression
- [ ] Level 1: Easy spawn rate
- [ ] Level 3+: Increased spawn rate
- [ ] Level 5+: Multiple threat types
- [ ] Zone transitions feel natural
- [ ] Game remains challenging but fair

### Quiz System
- [ ] Quizzes appear at appropriate levels
- [ ] Time limit is fair (20-30 seconds)
- [ ] Quiz items are well-spaced (150px)
- [ ] Slow motion makes it easy to read
- [ ] Pass condition is clear (collect all greens)
- [ ] Fail condition triggers correctly
- [ ] Educational content is helpful

## Browser Compatibility

### Desktop
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Edge (latest)
- [ ] Safari (latest)

### Mobile
- [ ] iOS Safari (iPhone)
- [ ] Android Chrome
- [ ] Samsung Internet

## Edge Cases

- [ ] Rapidly moving doesn't break collision detection
- [ ] Multiple kits collected in quick succession
- [ ] Multiple threat hits in quick succession
- [ ] Quiz timer reaches 0 correctly
- [ ] Browser refresh clears game state
- [ ] Resizing window during gameplay
- [ ] Alt-tabbing during gameplay
- [ ] Losing focus during quiz

## Accessibility

- [ ] Keyboard controls work without mouse
- [ ] Touch targets are large enough (mobile)
- [ ] Text is readable with high contrast
- [ ] Color-blind friendly (use icons, not just colors)
- [ ] Screen reader labels on buttons

## Analytics Testing

If analytics enabled:
- [ ] Game start tracked
- [ ] Game over tracked
- [ ] Level up tracked
- [ ] Kit collected tracked
- [ ] Quiz attempt tracked
- [ ] Quiz pass/fail tracked
- [ ] Tutorial viewed tracked
- [ ] Deep dive viewed tracked

## Known Issues

Document any issues found:
- **Issue**: [Description]
- **Reproduction**: [Steps]
- **Expected**: [What should happen]
- **Actual**: [What actually happens]
- **Priority**: High/Medium/Low

## Pre-Launch Checklist

- [ ] All critical bugs fixed
- [ ] Game tested on 3+ devices
- [ ] README.md complete
- [ ] Environment variables configured
- [ ] Build passes without errors
- [ ] All assets optimized
- [ ] Favicons generated
- [ ] Meta tags set (SEO)
- [ ] Social share preview working
- [ ] Legal pages complete (Privacy, Terms, FAQ)

## Post-Launch Monitoring

- [ ] Check Vercel deployment logs
- [ ] Monitor error rates
- [ ] Track user completion rates
- [ ] Gather user feedback
- [ ] Monitor mobile vs desktop usage
- [ ] Track average session duration
- [ ] Identify common failure points
- [ ] Review analytics weekly

## Testing Commands

```bash
# Run dev server
npm run dev

# Build for production
npm run build

# Type check
npx tsc --noEmit

# Lint
npm run lint

# Test production build locally
npm run build && npm start
```

## Success Criteria

✅ Game loads in < 3 seconds
✅ Maintains 60 FPS on desktop
✅ Maintains 30+ FPS on mobile
✅ No TypeScript errors
✅ No linter warnings
✅ No memory leaks
✅ Works on iOS and Android
✅ Educational content is clear
✅ Gameplay is fun and engaging

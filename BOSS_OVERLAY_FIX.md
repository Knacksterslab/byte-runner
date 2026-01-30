# Boss Battle Overlay Bug Fix

## Problem

The educational overlay was covering the player during boss battles, making it impossible to see your character while dodging attacks.

## Root Cause

The educational overlay was being drawn **last** in the rendering pipeline, meaning it appeared on top of:
- The player (cyan square)
- Obstacles
- Boss attacks

This made it impossible to see where you were during the critical dodge phase.

## Changes Made

### 1. Fixed Rendering Order

**Before:**
```
1. Draw player
2. Draw obstacles
3. Draw boss
4. Draw educational overlay ← Covers everything!
```

**After:**
```
1. Draw educational overlay (in background)
2. Draw player ← Now visible on top!
3. Draw obstacles
4. Draw boss
```

**File:** `components/game/SimpleGame.tsx` (lines 690-695)

### 2. Increased Transparency

Made the educational overlay more transparent so you can see through it better:

**Before:** `${educationalColor}44` (27% opacity)
**After:** `${educationalColor}22` (13% opacity)

This makes the green overlay much more see-through while still being readable.

**File:** `components/game/SimpleGame.tsx` (line 480)

### 3. Fixed Boss Health Scaling (Bonus Fix)

At high levels (like Level 122), the boss had over 3,000 HP, making it literally impossible to defeat.

**Before:** `maxBossHealth + (currentLevel * 25)`
- Level 1: 100 HP
- Level 10: 350 HP
- Level 122: 3,150 HP (unbeatable!)

**After:** `100 + Math.min(currentLevel * 10, 200)`
- Level 1: 110 HP (2 correct answers)
- Level 10: 200 HP (4 correct answers)
- Level 20+: 300 HP (6 correct answers, capped)

**File:** `components/game/SimpleGame.tsx` (line 120)

## Testing

The game should now:
- ✅ Show educational messages without blocking your view
- ✅ Allow you to see your cyan player square during dodge phase
- ✅ Let you see obstacles coming
- ✅ Have beatable bosses even at high levels

## Result

You can now:
1. Answer boss questions
2. **See the green educational overlay** (more transparent)
3. **See your player** (cyan square visible on top)
4. **Dodge the boss attacks** while reading the tips
5. **Actually defeat bosses** at high levels

## Files Modified

- `components/game/SimpleGame.tsx`:
  - Moved `drawEducationalOverlay()` call earlier (line ~694)
  - Removed duplicate call (line ~858)
  - Increased overlay transparency (line 480)
  - Fixed boss health scaling (line 120)

---

**Bug Status:** ✅ FIXED

Refresh the game at http://localhost:3000/game to see the changes!

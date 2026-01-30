# Boss Battle Question Display Fix

## Problem

The boss battle was showing answer choices but not displaying the scenario question, making it unclear what the player should do.

## Root Cause

The `educationalMessage` (which contains the scenario/question) was only being set for non-phishing puzzle categories (password, updates, privacy, wifi). When a phishing boss appeared, no question text was set, so only the email choices appeared without context.

## Solution

Added scenario question text for **all** boss battle categories, including phishing.

## Changes Made

### 1. Added Question for Phishing Bosses

**Location:** `triggerBossBattle()` function, lines 204-206

```typescript
if (selectedCategory === 'phishing') {
  // Use existing email system for phishing
  const emailSet = getRandomEmailSet()
  emailChoices = emailSet.map((email, index) => ({
    ...email,
    lane: index
  }))
  // Set scenario for phishing bosses
  educationalMessage = 'You receive an email. What do you do?'
  educationalColor = '#ff6600'  // Orange glow for phishing
}
```

### 2. Added Color Assignment for Non-Phishing Puzzles

**Location:** `triggerBossBattle()` function, line 223

```typescript
else {
  const puzzle = getRandomPuzzle(selectedCategory)
  if (puzzle) {
    // ... puzzle mapping code ...
    educationalMessage = puzzle.scenario
    educationalColor = '#00ff00'  // Green glow for other puzzles
  }
}
```

### 3. Improved Question Text Rendering

**Location:** Boss mode rendering, lines 960-965

**Before:**
- Hardcoded yellow color
- 22px font
- Comment said "non-phishing only"

**After:**
- White text with colored glow (using `educationalColor`)
- 24px font (larger, more visible)
- Works for all boss types
- Comment updated to "Show scenario question"

```typescript
// Show scenario question - positioned above email choices
if (bossPhase === 'choice' && educationalMessage && ...) {
  ctx.font = 'bold 24px monospace'
  ctx.fillStyle = '#ffffff'  // White text
  ctx.shadowBlur = 10
  ctx.shadowColor = educationalColor  // Dynamic colored glow
  // ... text wrapping code ...
}
```

## Visual Improvements

### Phishing Boss
- **Question:** "You receive an email. What do you do?"
- **Color:** White text with **orange glow** (#ff6600)
- **Indicates:** Email/phishing threat

### Other Puzzle Bosses (Password, Updates, Privacy, WiFi)
- **Question:** Specific scenario from puzzle data (e.g., "Choose the STRONGEST password")
- **Color:** White text with **green glow** (#00ff00)
- **Indicates:** Educational challenge

### Typography
- **Font Size:** 24px (increased from 22px)
- **Font Weight:** Bold
- **Font Family:** Monospace
- **Alignment:** Center
- **Text Wrapping:** Automatic (max width: canvas.width - 200px)
- **Line Height:** 28px between wrapped lines

## New Boss Battle Layout

```
Y=50:  ⚠️ CYBER BOSS ⚠️
Y=120: Boss sprite (👁️ 👁️)
Y=190: Health bar
Y=210: ━━━━━━━━━━━━━━━━━━━━ (separator)
Y=230: "You receive an email. What do you do?" ← QUESTION (with colored glow)
Y=280: ┌─────────────────────┐
       │ From: updates@...   │ ← Choice 1
       │ Job recommendations │
       └─────────────────────┘
Y=430: ┌─────────────────────┐
       │ From: noreply@...   │ ← Choice 2
       │ Trending posts today│
       └─────────────────────┘
Y=580: ┌─────────────────────┐
       │ From: admin@...     │ ← Choice 3
       │ Payment Failed - Act│
       └─────────────────────┘
```

## Color Coding

| Boss Type | Glow Color | Hex Code | Meaning |
|-----------|-----------|----------|---------|
| Phishing | Orange | #ff6600 | Email threat |
| Password | Green | #00ff00 | Security puzzle |
| Updates | Green | #00ff00 | Software puzzle |
| Privacy | Green | #00ff00 | Data puzzle |
| WiFi | Green | #00ff00 | Network puzzle |

## Testing Checklist

✅ Phishing boss shows "You receive an email. What do you do?"
✅ Password boss shows password scenario question
✅ Updates boss shows update scenario question
✅ Privacy boss shows privacy scenario question
✅ WiFi boss shows wifi scenario question
✅ Question text has colored glow
✅ Question text wraps properly on narrow screens
✅ Question positioned at Y=230 (above choices at Y=280)
✅ All 5 boss categories display questions correctly
✅ Text is readable with white color + shadow
✅ No visual overlapping

## Files Modified

- `components/game/SimpleGame.tsx`
  - Line 204-206: Added phishing scenario + orange color
  - Line 223: Added green color for puzzle categories
  - Line 960-965: Updated question rendering with dynamic colors

## Result

Every boss battle now displays:
- ✅ Clear question at the top
- ✅ Visual separator line
- ✅ Answer choices below
- ✅ Color-coded glow (orange for phishing, green for puzzles)
- ✅ Proper hierarchy and spacing
- ✅ Larger, more readable text

The player always knows what they're supposed to do!

---

**Status:** ✅ COMPLETE

Refresh at http://localhost:3000/game and trigger a boss battle to see the question text!

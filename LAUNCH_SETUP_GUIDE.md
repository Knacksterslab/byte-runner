# Launch Setup Guide

## Completed Implementation

All launch-ready features have been implemented! Here's what was added:

### ✅ Legal Documents
- Privacy Policy page (`/privacy`)
- Terms of Service page (`/terms`)
- Footer with legal links on all pages

### ✅ Analytics & Monitoring
- Google Analytics 4 integration with event tracking
- Sentry error monitoring for production stability
- Comprehensive event tracking (game starts, deaths, quiz results, etc.)

### ✅ Social Features
- Open Graph tags for beautiful social sharing
- Twitter/X and LinkedIn share buttons on game over
- Copy link button with feedback

### ✅ User Experience
- Tutorial overlay (shows on first visit, dismissible after 5s)
- Help "?" button accessible anytime
- FAQ page with 15 common questions
- Feedback buttons on start screen and during gameplay

---

## 🔧 Setup Required (5-10 minutes)

### Step 1: Google Analytics 4 Setup

1. Go to [Google Analytics](https://analytics.google.com/)
2. Click "Start measuring" or "Add property"
3. Create a new GA4 property named "Byte Runner"
4. Get your Measurement ID (format: `G-XXXXXXXXXX`)
5. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```
6. Add your Measurement ID to `.env.local`:
   ```
   NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
   ```

**Events Being Tracked:**
- game_start, game_over, level_up
- kit_collected, quiz_attempt, quiz_pass, quiz_fail
- tutorial_viewed, tutorial_dismissed
- share (social media), education_expanded, deep_dive_viewed

### Step 2: Sentry Error Tracking Setup

1. Go to [Sentry.io](https://sentry.io/signup/)
2. Create free account (10k errors/month)
3. Create new project, select "Next.js"
4. Copy your DSN (format: `https://xxx@xxx.ingest.sentry.io/xxx`)
5. Add to `.env.local`:
   ```
   NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
   NEXT_PUBLIC_SENTRY_ENVIRONMENT=production
   ```

**Optional:** For source map uploads (helps debug):
6. In Sentry, generate an Auth Token
7. Add to `.env.local`:
   ```
   SENTRY_AUTH_TOKEN=your_token_here
   SENTRY_ORG=your_org
   SENTRY_PROJECT=byte-runner
   ```

### Step 3: Create OG Image (Social Sharing Thumbnail)

**What:** 1200x630px image that appears when people share your link on Twitter, LinkedIn, etc.

**How to Create:**

#### Option A: Canva (Easiest)
1. Go to [Canva.com](https://canva.com)
2. Create new design → Custom size → 1200 x 630 px
3. Design elements:
   - Dark cyber background (match game: black/dark blue gradient)
   - Your logo (`public/logo.png`) prominently displayed
   - Text: "Byte Runner - Learn Cybersecurity by Playing"
   - Optional: Small screenshot of gameplay
   - Cyber aesthetic: neon cyan/blue colors, tech/grid patterns
4. Download as PNG → save to `public/og-image.png`

#### Option B: Figma (More Control)
1. Create 1200x630px frame
2. Add dark gradient background (#000011 to #001a3d)
3. Place logo (centered or top)
4. Add headline text in cyber font
5. Export as PNG → save to `public/og-image.png`

#### Option C: Screenshot + Edit
1. Take a gameplay screenshot
2. Open in any image editor (Paint, Preview, GIMP, etc.)
3. Resize to 1200x630px
4. Add logo and text overlay
5. Save to `public/og-image.png`

**Design Tips:**
- Keep text large and readable (people see thumbnail at ~500px wide)
- Use high contrast (bright text on dark background)
- Feature your logo prominently
- Include game name clearly
- Avoid cluttering - simple is better

**Test Your OG Image:**
After creating, test at [OpenGraph.xyz](https://opengraph.xyz) or [Twitter Card Validator](https://cards-dev.twitter.com/validator)

### Step 4: Update Domain in Metadata

Once you have a final domain, update these files:

1. **`app/layout.tsx`** - Change `byte-runner.vercel.app` to your actual domain:
   ```typescript
   url: 'https://your-actual-domain.com'
   images: [{ url: 'https://your-actual-domain.com/og-image.png' }]
   ```

2. **Footer links** - Already using relative paths, no change needed

### Step 5: Test Everything

```bash
# Install dependencies (if not already done)
npm install

# Run development server
npm run dev
```

**Manual Testing Checklist:**
- [ ] Visit `http://localhost:3000` - Tutorial shows on first visit
- [ ] Click "?" button - Tutorial shows again
- [ ] Play game and die - Share buttons appear on game over
- [ ] Click Twitter share - Opens with pre-filled message
- [ ] Click LinkedIn share - Opens LinkedIn share dialog
- [ ] Click Copy link - Shows "Copied!" confirmation
- [ ] Visit `/privacy` - Privacy Policy loads
- [ ] Visit `/terms` - Terms of Service loads
- [ ] Visit `/faq` - FAQ page loads with all questions
- [ ] Check footer - Legal links and contact email visible
- [ ] Click Feedback button - Opens email client
- [ ] Open browser DevTools → Check for console errors

**Analytics Testing:**
- [ ] Open GA4 → Realtime → Check if events appear
- [ ] Trigger test error → Check Sentry dashboard

---

## 🚀 Deploy to Vercel

```bash
# If not already initialized
vercel

# For production deployment
vercel --prod
```

**Add Environment Variables in Vercel Dashboard:**
1. Go to Project Settings → Environment Variables
2. Add `NEXT_PUBLIC_GA_MEASUREMENT_ID`
3. Add `NEXT_PUBLIC_SENTRY_DSN`
4. Add `NEXT_PUBLIC_SENTRY_ENVIRONMENT=production`

---

## 📝 Pre-Launch Checklist

### Critical (Must Do)
- [ ] Add GA4 Measurement ID to `.env.local`
- [ ] Add Sentry DSN to `.env.local`
- [ ] Create OG image (`public/og-image.png`)
- [ ] Update domain in `app/layout.tsx` metadata
- [ ] Test all features locally
- [ ] Deploy to production
- [ ] Add environment variables in Vercel
- [ ] Test production site
- [ ] Verify OG tags at opengraph.xyz
- [ ] Test social sharing on Twitter/LinkedIn

### Nice to Have
- [ ] Set up custom domain (instead of vercel.app)
- [ ] Configure email forwarding for contact/feedback emails
- [ ] Enable Vercel Analytics (free tier)
- [ ] Set up Sentry source map uploads (optional, helps debugging)

---

## 🎯 Launch Day Actions

1. **Morning:** Share on X.com with demo GIF
2. **Afternoon:** Post to Reddit (r/webdev, r/cybersecurity, r/webgames)
3. **Evening:** Monitor analytics and respond to feedback
4. **Next Day:** Launch on Product Hunt at 12:01 AM PT

---

## 📊 Analytics Events Reference

You can view these in GA4 under Reports → Events:

| Event | When It Fires | Parameters |
|-------|--------------|------------|
| `game_start` | User clicks START GAME | - |
| `game_over` | Player dies | level, score, threat_type |
| `level_up` | New level reached | level |
| `kit_collected` | Kit picked up | kit_type, total_kits |
| `quiz_attempt` | Quiz opened | kit_type |
| `quiz_pass` | Quiz passed | kit_type |
| `quiz_fail` | Quiz failed | kit_type |
| `tutorial_viewed` | Tutorial displayed | - |
| `tutorial_dismissed` | Tutorial closed | time_spent_seconds |
| `share` | Social share clicked | method (twitter/linkedin), score |
| `education_expanded` | "Why you died" expanded | kit_type |
| `deep_dive_viewed` | "Learn More" clicked | kit_type |

---

## 🐛 Troubleshooting

### GA4 not tracking events?
- Check browser console for errors
- Verify `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set
- Check GA4 Realtime view (events may take 24-48hrs to show in reports)
- Make sure ad blockers are disabled during testing

### Sentry not receiving errors?
- Verify `NEXT_PUBLIC_SENTRY_DSN` is set correctly
- Check Sentry project settings
- Trigger a test error: `throw new Error('Test error')`
- Check browser network tab for Sentry requests

### OG image not showing?
- Clear social media cache (Twitter/LinkedIn take 15-30 min to update)
- Use absolute URLs (https://...) not relative paths
- Verify image is exactly 1200x630px
- Test at opengraph.xyz first

### Tutorial not showing?
- Clear localStorage: DevTools → Application → Local Storage → Delete `byte-runner-tutorial-seen`
- Refresh page

### Footer not appearing?
- Check that Footer component is imported in `app/layout.tsx`
- Verify pages have enough content to scroll (footer at bottom)

---

## 📈 Post-Launch Monitoring

**First 24 Hours - Check Every 2 Hours:**
- GA4 Realtime: Active users, events firing
- Sentry: Any critical errors
- Social media: Comments, feedback
- Email: Bug reports, questions

**First Week - Check Daily:**
- Total unique players
- Average session duration
- Most common death causes (which threats)
- Quiz pass rate
- Social shares count
- Top traffic sources

**Metrics to Watch:**
- Session duration > 5 min = engaging
- Tutorial completion > 80% = clear instructions  
- Quiz pass rate 40-60% = good difficulty
- Level 5+ reached rate > 20% = well-balanced
- Social shares > 5% = viral potential

---

## 🎉 You're Ready to Launch!

Everything is implemented. Just need to:
1. Add your GA4 and Sentry keys (10 minutes)
2. Create OG image (30 minutes)
3. Deploy to production (5 minutes)
4. Test everything (15 minutes)

**Total time to launch: ~1 hour**

Good luck with your launch! 🚀

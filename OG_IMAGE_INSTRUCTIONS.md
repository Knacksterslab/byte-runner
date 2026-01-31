# OG Image Creation Guide

## What is an OG Image?

The OG (Open Graph) image is the preview thumbnail that appears when someone shares your link on Twitter, LinkedIn, Facebook, Discord, Slack, etc. It's critical for social media marketing.

**Size Required:** 1200 x 630 pixels (exact)

---

## Method 1: Canva (Recommended - Easiest)

### Step-by-Step:

1. **Go to Canva.com** (free account works)

2. **Create Custom Design:**
   - Click "Create a design"
   - Select "Custom size"
   - Enter: Width = 1200, Height = 630
   - Click "Create new design"

3. **Design Your Image:**

   **Background:**
   - Search "cyber background" or "tech background"
   - Or create gradient: Dark blue (#000011) to lighter blue (#003366)
   - Add grid/circuit patterns if desired

   **Add Your Logo:**
   - Click "Uploads" → Upload `public/logo.png`
   - Drag logo to canvas
   - Resize to ~300-400px wide
   - Position in center or top-center

   **Add Text:**
   - Click "Text" → Add heading
   - Type: "BYTE RUNNER"
   - Font: Choose techy/futuristic font (Orbitron, Russo One, Audiowide)
   - Size: 80-100px
   - Color: Cyan (#00FFFF) or white
   - Add text shadow/glow effect

   - Add subheading:
   - Type: "Learn Cybersecurity by Playing"
   - Size: 40-50px
   - Color: Light cyan or white

   **Optional Enhancements:**
   - Add small icons: 🔐 🛡️ 🎮
   - Add "Free to Play" badge
   - Add subtle circuit board pattern overlay
   - Screenshot of gameplay in corner

4. **Download:**
   - Click "Share" → "Download"
   - Format: PNG
   - Quality: High
   - Save as: `og-image.png`

5. **Place File:**
   - Move downloaded file to `byte-runner/public/og-image.png`

---

## Method 2: Figma (More Design Control)

1. Create new file in Figma
2. Add frame: 1200 x 630 px
3. Design with cyber aesthetic:
   - Dark gradient background
   - Logo prominent
   - Clean typography
   - Neon accent colors
4. Export: File → Export → PNG → 2x quality
5. Resize to exact 1200x630 if needed
6. Save to `public/og-image.png`

---

## Method 3: Quick Screenshot Method

1. **Take Screenshot:**
   - Open your game at http://localhost:3000
   - Take full-screen screenshot of gameplay or start screen
   - Or screenshot with logo visible

2. **Edit in Any Tool:**
   - Windows: Paint, Paint 3D, or Photos app
   - Mac: Preview or Pixelmator
   - Online: Photopea.com (free Photoshop alternative)

3. **Edit:**
   - Resize to 1200x630px (Image → Resize)
   - Add text overlay: "BYTE RUNNER - Learn Cybersecurity by Playing"
   - Adjust brightness/contrast if needed
   - Add logo if not visible

4. **Save:**
   - Export as PNG
   - Save to `public/og-image.png`

---

## Design Best Practices

### DO:
✅ Keep it simple and uncluttered
✅ Use high contrast (bright text on dark background)
✅ Make text BIG (readable at thumbnail size)
✅ Feature your logo prominently
✅ Use your brand colors (cyan, blue, black)
✅ Show game name clearly
✅ Test at different sizes

### DON'T:
❌ Use tiny text (won't be readable)
❌ Overcrowd with too many elements
❌ Use low contrast colors
❌ Forget to include game name
❌ Make it too similar to competitors
❌ Use copyrighted images

---

## Example Layout Ideas

### Layout 1: Logo-Focused
```
+----------------------------------+
|                                  |
|        [LARGE LOGO]              |
|                                  |
|      BYTE RUNNER                 |
|  Learn Cybersecurity by Playing  |
|                                  |
|  🔐 8 Kits • 🦠 15 Threats       |
|                                  |
+----------------------------------+
```

### Layout 2: Screenshot-Based
```
+----------------------------------+
| BYTE RUNNER        [Logo]        |
|                                  |
| [Gameplay Screenshot]            |
|                                  |
| Learn Cybersecurity by Playing   |
| Free to Play • No Install        |
+----------------------------------+
```

### Layout 3: Split Design
```
+----------------------------------+
|  [Logo]      |                   |
|              |  BYTE RUNNER      |
|  BYTE        |                   |
|  RUNNER      |  Die to ransomware|
|              |  Learn about       |
|  [Character] |  backups          |
|              |                   |
|              |  Free to Play     |
+----------------------------------+
```

---

## Quick Canva Template Search Terms

Search in Canva for inspiration:
- "gaming banner"
- "cyber security poster"
- "tech announcement"
- "game thumbnail"
- "esports banner"

Then customize with your logo and colors!

---

## Color Palette (Your Brand)

Use these colors to match your game:

- **Primary:** #00FFFF (Cyan) - Main accent
- **Secondary:** #0066FF (Blue) - Buttons, gradients
- **Background:** #000011 (Almost Black)
- **Background 2:** #001a3d (Dark Blue)
- **Accent:** #00FF00 (Green) - Success states
- **Warning:** #FFD700 (Gold) - Important info

---

## Testing Your OG Image

### Before Going Live:

1. **Local Test:**
   - Place `og-image.png` in `public/` folder
   - Deploy to Vercel
   - Get your Vercel URL

2. **Validation Tools:**
   - **Twitter:** https://cards-dev.twitter.com/validator
   - **LinkedIn:** https://www.linkedin.com/post-inspector/
   - **Facebook:** https://developers.facebook.com/tools/debug/
   - **Universal:** https://opengraph.xyz or https://socialsharepreview.com

3. **Share Test:**
   - Share your link on Twitter/LinkedIn privately
   - Check if image appears correctly
   - Verify text isn't cut off

### Common Issues:

**Image doesn't appear:**
- Wait 15-30 minutes (social platforms cache)
- Check URL is absolute (https://...) not relative
- Verify image is exactly 1200x630px
- Check file size < 8MB

**Image looks blurry:**
- Ensure you exported at high quality
- Check dimensions are exactly 1200x630 (not scaled)
- Use PNG format (not JPG with low quality)

**Text is cut off:**
- Keep important content in "safe zone" (center 1200x600px)
- Avoid text near edges
- Test on multiple platforms

---

## Estimated Time

- Canva method: **20-30 minutes** (beginner)
- Figma method: **15-25 minutes** (if familiar with Figma)
- Screenshot method: **10-15 minutes** (fastest but lower quality)

---

## Final Checklist

- [ ] Image is exactly 1200 x 630 pixels
- [ ] File is named `og-image.png` (lowercase, no spaces)
- [ ] File is in `public/` folder
- [ ] Image file size is under 8MB (should be <500KB for PNG)
- [ ] Logo is visible and clear
- [ ] Game name "Byte Runner" is readable
- [ ] Tagline is included
- [ ] Colors match brand (cyan/blue theme)
- [ ] Tested on at least one social platform

---

**Pro Tip:** Don't spend more than 30 minutes perfecting this. A simple design with your logo and clear text is better than a complex design that delays your launch. You can always update it later! 🚀

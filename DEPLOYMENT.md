# Byte Runner - Deployment Guide

## Quick Deploy to Vercel

1. **Push to GitHub** (if you haven't already):
   ```bash
   # Create a new repository on GitHub
   # Then run:
   git remote add origin https://github.com/yourusername/byte-runner.git
   git branch -M main
   git push -u origin main
   ```

2. **Deploy to Vercel**:
   - Visit [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js and use the correct settings
   - Click "Deploy"
   - Your game will be live in ~2 minutes!

## Alternative: Deploy via Vercel CLI

```bash
# Install Vercel CLI globally
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

## Post-Deployment

1. **Test on Mobile**:
   - Visit your deployed URL on a mobile device
   - Test touch controls (swipe, tap)
   - Verify performance

2. **Share on Twitter**:
   - The game has built-in Twitter sharing
   - Test the share button after game over
   - Customize the share text in `components/game/GameUI.tsx`

3. **Custom Domain** (optional):
   - Go to your project settings on Vercel
   - Add your custom domain
   - Update DNS records as instructed

## Environment Variables

This MVP doesn't require any environment variables. For future features:

```
# Add in Vercel dashboard under Settings > Environment Variables
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## Performance Optimization

The game is already optimized for mobile:
- ✅ Lower resolution (540x960) for better FPS
- ✅ Object pooling for obstacles/collectibles
- ✅ Pixel art rendering
- ✅ Event-driven architecture
- ✅ Lazy-loaded puzzle scenes

## Monitoring

Monitor your game with Vercel Analytics:
1. Go to your project dashboard
2. Click "Analytics" tab
3. Track visitors, page views, and performance

## Troubleshooting

**Build fails:**
- Check Node.js version (requires 18+)
- Run `npm install` to ensure all dependencies are installed
- Clear `.next` folder and rebuild

**Game doesn't load:**
- Check browser console for errors
- Ensure WebGL is enabled in browser
- Try different browser (Chrome recommended)

**Touch controls not working:**
- Test on actual device, not browser dev tools
- Verify the page is not in an iframe
- Check if another element is blocking touch events

## Next Steps

After deployment:
1. Share on social media
2. Gather user feedback
3. Monitor analytics
4. Plan next features (see README.md)

## Support

For issues or questions:
- Create an issue on GitHub
- Check documentation in README.md
- Review Phaser documentation for game engine questions

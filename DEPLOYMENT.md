# Byte Runner - Deployment Guide

## Deploy to Vercel (Recommended)

### Option 1: GitHub Integration (Easiest)

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/byte-runner.git
   git branch -M main
   git push -u origin main
   ```

2. **Deploy via Vercel Dashboard**:
   - Visit [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel auto-detects Next.js configuration
   - Click "Deploy"
   - Live in ~2 minutes! 🚀

### Option 2: Vercel CLI

```bash
# Install Vercel CLI globally
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

## Environment Variables

### Required for Production

Create `.env.local` file (already in .gitignore):

```bash
# Copy from example
cp .env.local.example .env.local
```

Edit `.env.local`:
```
# Analytics (Optional)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Sentry (Optional)
SENTRY_AUTH_TOKEN=your_sentry_token

# Game Configuration (Optional)
NEXT_PUBLIC_GAME_VERSION=1.0.0
```

### Add to Vercel

In Vercel dashboard:
1. Go to Project Settings
2. Click "Environment Variables"
3. Add each variable
4. Redeploy

## Post-Deployment

### 1. Verify Deployment

```bash
# Check your deployed URL
curl -I https://your-app.vercel.app

# Should return 200 OK
```

### 2. Test on Devices

- [ ] Desktop: Chrome, Firefox, Edge, Safari
- [ ] Mobile: iOS Safari, Android Chrome
- [ ] Check game loads
- [ ] Verify controls work
- [ ] Test quiz system
- [ ] Verify analytics (if enabled)

### 3. Performance Check

In browser DevTools:
```
1. Open Performance tab
2. Record 30 seconds of gameplay
3. Check:
   - FPS stays at 60
   - No memory leaks
   - No long tasks
```

### 4. Configure Domain (Optional)

In Vercel dashboard:
1. Go to Settings > Domains
2. Add your custom domain
3. Update DNS records:
   ```
   Type: A
   Name: @
   Value: 76.76.21.21
   
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

## Optimization

### Already Optimized

- ✅ Image optimization (Next.js automatic)
- ✅ Code splitting (Next.js automatic)
- ✅ Tree shaking (webpack)
- ✅ Minification (production build)
- ✅ Canvas rendering (60 FPS)
- ✅ Object pooling (memory efficient)

### Additional Optimizations

1. **Analytics**:
   ```bash
   # Add Vercel Analytics
   npm i @vercel/analytics
   ```

2. **Error Monitoring**:
   ```bash
   # Sentry already configured
   # Just add SENTRY_AUTH_TOKEN to env vars
   ```

3. **PWA** (Optional):
   ```bash
   npm i next-pwa
   # Configure in next.config.js
   ```

## Monitoring

### Vercel Dashboard

Track:
- **Deployments** - Build status and logs
- **Analytics** - Visitors, page views
- **Performance** - Core Web Vitals
- **Errors** - Runtime errors and exceptions

### Google Analytics

If configured, track:
- Game starts
- Level progression
- Quiz completions
- Average session duration
- Device breakdown (mobile vs desktop)

### Manual Checks

Weekly:
- [ ] Check deployment logs for errors
- [ ] Review analytics for usage patterns
- [ ] Test on latest browser versions
- [ ] Verify mobile experience
- [ ] Check for user feedback

## Troubleshooting

### Build Fails

```bash
# Clear cache
rm -rf .next
rm -rf node_modules
npm install
npm run build
```

### Game Doesn't Load

1. Check browser console for errors
2. Verify canvas element renders
3. Check network tab for asset loading
4. Test in incognito mode (clear cache)

### Slow Performance

1. Check FPS in DevTools Performance tab
2. Verify object pooling is working
3. Check for memory leaks
4. Test on different device/browser
5. Review large image sizes

### Touch Controls Not Working

1. Test on actual device (not emulator)
2. Check for CSS `touch-action` conflicts
3. Verify event listeners attached
4. Check z-index of overlays
5. Test without browser dev tools open

## Rollback Procedure

If deployment breaks:

```bash
# Via Vercel Dashboard
1. Go to Deployments tab
2. Find last working deployment
3. Click "..." menu
4. Select "Promote to Production"

# Via CLI
vercel rollback
```

## Maintenance

### Regular Tasks

**Daily** (if high traffic):
- Check error logs
- Monitor performance metrics

**Weekly**:
- Review user feedback
- Check for browser updates that might affect game
- Test on new device types
- Update dependencies (if needed)

**Monthly**:
- Review and update educational content
- Add new quizzes/challenges
- Optimize based on analytics
- Update README with new features

### Dependency Updates

```bash
# Check for updates
npm outdated

# Update non-breaking
npm update

# Update major versions (test thoroughly!)
npm install next@latest react@latest
```

## Security

### Best Practices

- ✅ No sensitive data in client code
- ✅ Environment variables for secrets
- ✅ HTTPS enforced (Vercel automatic)
- ✅ CSP headers configured
- ✅ XSS protection enabled

### Regular Security Checks

```bash
# Audit dependencies
npm audit

# Fix vulnerabilities
npm audit fix
```

## Backup

### Code
- ✅ Git version control
- ✅ GitHub remote backup
- ✅ Vercel deployment history

### Data
- User progress stored in browser (localStorage)
- No server-side data to backup

## Support

### User Issues

Common problems and solutions:
1. **Game won't start** → Check WebGL support, try different browser
2. **Laggy on mobile** → Close other apps, try in-game performance mode
3. **Controls not working** → Check keyboard focus, refresh page
4. **Quiz won't complete** → Collect ALL items (greens AND reds)

### Contact

For deployment issues:
- Vercel Support: https://vercel.com/support
- Email: connect@byterunner.co

## Production URL

Once deployed, add your URL here:
```
Production: https://your-app.vercel.app
```

---

**Status: Ready for deployment** ✅

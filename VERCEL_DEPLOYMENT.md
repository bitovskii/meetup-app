# 🚀 Vercel Deployment Guide for Meetup App

## 📋 Pre-Deployment Checklist

### ✅ Fixed Issues for Vercel:
- ✅ Removed `--turbopack` from build script (Vercel compatibility)
- ✅ Updated lint script to use `next lint`
- ✅ Added proper Vercel configuration
- ✅ Environment variables properly configured

## 🌐 Deploy to Vercel

### Method 1: GitHub Integration (Recommended)

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Click "New Project"**
3. **Import from GitHub**: Select your `meetup-app` repository
4. **Configure Project**:
   - Framework Preset: **Next.js**
   - Root Directory: `./` (default)
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `.next` (auto-detected)

### Method 2: Vercel CLI

```bash
# Install Vercel CLI globally
npm i -g vercel

# In your project directory
cd C:\Home\Projects\meetup

# Deploy
vercel

# Follow the prompts:
# - Set up and deploy? Y
# - Which scope? (your account)
# - Link to existing project? N
# - Project name: meetup-app
# - In which directory? ./
# - Override settings? N
```

## 🔐 Environment Variables Setup

**Critical**: Add these environment variables in Vercel Dashboard:

1. **Go to**: Project Settings → Environment Variables
2. **Add these variables**:

```bash
# Required Environment Variables
NEXT_PUBLIC_SUPABASE_URL=https://vlacdhcdhhujnmginvgd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsYWNkaGNkaGh1am5tZ2ludmdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2ODA4MTUsImV4cCI6MjA3NTI1NjgxNX0.B2FbE75J4JxWI1LcvgZn9rd1kEo1GmF2g0UtCe3v3Aw
```

**Environment Targets**: Select `Production`, `Preview`, and `Development`

## 🔧 Post-Deployment Configuration

### Update Supabase Auth Settings

Once deployed, update your Supabase authentication settings:

1. **Go to Supabase Dashboard**: https://supabase.com/dashboard/project/vlacdhcdhhujnmginvgd
2. **Authentication → Settings**
3. **Update Site URL**: `https://your-app-name.vercel.app`
4. **Add Redirect URLs**:
   ```
   https://your-app-name.vercel.app/auth/callback
   https://your-app-name.vercel.app/**
   ```

### Update Google OAuth Redirect URIs

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **APIs & Services → Credentials**
3. **Edit your OAuth 2.0 Client**
4. **Add Authorized Redirect URIs**:
   ```
   https://vlacdhcdhhujnmginvgd.supabase.co/auth/v1/callback
   https://your-app-name.vercel.app/auth/callback
   ```

## 🧪 Testing Deployment

After deployment:

1. **Visit your app**: `https://your-app-name.vercel.app`
2. **Test authentication**: Try signing in with Google
3. **Check setup status**: Visit `/setup-check` page
4. **Verify features**:
   - Events page loads correctly
   - Groups page loads correctly
   - Authentication flow works
   - User profile accessible

## 🚨 Common Deployment Issues & Solutions

### Issue: Build Fails
```bash
Error: Next.js requires Node.js 18.17 or later
```
**Solution**: Vercel automatically uses compatible Node.js version

### Issue: Environment Variables Not Found
```bash
Error: NEXT_PUBLIC_SUPABASE_URL is not defined
```
**Solution**: Add environment variables in Vercel Dashboard

### Issue: Authentication Redirect Error
```bash
Error: Invalid redirect URI
```
**Solution**: Update redirect URIs in both Supabase and Google Console

### Issue: Images Not Loading
```bash
Error: Invalid src prop
```
**Solution**: Already fixed with proper `next.config.ts` image domains

## 📊 Build Performance

Expected build time: **2-3 minutes**
Expected bundle size: **~2MB**

Your app uses:
- ✅ Next.js 15 with App Router
- ✅ TypeScript for type safety
- ✅ Tailwind CSS for styling
- ✅ Supabase for backend
- ✅ Optimized for Vercel deployment

## 🎉 Success!

Once deployed, your meetup app will be available at:
`https://your-app-name.vercel.app`

**Features available:**
- ✅ Google OAuth authentication
- ✅ Event browsing and RSVP
- ✅ Group discovery and joining
- ✅ User profile management
- ✅ Mobile-responsive design
- ✅ Real-time data from Supabase

---

**Need help?** Check the [troubleshooting guide](./AUTHENTICATION_TESTING.md) or [setup documentation](./GOOGLE_OAUTH_SETUP.md).
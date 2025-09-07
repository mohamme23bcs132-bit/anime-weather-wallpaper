# 🔑 API Keys Setup Guide

## Required API Keys

### 1. Spotify API (Required for music features)

**Get your Spotify API key:**
1. Visit: https://developer.spotify.com/dashboard
2. Login with your Spotify account
3. Click "Create App"
4. Fill in details:
   - **App name**: Anime Wallpaper App
   - **App description**: Music-reactive wallpaper generator
   - **Website**: http://localhost:3000
   - **Redirect URI**: `your-app://spotify-callback`
5. Copy your **Client ID** and **Client Secret**

**Add to your app:**
```typescript
// In src/config/api.ts
spotify: {
  clientId: 'YOUR_CLIENT_ID_HERE',
  clientSecret: 'YOUR_CLIENT_SECRET_HERE',
  // ... rest of config
}
```

### 2. Optional Image APIs (for more wallpapers)

#### Unsplash (Optional - Free tier: 50 requests/hour)
1. Visit: https://unsplash.com/developers
2. Create account and app
3. Copy your **Access Key**

#### Pexels (Optional - Free tier: 200 requests/hour) 
1. Visit: https://www.pexels.com/api/
2. Create account
3. Copy your **API Key**

## 🆓 No API Key Needed (Already working)

- ✅ **Picsum Photos** - Random images (currently used)
- ✅ **Jikan API** - Anime data from MyAnimeList
- ✅ **AniList API** - Anime metadata

## Current Status

### ✅ Working Without API Keys:
- Basic wallpaper generation with Picsum
- App navigation and UI
- Local particle effects
- Mock Spotify integration (demo data)

### 🔑 Needs API Keys:
- Real Spotify music data
- Higher quality anime wallpapers
- User authentication
- Cloud features

## Quick Start (No keys needed)

You can run the app immediately with demo features:
```bash
npm run android
# or
npm run ios
```

The app will use:
- Random wallpapers from Picsum
- Mock Spotify data
- Local generative effects

## When you're ready for real features:

1. Get Spotify API key (most important)
2. Update `src/config/api.ts` with your keys
3. Restart the app

**Priority order:**
1. **Spotify API** (for music features) - Most important
2. **Unsplash API** (for better wallpapers) - Optional
3. **Pexels API** (more wallpaper variety) - Optional

The app is fully functional without any API keys for testing and development!

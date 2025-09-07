# Anime Wallpaper App with Spotify Integration 🎵🎨

A unique React Native app that generates dynamic anime wallpapers that react to your Spotify music and device sensors.

## 🌟 Features

### 🎵 Spotify Integration
- **Music-Reactive Wallpapers**: Wallpapers change colors and effects based on your currently playing Spotify track
- **Mood Analysis**: AI analyzes your music's energy, tempo, and mood to generate matching wallpapers  
- **Real-time Sync**: Live updates as your music changes

### 🎨 Generative Art
- **Sensor-Based Effects**: Use device accelerometer and gyroscope for interactive wallpapers
- **Touch Interactions**: Tap and drag to create particle effects
- **Multiple Styles**: Particles, gradients, geometric shapes, and organic patterns
- **Anime Aesthetics**: Color palettes and themes inspired by anime art

### 📱 App Screens  
1. **Home**: Featured wallpapers and quick actions
2. **Browse**: Search and filter anime wallpapers by category
3. **Live Effects**: Interactive generative art with device sensors
4. **Favorites**: Save and manage your favorite wallpapers

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- React Native development environment
- Android Studio or Xcode

### Run the App

1. **Start Metro server**
   ```bash
   npm start
   ```

2. **Run on device**
   ```bash
   # Android  
   npm run android
   
   # iOS
   npm run ios
   ```

## 🎯 App Flow

1. **Launch** → Beautiful anime-themed home screen
2. **Browse** → Explore wallpapers by category, search, and filter  
3. **Generate** → Create unique wallpapers using device sensors
4. **Music Sync** → Connect Spotify for music-reactive effects
5. **Save** → Download wallpapers to device gallery

## 🛠️ Tech Stack

- **React Native 0.81** - Cross-platform mobile framework
- **TypeScript** - Type-safe development  
- **React Navigation** - Screen navigation
- **Device Sensors** - Accelerometer, gyroscope integration
- **Spotify Web API** - Music data integration

## 🎨 Unique Features

### 1. **Music Mood Analysis**
- Analyzes Spotify track energy, valence, tempo
- Maps musical features to visual styles
- Real-time color and pattern changes

### 2. **Interactive Particles** 
- Touch to attract/repel particles
- Shake device to scatter particles
- Tilt device to create gravity effects

### 3. **Anime Aesthetics**
- Curated color palettes inspired by anime
- Particle effects like cherry blossoms, sparkles
- Mood-based visual themes

### 4. **Zero Cost Operation**
- No cloud API costs for basic features
- Local generative algorithms
- Free tier usage only

## 📱 Current Status

✅ **Completed**:
- App navigation and structure
- Home screen with featured wallpapers
- Browse screen with search and filters  
- Interactive particle effects screen
- Favorites management
- Mock Spotify service
- Wallpaper generation utilities

🔧 **Next Steps**:
- Real device sensor integration
- Spotify OAuth implementation  
- Image download functionality

---

**Built with ❤️ for anime and music lovers**

## Step 1: Start Metro

First, you will need to run **Metro**, the JavaScript build tool for React Native.

To start the Metro dev server, run the following command from the root of your React Native project:

```sh
# Using npm
npm start

# OR using Yarn
yarn start
```

## Step 2: Build and run your app

With Metro running, open a new terminal window/pane from the root of your React Native project, and use one of the following commands to build and run your Android or iOS app:

### Android

```sh
# Using npm
npm run android

# OR using Yarn
yarn android
```

### iOS

For iOS, remember to install CocoaPods dependencies (this only needs to be run on first clone or after updating native deps).

The first time you create a new project, run the Ruby bundler to install CocoaPods itself:

```sh
bundle install
```

Then, and every time you update your native dependencies, run:

```sh
bundle exec pod install
```

For more information, please visit [CocoaPods Getting Started guide](https://guides.cocoapods.org/using/getting-started.html).

```sh
# Using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up correctly, you should see your new app running in the Android Emulator, iOS Simulator, or your connected device.

This is one way to run your app — you can also build it directly from Android Studio or Xcode.

## Step 3: Modify your app

Now that you have successfully run the app, let's make changes!

Open `App.tsx` in your text editor of choice and make some changes. When you save, your app will automatically update and reflect these changes — this is powered by [Fast Refresh](https://reactnative.dev/docs/fast-refresh).

When you want to forcefully reload, for example to reset the state of your app, you can perform a full reload:

- **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Dev Menu**, accessed via <kbd>Ctrl</kbd> + <kbd>M</kbd> (Windows/Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (macOS).
- **iOS**: Press <kbd>R</kbd> in iOS Simulator.

## Congratulations! :tada:

You've successfully run and modified your React Native App. :partying_face:

### Now what?

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).
- If you're curious to learn more about React Native, check out the [docs](https://reactnative.dev/docs/getting-started).

# Troubleshooting

If you're having issues getting the above steps to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.

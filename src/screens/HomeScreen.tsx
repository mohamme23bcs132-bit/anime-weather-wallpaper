import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  useColorScheme,
  TouchableOpacity,
  Dimensions,
  Image,
  Alert,
  Linking,
  PermissionsAndroid,
  Platform,
  Share,
} from 'react-native';
// Temporarily removed vector icons to avoid setup complexity
// import Icon from 'react-native-vector-icons/MaterialIcons';
import Geolocation from '@react-native-community/geolocation';
import WallpaperService from '../services/WallpaperService';

const { width } = Dimensions.get('window');

// Weather-based anime wallpapers
const weatherWallpapers = {
  clear: [
    { id: 'clear1', title: 'Sunny Meadow', imageUrl: 'https://picsum.photos/400/600?random=sunny1', theme: 'bright-anime' },
    { id: 'clear2', title: 'Blue Sky Adventure', imageUrl: 'https://picsum.photos/400/600?random=sunny2', theme: 'cheerful-anime' },
  ],
  rain: [
    { id: 'rain1', title: 'Rainy Day Romance', imageUrl: 'https://picsum.photos/400/600?random=rain1', theme: 'cozy-anime' },
    { id: 'rain2', title: 'Umbrella Tales', imageUrl: 'https://picsum.photos/400/600?random=rain2', theme: 'melancholic-anime' },
  ],
  snow: [
    { id: 'snow1', title: 'Winter Wonderland', imageUrl: 'https://picsum.photos/400/600?random=snow1', theme: 'winter-anime' },
    { id: 'snow2', title: 'Snowy Village', imageUrl: 'https://picsum.photos/400/600?random=snow2', theme: 'peaceful-anime' },
  ],
  clouds: [
    { id: 'cloud1', title: 'Sky Castle', imageUrl: 'https://picsum.photos/400/600?random=cloud1', theme: 'dreamy-anime' },
    { id: 'cloud2', title: 'Floating Islands', imageUrl: 'https://picsum.photos/400/600?random=cloud2', theme: 'fantasy-anime' },
  ],
  storm: [
    { id: 'storm1', title: 'Lightning Strike', imageUrl: 'https://picsum.photos/400/600?random=storm1', theme: 'dramatic-anime' },
    { id: 'storm2', title: 'Stormy Night', imageUrl: 'https://picsum.photos/400/600?random=storm2', theme: 'intense-anime' },
  ],
};

// Location & weather functions
const requestLocationPermission = async () => {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'This app needs location access to show weather-based anime wallpapers.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      return false;
    }
  }
  return true;
};

const getWeatherWallpaper = async () => {
  const hasPermission = await requestLocationPermission();
  if (!hasPermission) {
    Alert.alert('Permission Denied', 'Location permission is needed for weather-based wallpapers.');
    return null;
  }

  return new Promise((resolve) => {
    Geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Simulate weather conditions for demo (replace with real API)
          const weatherConditions = ['clear', 'rain', 'snow', 'clouds', 'storm'];
          const randomCondition = weatherConditions[Math.floor(Math.random() * weatherConditions.length)];
          const wallpaperCategory: keyof typeof weatherWallpapers = randomCondition as keyof typeof weatherWallpapers;
          
          const wallpapers = weatherWallpapers[wallpaperCategory];
          const randomWallpaper = wallpapers[Math.floor(Math.random() * wallpapers.length)];
          
          resolve({
            ...randomWallpaper,
            weatherInfo: {
              condition: randomCondition.charAt(0).toUpperCase() + randomCondition.slice(1),
              temperature: Math.round(Math.random() * 30 + 5), // Random temperature 5-35°C
              location: 'Current Location',
            }
          });
        } catch (error) {
          const fallbackWallpapers = weatherWallpapers.clear;
          resolve(fallbackWallpapers[Math.floor(Math.random() * fallbackWallpapers.length)]);
        }
      },
      (error) => {
        Alert.alert('Location Error', 'Could not get your location. Using default wallpaper.');
        const fallbackWallpapers = weatherWallpapers.clear;
        resolve({
          ...fallbackWallpapers[Math.floor(Math.random() * fallbackWallpapers.length)],
          weatherInfo: {
            condition: 'Clear',
            temperature: 22,
            location: 'Demo Location',
          }
        });
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  });
};

const saveImageToGallery = async (imageUrl: string) => {
  try {
    Alert.alert(
      'Download Wallpaper',
      'Choose how to save this wallpaper:',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Open in Browser', 
          onPress: () => {
            Linking.openURL(imageUrl);
            Alert.alert('Save Image', 'Long press the image and select "Save to Photos/Gallery"');
          }
        },
        {
          text: 'Share Image',
          onPress: () => {
            Share.share({
              message: 'Check out this anime wallpaper!',
              url: imageUrl,
            });
          }
        }
      ]
    );
  } catch (error) {
    Alert.alert('Error', 'Failed to save image.');
  }
};

// Sample data
const featuredWallpapers = [
  { id: 1, title: 'Anime Sunset', category: 'Landscape', imageUrl: 'https://picsum.photos/400/600?random=1' },
  { id: 2, title: 'Cherry Blossoms', category: 'Nature', imageUrl: 'https://picsum.photos/400/600?random=2' },
  { id: 3, title: 'Neon City', category: 'Cyberpunk', imageUrl: 'https://picsum.photos/400/600?random=3' },
  { id: 4, title: 'Ocean Waves', category: 'Nature', imageUrl: 'https://picsum.photos/400/600?random=4' },
];

const categories = [
  { name: 'Popular', icon: '📈' },
  { name: 'Characters', icon: '👤' },
  { name: 'Landscapes', icon: '🏔️' },
  { name: 'Cyberpunk', icon: '💻' },
  { name: 'Fantasy', icon: '✨' },
];

const HomeScreen: React.FC = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weatherWallpaper, setWeatherWallpaper] = useState<any>(null);
  const [loadingWeather, setLoadingWeather] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const generateWeatherWallpaper = async () => {
    setLoadingWeather(true);
    try {
      const wallpaper = await getWeatherWallpaper() as any;
      setWeatherWallpaper(wallpaper);
      Alert.alert(
        'Weather Wallpaper Generated! 🌤️',
        `Generated ${wallpaper?.title} based on your local weather: ${wallpaper?.weatherInfo?.condition || 'Unknown'} ${wallpaper?.weatherInfo?.temperature ? `${wallpaper.weatherInfo.temperature}°C` : ''}`
      );
    } catch (error) {
      Alert.alert('Error', 'Could not generate weather-based wallpaper.');
    } finally {
      setLoadingWeather(false);
    }
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const setWallpaper = async (imageUrl: string) => {
    try {
      // Show progress indicator
      Alert.alert(
        '📥 Setting Wallpaper...',
        'Downloading and setting your wallpaper...',
        [{ text: 'OK' }]
      );

      // Use the new Kotlin WallpaperModule
      const result = await WallpaperService.setWallpaper(imageUrl);
      
      Alert.alert(
        '✅ Success!',
        'Wallpaper has been set successfully!',
        [{ text: 'Awesome!' }]
      );
    } catch (error) {
      console.error('Error setting wallpaper:', error);
      
      // Fallback to manual download
      Alert.alert(
        '❌ Error Setting Wallpaper',
        'Unable to set wallpaper directly. Would you like to download it instead?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Download', 
            onPress: () => saveImageToGallery(imageUrl)
          }
        ]
      );
    }
  };

  const styles = createStyles(isDarkMode);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.subtitle}>Discover amazing anime wallpapers</Text>
        </View>
        <TouchableOpacity style={styles.musicButton}>
          <Text style={{ fontSize: 24 }}>🎵</Text>
        </TouchableOpacity>
      </View>

      {/* Weather-Based Wallpaper Section */}
      <View style={styles.weatherSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Weather-Based Wallpaper 🌤️</Text>
        </View>
        
        {weatherWallpaper && (
          <View style={styles.weatherWallpaperContainer}>
            <Image
              source={{ uri: weatherWallpaper.imageUrl }}
              style={styles.weatherWallpaperImage}
              resizeMode="cover"
            />
            <View style={styles.weatherInfo}>
              <Text style={styles.weatherTitle}>{weatherWallpaper.title}</Text>
              {weatherWallpaper.weatherInfo && (
                <Text style={styles.weatherDetails}>
                  {weatherWallpaper.weatherInfo.condition} • {weatherWallpaper.weatherInfo.temperature}°C • {weatherWallpaper.weatherInfo.location}
                </Text>
              )}
            </View>
            <View style={styles.weatherButtons}>
              <TouchableOpacity
                style={styles.button}
                onPress={() => setWallpaper(weatherWallpaper.imageUrl)}
              >
                <Text style={styles.buttonText}>Set Weather Wallpaper</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: '#4ECDC4' }]}
                onPress={() => saveImageToGallery(weatherWallpaper.imageUrl)}
              >
                <Text style={styles.buttonText}>📥 Download Weather Wallpaper</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        
        <TouchableOpacity 
          style={[styles.weatherGenerateButton, loadingWeather && styles.disabledButton]} 
          onPress={generateWeatherWallpaper}
          disabled={loadingWeather}
        >
          <Text style={{ fontSize: 28 }}>☀️</Text>
          <Text style={styles.weatherGenerateText}>
            {loadingWeather ? 'Getting Weather...' : 'Generate Weather Wallpaper'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Categories */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Categories</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20 }}
        >
          {categories.map((category, index) => (
            <TouchableOpacity key={index} style={styles.categoryItem}>
              <View style={styles.categoryIcon}>
                <Text style={{ fontSize: 24 }}>{category.icon}</Text>
              </View>
              <Text style={styles.categoryText}>{category.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Featured Wallpapers */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured Today</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20 }}
        >
          {featuredWallpapers.map((wallpaper) => (
            <View key={wallpaper.id} style={styles.wallpaperCard}>
              <Image
                source={{ uri: wallpaper.imageUrl }}
                style={styles.wallpaperImage}
                resizeMode="cover"
              />
              <View style={styles.wallpaperInfoContainer}>
                <Text style={styles.wallpaperTitle}>{wallpaper.title}</Text>
                <Text style={styles.wallpaperCategory}>{wallpaper.category}</Text>
              </View>
              <TouchableOpacity
                style={styles.button}
                onPress={() => setWallpaper(wallpaper.imageUrl)}
              >
                <Text style={styles.buttonText}>Set as Wallpaper</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: '#4ECDC4' }]}
                onPress={() => saveImageToGallery(wallpaper.imageUrl)}
              >
                <Text style={styles.buttonText}>📥 Download</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      </View>
    </ScrollView>
  );
};

const createStyles = (isDarkMode: boolean) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: isDarkMode ? '#000' : '#fff' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
    greeting: { fontSize: 28, fontWeight: 'bold', color: isDarkMode ? '#fff' : '#000' },
    subtitle: { fontSize: 16, color: isDarkMode ? '#888' : '#666', marginTop: 4 },
    musicButton: { width: 48, height: 48, borderRadius: 24, backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5', justifyContent: 'center', alignItems: 'center' },
    section: { marginBottom: 32 },
    weatherSection: {
      marginBottom: 32,
      backgroundColor: isDarkMode ? 'rgba(255, 107, 157, 0.1)' : 'rgba(255, 107, 157, 0.05)',
      marginHorizontal: 20,
      borderRadius: 16,
      paddingVertical: 16,
      marginTop: 16,
    },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingHorizontal: 20 },
    sectionTitle: { fontSize: 20, fontWeight: 'bold', color: isDarkMode ? '#fff' : '#000' },
    wallpaperCard: {
      width: width * 0.45,
      marginRight: 16,
      borderRadius: 16,
      backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5',
      paddingBottom: 12,
    },
    wallpaperImage: { width: '100%', height: width * 0.55, borderTopLeftRadius: 16, borderTopRightRadius: 16 },
    wallpaperInfoContainer: { padding: 8 },
    wallpaperTitle: { fontSize: 14, fontWeight: 'bold', color: isDarkMode ? '#fff' : '#000' },
    wallpaperCategory: { fontSize: 12, color: isDarkMode ? '#ccc' : '#666' },
    button: {
      backgroundColor: '#FF6B9D',
      borderRadius: 8,
      paddingVertical: 10,
      alignItems: 'center',
      marginVertical: 4,
      marginHorizontal: 8,
    },
    buttonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
    
    // Weather-specific styles
    weatherWallpaperContainer: {
      backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5',
      borderRadius: 16,
      padding: 16,
      marginHorizontal: 20,
      marginBottom: 16,
    },
    weatherWallpaperImage: {
      width: '100%',
      height: 200,
      borderRadius: 12,
      marginBottom: 12,
    },
    weatherInfo: {
      marginBottom: 12,
    },
    weatherTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: isDarkMode ? '#fff' : '#000',
      marginBottom: 4,
    },
    weatherDetails: {
      fontSize: 14,
      color: isDarkMode ? '#ccc' : '#666',
    },
    weatherButtons: {
      flexDirection: 'row',
      gap: 8,
    },
    weatherGenerateButton: {
      backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5',
      padding: 20,
      borderRadius: 16,
      alignItems: 'center',
      marginHorizontal: 20,
      minHeight: 80,
    },
    weatherGenerateText: {
      fontSize: 14,
      fontWeight: '600',
      color: isDarkMode ? '#ffffff' : '#000000',
      marginTop: 8,
      textAlign: 'center',
      lineHeight: 18,
    },
    disabledButton: {
      opacity: 0.5,
    },
    
    // Category styles
    categoryItem: {
      alignItems: 'center',
      marginRight: 20,
    },
    categoryIcon: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 8,
    },
    categoryText: {
      fontSize: 12,
      fontWeight: '600',
      color: isDarkMode ? '#fff' : '#000',
      textAlign: 'center',
    },
  });

export default HomeScreen;

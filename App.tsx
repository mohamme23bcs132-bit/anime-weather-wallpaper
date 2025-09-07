import React, {useState, useEffect} from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
  FlatList,
} from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import HomeScreen from './src/screens/HomeScreen'; // Import your weather-enabled home screen
import AnimeWallpaperScreen from './src/screens/AnimeWallpaperScreen'; // Import anime wallpaper screen

// TypeScript interfaces
interface AnimeAttributes {
  posterImage: {
    small: string;
    original: string;
  };
  canonicalTitle: string;
}

interface AnimeItem {
  id: string;
  attributes: AnimeAttributes;
}

// Browse: fetch and display a list of anime posters
const KITSU_BROWSE_API = 'https://kitsu.io/api/edge/anime?page[limit]=10&page[offset]=0';
const SimpleBrowseScreen = () => {
  const [animeList, setAnimeList] = useState<AnimeItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAnimeList = async () => {
    setLoading(true);
    try {
      const response = await fetch(KITSU_BROWSE_API);
      const data = await response.json();
      setAnimeList(data.data);
    } catch (error) {
      setAnimeList([]);
      Alert.alert('Error', 'Could not fetch anime list.');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAnimeList();
  }, []);

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>🔍 Browse Wallpapers</Text>
        <Text style={styles.subtitle}>Discover anime posters</Text>
      </View>
      {loading && <ActivityIndicator size="large" color="#FF6B9D" />}
      <FlatList
        data={animeList}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={{ uri: item.attributes.posterImage.small }} style={styles.browseImage} />
            <Text style={styles.cardTitle}>{item.attributes.canonicalTitle}</Text>
          </View>
        )}
      />
    </View>
  );
};

// Generate: simulate particle effects
const SimpleGenerativeScreen = () => {
  const [particles, setParticles] = useState(0);
  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>✨ Generate Art</Text>
        <Text style={styles.subtitle}>Tap to create particle effects</Text>
      </View>
      <TouchableOpacity 
        style={styles.canvas} 
        onPress={() => {
          setParticles(particles + 1);
          Alert.alert('Effect!', `Created ${particles + 1} particles! ✨`);
        }}
      >
        <Text style={styles.canvasText}>🎨 Interactive Canvas</Text>
        <Text style={styles.canvasSubtext}>Touches: {particles}</Text>
      </TouchableOpacity>
      <View style={styles.buttonRow}>
        <TouchableOpacity 
          style={[styles.button, {backgroundColor: '#FF6B9D'}]} 
          onPress={() => Alert.alert('Generate!', 'Particles generated!')}
        >
          <Text style={styles.buttonText}>Generate Particles</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.button, {backgroundColor: '#4ECDC4'}]} 
          onPress={() => {
            setParticles(0);
            Alert.alert('Reset!', 'Canvas reset!');
          }}
        >
          <Text style={styles.buttonText}>Reset Canvas</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Favorites: show a list of favorite wallpapers (local state only)
const SimpleFavoritesScreen = () => {
  const [favorites, setFavorites] = useState([]);
  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>❤️ My Favorites</Text>
        <Text style={styles.subtitle}>Your saved wallpapers</Text>
      </View>
      {favorites.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No favorites yet</Text>
          <Text style={styles.emptySubtext}>Browse and add wallpapers to favorites</Text>
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item, idx) => idx.toString()}
          renderItem={({ item }) => (
            <Image source={{ uri: item }} style={styles.wallpaper} />
          )}
        />
      )}
    </View>
  );
};

function App(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState('home');

  const renderScreen = () => {
    switch (activeTab) {
      case 'home':
        return <HomeScreen />; // Use your weather-enabled home screen
      case 'anime':
        return <AnimeWallpaperScreen />; // Use your dedicated anime wallpaper screen
      case 'generate':
        return <SimpleGenerativeScreen />;
      case 'favorites':
        return <SimpleFavoritesScreen />;
      default:
        return <HomeScreen />; // Default to weather-enabled home screen
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#121212" />
        <View style={styles.content}>
          {renderScreen()}
        </View>
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'home' && styles.activeTab]}
            onPress={() => setActiveTab('home')}>
            <Text style={[styles.tabText, activeTab === 'home' && styles.activeTabText]}>
              🏠 Home
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'anime' && styles.activeTab]}
            onPress={() => setActiveTab('anime')}>
            <Text style={[styles.tabText, activeTab === 'anime' && styles.activeTabText]}>
              🎌 Anime
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'generate' && styles.activeTab]}
            onPress={() => setActiveTab('generate')}>
            <Text style={[styles.tabText, activeTab === 'generate' && styles.activeTabText]}>
              ✨ Generate
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'favorites' && styles.activeTab]}
            onPress={() => setActiveTab('favorites')}>
            <Text style={[styles.tabText, activeTab === 'favorites' && styles.activeTabText]}>
              ❤️ Favorites
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  content: {
    flex: 1,
  },
  screen: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 16,
    color: '#888888',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginVertical: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  cardText: {
    fontSize: 14,
    color: '#888888',
    lineHeight: 20,
  },
  smallText: {
    fontSize: 12,
    color: '#666666',
    marginTop: 4,
  },
  button: {
    backgroundColor: '#FF6B9D',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    marginHorizontal: 20,
    marginVertical: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  categoryCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginVertical: 6,
    alignItems: 'center',
  },
  categoryText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
  },
  canvas: {
    backgroundColor: '#111111',
    borderRadius: 16,
    paddingVertical: 60,
    alignItems: 'center',
    marginHorizontal: 20,
    marginVertical: 20,
  },
  canvasText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#888888',
    marginBottom: 8,
  },
  canvasSubtext: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#888888',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 20,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#1e1e1e',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
  },
  activeTab: {
    backgroundColor: '#333',
    borderRadius: 5,
    marginHorizontal: 2,
  },
  tabText: {
    color: '#888',
    fontSize: 10,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#fff',
  },
  wallpaper: {
    width: 300,
    height: 450,
    borderRadius: 16,
    marginBottom: 20,
  },
  browseImage: {
    width: 120,
    height: 180,
    borderRadius: 8,
    marginBottom: 8,
  },
});

export default App;

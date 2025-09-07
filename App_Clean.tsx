/**
 * Anime Wallpaper App - Simple Version
 * @format
 */

import React, { useState } from 'react';
import { StatusBar, StyleSheet, useColorScheme, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Simple tab navigation component
const TabButton = ({ title, isActive, onPress }: { title: string; isActive: boolean; onPress: () => void }) => (
  <TouchableOpacity
    style={[styles.tabButton, isActive && styles.tabButtonActive]}
    onPress={onPress}
  >
    <Text style={[styles.tabButtonText, isActive && styles.tabButtonTextActive]}>
      {title}
    </Text>
  </TouchableOpacity>
);

// Simple Home Screen Component
const HomeScreen = ({ isDarkMode }: { isDarkMode: boolean }) => (
  <ScrollView style={[styles.screenContainer, { backgroundColor: isDarkMode ? '#000000' : '#ffffff' }]}>
    <View style={styles.header}>
      <Text style={[styles.headerTitle, { color: isDarkMode ? '#ffffff' : '#000000' }]}>
        Anime Wallpapers 🎨
      </Text>
      <Text style={[styles.headerSubtitle, { color: isDarkMode ? '#888888' : '#666666' }]}>
        Beautiful wallpapers that react to your music
      </Text>
    </View>
    
    <View style={styles.featuresContainer}>
      <View style={[styles.featureCard, { backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5' }]}>
        <Text style={[styles.featureTitle, { color: isDarkMode ? '#ffffff' : '#000000' }]}>
          🎵 Music Reactive
        </Text>
        <Text style={[styles.featureDescription, { color: isDarkMode ? '#888888' : '#666666' }]}>
          Wallpapers change with your Spotify music mood and tempo
        </Text>
      </View>
      
      <View style={[styles.featureCard, { backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5' }]}>
        <Text style={[styles.featureTitle, { color: isDarkMode ? '#ffffff' : '#000000' }]}>
          ✨ Interactive Effects
        </Text>
        <Text style={[styles.featureDescription, { color: isDarkMode ? '#888888' : '#666666' }]}>
          Touch and sensor-based particle effects and animations
        </Text>
      </View>
      
      <View style={[styles.featureCard, { backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5' }]}>
        <Text style={[styles.featureTitle, { color: isDarkMode ? '#ffffff' : '#000000' }]}>
          🎨 Anime Aesthetics
        </Text>
        <Text style={[styles.featureDescription, { color: isDarkMode ? '#888888' : '#666666' }]}>
          Beautiful anime-inspired colors and artistic styles
        </Text>
      </View>
    </View>
    
    <TouchableOpacity style={styles.actionButton}>
      <Text style={styles.actionButtonText}>Generate Random Wallpaper</Text>
    </TouchableOpacity>
  </ScrollView>
);

// Simple Browse Screen Component
const BrowseScreen = ({ isDarkMode }: { isDarkMode: boolean }) => (
  <ScrollView style={[styles.screenContainer, { backgroundColor: isDarkMode ? '#000000' : '#ffffff' }]}>
    <View style={styles.header}>
      <Text style={[styles.headerTitle, { color: isDarkMode ? '#ffffff' : '#000000' }]}>
        Browse Wallpapers
      </Text>
      <Text style={[styles.headerSubtitle, { color: isDarkMode ? '#888888' : '#666666' }]}>
        Discover amazing anime wallpapers
      </Text>
    </View>
    
    <View style={styles.categoriesContainer}>
      {['Popular', 'Characters', 'Landscapes', 'Cyberpunk', 'Fantasy'].map((category) => (
        <TouchableOpacity key={category} style={[styles.categoryCard, { backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5' }]}>
          <Text style={[styles.categoryText, { color: isDarkMode ? '#ffffff' : '#000000' }]}>
            {category}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  </ScrollView>
);

// Simple Live Effects Screen Component
const LiveEffectsScreen = ({ isDarkMode }: { isDarkMode: boolean }) => (
  <ScrollView style={[styles.screenContainer, { backgroundColor: isDarkMode ? '#000000' : '#ffffff' }]}>
    <View style={styles.header}>
      <Text style={[styles.headerTitle, { color: isDarkMode ? '#ffffff' : '#000000' }]}>
        Live Effects ✨
      </Text>
      <Text style={[styles.headerSubtitle, { color: isDarkMode ? '#888888' : '#666666' }]}>
        Interactive wallpaper generation
      </Text>
    </View>
    
    <View style={[styles.canvasPlaceholder, { backgroundColor: isDarkMode ? '#111111' : '#f8f8f8' }]}>
      <Text style={[styles.canvasText, { color: isDarkMode ? '#888888' : '#666666' }]}>
        🎨 Interactive Canvas
      </Text>
      <Text style={[styles.canvasSubtext, { color: isDarkMode ? '#666666' : '#888888' }]}>
        Touch to create particle effects
      </Text>
    </View>
    
    <View style={styles.controlsContainer}>
      <TouchableOpacity style={[styles.controlButton, { backgroundColor: '#FF6B9D' }]}>
        <Text style={styles.controlButtonText}>Generate Particles</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.controlButton, { backgroundColor: '#4ECDC4' }]}>
        <Text style={styles.controlButtonText}>Reset Canvas</Text>
      </TouchableOpacity>
    </View>
  </ScrollView>
);

// Simple Favorites Screen Component
const FavoritesScreen = ({ isDarkMode }: { isDarkMode: boolean }) => (
  <ScrollView style={[styles.screenContainer, { backgroundColor: isDarkMode ? '#000000' : '#ffffff' }]}>
    <View style={styles.header}>
      <Text style={[styles.headerTitle, { color: isDarkMode ? '#ffffff' : '#000000' }]}>
        My Favorites ❤️
      </Text>
      <Text style={[styles.headerSubtitle, { color: isDarkMode ? '#888888' : '#666666' }]}>
        Your saved wallpapers
      </Text>
    </View>
    
    <View style={styles.emptyState}>
      <Text style={[styles.emptyStateText, { color: isDarkMode ? '#888888' : '#666666' }]}>
        No favorites yet
      </Text>
      <Text style={[styles.emptyStateSubtext, { color: isDarkMode ? '#666666' : '#888888' }]}>
        Browse wallpapers and add them to your favorites
      </Text>
    </View>
  </ScrollView>
);

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const [activeTab, setActiveTab] = useState('Home');

  const renderScreen = () => {
    switch (activeTab) {
      case 'Home':
        return <HomeScreen isDarkMode={isDarkMode} />;
      case 'Browse':
        return <BrowseScreen isDarkMode={isDarkMode} />;
      case 'Effects':
        return <LiveEffectsScreen isDarkMode={isDarkMode} />;
      case 'Favorites':
        return <FavoritesScreen isDarkMode={isDarkMode} />;
      default:
        return <HomeScreen isDarkMode={isDarkMode} />;
    }
  };

  return (
    <SafeAreaProvider>
      <StatusBar 
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={isDarkMode ? '#1a1a1a' : '#ffffff'}
      />
      <View style={[styles.container, { backgroundColor: isDarkMode ? '#000000' : '#ffffff' }]}>
        {renderScreen()}
        
        {/* Simple Tab Bar */}
        <View style={[styles.tabBar, { backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff' }]}>
          <TabButton title="Home" isActive={activeTab === 'Home'} onPress={() => setActiveTab('Home')} />
          <TabButton title="Browse" isActive={activeTab === 'Browse'} onPress={() => setActiveTab('Browse')} />
          <TabButton title="Effects" isActive={activeTab === 'Effects'} onPress={() => setActiveTab('Effects')} />
          <TabButton title="Favorites" isActive={activeTab === 'Favorites'} onPress={() => setActiveTab('Favorites')} />
        </View>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  screenContainer: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 16,
    marginTop: 4,
  },
  featuresContainer: {
    paddingHorizontal: 20,
    gap: 16,
  },
  featureCard: {
    borderRadius: 16,
    padding: 20,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  actionButton: {
    backgroundColor: '#FF6B9D',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    marginHorizontal: 20,
    marginVertical: 20,
    alignItems: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  categoryCard: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  categoryText: {
    fontSize: 16,
    fontWeight: '500',
  },
  canvasPlaceholder: {
    marginHorizontal: 20,
    borderRadius: 16,
    paddingVertical: 60,
    alignItems: 'center',
    marginBottom: 20,
  },
  canvasText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  canvasSubtext: {
    fontSize: 14,
  },
  controlsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  controlButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  controlButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    paddingBottom: 20,
    paddingTop: 10,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: 'transparent',
  },
  tabButtonText: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
  },
  tabButtonTextActive: {
    color: '#FF6B9D',
    fontWeight: '600',
  },
});

export default App;

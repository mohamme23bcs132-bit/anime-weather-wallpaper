import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  useColorScheme,
  TouchableOpacity,
  TextInput,
  Dimensions,
  FlatList,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width } = Dimensions.get('window');

// Sample wallpapers data
const sampleWallpapers = [
  { id: 1, title: 'Anime Sunset', category: 'Landscape', imageUrl: 'https://picsum.photos/400/600?random=1' },
  { id: 2, title: 'Cherry Blossoms', category: 'Nature', imageUrl: 'https://picsum.photos/400/600?random=2' },
  { id: 3, title: 'Neon City', category: 'Cyberpunk', imageUrl: 'https://picsum.photos/400/600?random=3' },
  { id: 4, title: 'Ocean Waves', category: 'Nature', imageUrl: 'https://picsum.photos/400/600?random=4' },
  { id: 5, title: 'Mountain View', category: 'Landscape', imageUrl: 'https://picsum.photos/400/600?random=5' },
  { id: 6, title: 'Space Galaxy', category: 'Space', imageUrl: 'https://picsum.photos/400/600?random=6' },
  { id: 7, title: 'Dragon Art', category: 'Fantasy', imageUrl: 'https://picsum.photos/400/600?random=7' },
  { id: 8, title: 'Kawaii Cat', category: 'Characters', imageUrl: 'https://picsum.photos/400/600?random=8' },
];

const categories = ['All', 'Popular', 'Characters', 'Landscape', 'Nature', 'Cyberpunk', 'Fantasy', 'Space'];

const BrowseScreen: React.FC = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [wallpapers] = useState(sampleWallpapers);

  const filteredWallpapers = wallpapers.filter(wallpaper => {
    const matchesSearch = wallpaper.title.toLowerCase().includes(searchText.toLowerCase()) ||
                         wallpaper.category.toLowerCase().includes(searchText.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || wallpaper.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const renderWallpaper = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.wallpaperItem}>
      <Image
        source={{ uri: item.imageUrl }}
        style={styles.wallpaperImage}
        resizeMode="cover"
      />
      <View style={styles.wallpaperOverlay}>
        <View style={styles.wallpaperInfo}>
          <Text style={styles.wallpaperTitle}>{item.title}</Text>
          <Text style={styles.wallpaperCategory}>{item.category}</Text>
        </View>
        <View style={styles.wallpaperActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Icon name="download" size={20} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Icon name="favorite-border" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const styles = createStyles(isDarkMode);

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Icon name="search" size={20} color={isDarkMode ? '#888888' : '#666666'} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search wallpapers..."
            placeholderTextColor={isDarkMode ? '#888888' : '#666666'}
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText ? (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <Icon name="clear" size={20} color={isDarkMode ? '#888888' : '#666666'} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryChip,
              selectedCategory === category && styles.categoryChipSelected,
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text
              style={[
                styles.categoryChipText,
                selectedCategory === category && styles.categoryChipTextSelected,
              ]}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Results Header */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsText}>
          {filteredWallpapers.length} wallpapers found
        </Text>
        <TouchableOpacity style={styles.sortButton}>
          <Icon name="sort" size={20} color="#FF6B9D" />
          <Text style={styles.sortText}>Sort</Text>
        </TouchableOpacity>
      </View>

      {/* Wallpapers Grid */}
      <FlatList
        data={filteredWallpapers}
        renderItem={renderWallpaper}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.wallpapersContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const createStyles = (isDarkMode: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDarkMode ? '#000000' : '#ffffff',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: isDarkMode ? '#ffffff' : '#000000',
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  categoryChip: {
    backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
  },
  categoryChipSelected: {
    backgroundColor: '#FF6B9D',
  },
  categoryChipText: {
    fontSize: 14,
    color: isDarkMode ? '#ffffff' : '#000000',
    fontWeight: '500',
  },
  categoryChipTextSelected: {
    color: 'white',
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  resultsText: {
    fontSize: 16,
    color: isDarkMode ? '#ffffff' : '#000000',
    fontWeight: '500',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortText: {
    fontSize: 14,
    color: '#FF6B9D',
    fontWeight: '500',
    marginLeft: 4,
  },
  wallpapersContainer: {
    paddingHorizontal: 20,
  },
  row: {
    justifyContent: 'space-between',
  },
  wallpaperItem: {
    width: (width - 60) / 2,
    height: ((width - 60) / 2) * 1.5,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  wallpaperImage: {
    width: '100%',
    height: '100%',
  },
  wallpaperOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 12,
  },
  wallpaperInfo: {
    marginBottom: 8,
  },
  wallpaperTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 2,
  },
  wallpaperCategory: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  wallpaperActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    padding: 4,
  },
});

export default BrowseScreen;

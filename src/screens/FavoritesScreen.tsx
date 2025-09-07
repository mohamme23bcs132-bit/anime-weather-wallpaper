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
  TextInput,
  Modal,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

interface FavoriteAnime {
  id: number;
  title: string;
  slug: string;
  imageUrl: string;
  synopsis?: string;
  rating?: string;
  episodes?: number;
  status?: string;
  dateAdded: string;
}

interface Collection {
  id: string;
  name: string;
  emoji: string;
  animeIds: number[];
  dateCreated: string;
}

const emojis = ['📱', '⭐', '🎌', '🌸', '🔥', '💜', '🌟', '🎯', '🎪', '🎨', '🌈', '🎭'];

const createStyles = (isDarkMode: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDarkMode ? '#000000' : '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: isDarkMode ? '#ffffff' : '#000000',
  },
  subtitle: {
    fontSize: 14,
    color: isDarkMode ? '#888888' : '#666666',
    marginTop: 4,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  headerButton: {
    padding: 4,
  },
  headerButtonText: {
    fontSize: 20,
  },
  deleteButton: {
    padding: 4,
  },
  deleteButtonText: {
    fontSize: 20,
  },
  collectionsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  collectionTab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    gap: 6,
  },
  collectionTabActive: {
    backgroundColor: '#FF6B9D',
  },
  collectionTabEmoji: {
    fontSize: 16,
  },
  collectionTabText: {
    fontSize: 14,
    color: isDarkMode ? '#888888' : '#666666',
    fontWeight: '500',
  },
  collectionTabTextActive: {
    color: '#ffffff',
  },
  sortContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    gap: 6,
  },
  sortButtonActive: {
    backgroundColor: '#FF6B9D',
  },
  sortEmoji: {
    fontSize: 16,
  },
  sortText: {
    fontSize: 14,
    color: isDarkMode ? '#888888' : '#666666',
    fontWeight: '500',
  },
  sortTextActive: {
    color: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  favoritesContainer: {
    paddingHorizontal: 20,
  },
  favoritesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  favoriteItem: {
    width: (width - 60) / 2,
    height: ((width - 60) / 2) * 1.5,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  favoriteItemSelected: {
    opacity: 0.8,
    transform: [{ scale: 0.95 }],
  },
  favoriteImage: {
    width: '100%',
    height: '100%',
  },
  selectionOverlay: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 2,
  },
  selectionCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderWidth: 2,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectionCheckboxSelected: {
    backgroundColor: '#FF6B9D',
    borderColor: '#FF6B9D',
  },
  checkmark: {
    fontSize: 14,
    color: 'white',
    fontWeight: 'bold',
  },
  favoriteOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 12,
  },
  favoriteInfo: {
    marginBottom: 8,
  },
  favoriteTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 2,
  },
  favoriteRating: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 2,
  },
  favoriteEpisodes: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 2,
  },
  favoriteDate: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.6)',
  },
  favoriteActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    padding: 4,
  },
  actionEmoji: {
    fontSize: 18,
  },
  // Collection creation styles
  createCollectionContainer: {
    flex: 1,
    padding: 20,
  },
  createCollectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  createCollectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: isDarkMode ? '#ffffff' : '#000000',
  },
  cancelButton: {
    fontSize: 24,
    color: isDarkMode ? '#ffffff' : '#000000',
  },
  emojiSelector: {
    marginBottom: 24,
  },
  emojiSelectorLabel: {
    fontSize: 16,
    color: isDarkMode ? '#ffffff' : '#000000',
    marginBottom: 12,
    fontWeight: '600',
  },
  emojiScroll: {
    marginBottom: 8,
  },
  emojiOption: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  emojiOptionSelected: {
    backgroundColor: '#FF6B9D',
  },
  emojiOptionText: {
    fontSize: 20,
  },
  nameInputContainer: {
    marginBottom: 24,
  },
  nameInputLabel: {
    fontSize: 16,
    color: isDarkMode ? '#ffffff' : '#000000',
    marginBottom: 12,
    fontWeight: '600',
  },
  nameInput: {
    borderWidth: 2,
    borderColor: isDarkMode ? '#333333' : '#dddddd',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: isDarkMode ? '#ffffff' : '#000000',
    backgroundColor: isDarkMode ? '#1a1a1a' : '#f8f8f8',
  },
  selectedItemsInfo: {
    marginBottom: 32,
  },
  selectedItemsText: {
    fontSize: 14,
    color: isDarkMode ? '#888888' : '#666666',
    textAlign: 'center',
  },
  createButton: {
    backgroundColor: '#FF6B9D',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  createButtonDisabled: {
    backgroundColor: isDarkMode ? '#333333' : '#cccccc',
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 80,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: isDarkMode ? '#ffffff' : '#000000',
    marginTop: 24,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: isDarkMode ? '#888888' : '#666666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  browseButton: {
    backgroundColor: '#FF6B9D',
    borderRadius: 12,
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  browseButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  // Preview Modal Styles
  previewContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: {
    width: width,
    height: '100%',
  },
  previewOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
  },
  previewTopControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  previewButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  previewCounter: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  previewCounterText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  previewArrow: {
    position: 'absolute',
    top: '50%',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -30,
  },
  previewArrowLeft: {
    left: 20,
  },
  previewArrowRight: {
    right: 20,
  },
  previewArrowText: {
    color: 'white',
    fontSize: 30,
    fontWeight: 'bold',
  },
  previewBottomControls: {
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 20,
  },
  previewInfo: {
    marginBottom: 20,
  },
  previewTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  previewRating: {
    fontSize: 16,
    color: '#FFD700',
    marginBottom: 4,
  },
  previewEpisodes: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 8,
  },
  previewSynopsis: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 20,
  },
  setWallpaperButton: {
    backgroundColor: '#FF6B9D',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  setWallpaperText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

const FavoritesScreen: React.FC = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const [favorites, setFavorites] = useState<FavoriteAnime[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [currentView, setCurrentView] = useState<'all' | 'collections'>('all');
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'recent' | 'name' | 'rating'>('recent');
  const [isCreatingCollection, setIsCreatingCollection] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('📱');
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [previewFavorites, setPreviewFavorites] = useState<FavoriteAnime[]>([]);

  const emojis = ['📱', '⭐', '🎌', '🌸', '🔥', '💜', '🌟', '🎯', '🎪', '🎨', '🌈', '🎭'];
  const styles = createStyles(isDarkMode);

  useEffect(() => {
    loadFavorites();
    loadCollections();
  }, []);

  const loadFavorites = async () => {
    try {
      const stored = await AsyncStorage.getItem('anime_favorites');
      if (stored) {
        setFavorites(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const loadCollections = async () => {
    try {
      const stored = await AsyncStorage.getItem('anime_collections');
      if (stored) {
        setCollections(JSON.parse(stored));
      } else {
        // Create default collections
        const defaultCollections: Collection[] = [
          {
            id: 'watched',
            name: 'Watched',
            emoji: '✅',
            animeIds: [],
            dateCreated: new Date().toISOString(),
          },
          {
            id: 'want-to-watch',
            name: 'Want to Watch',
            emoji: '🎯',
            animeIds: [],
            dateCreated: new Date().toISOString(),
          },
        ];
        setCollections(defaultCollections);
        await AsyncStorage.setItem('anime_collections', JSON.stringify(defaultCollections));
      }
    } catch (error) {
      console.error('Error loading collections:', error);
    }
  };

  const createCollection = async () => {
    if (!newCollectionName.trim()) return;

    const newCollection: Collection = {
      id: Date.now().toString(),
      name: newCollectionName.trim(),
      emoji: selectedEmoji,
      animeIds: selectedItems,
      dateCreated: new Date().toISOString(),
    };

    const updatedCollections = [...collections, newCollection];
    setCollections(updatedCollections);
    
    try {
      await AsyncStorage.setItem('anime_collections', JSON.stringify(updatedCollections));
    } catch (error) {
      console.error('Error saving collection:', error);
    }

    setNewCollectionName('');
    setSelectedEmoji('📱');
    setIsCreatingCollection(false);
    setSelectedItems([]);
    setIsSelectionMode(false);
  };

  const getSortedFavorites = () => {
    let sortedFavorites = [...favorites];
    
    // Filter by collection if selected
    if (selectedCollection && selectedCollection !== 'all') {
      const collection = collections.find(c => c.id === selectedCollection);
      if (collection) {
        sortedFavorites = sortedFavorites.filter(fav => collection.animeIds.includes(fav.id));
      }
    }
    
    // Sort
    switch (sortBy) {
      case 'name':
        sortedFavorites.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'rating':
        sortedFavorites.sort((a, b) => {
          const ratingA = parseFloat(a.rating || '0');
          const ratingB = parseFloat(b.rating || '0');
          return ratingB - ratingA;
        });
        break;
      case 'recent':
      default:
        sortedFavorites.sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime());
        break;
    }
    
    return sortedFavorites;
  };

  const toggleSelection = (id: number) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(item => item !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  const removeSelected = () => {
    Alert.alert(
      'Remove Favorites',
      `Remove ${selectedItems.length} item(s) from favorites?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            const updatedFavorites = favorites.filter(item => !selectedItems.includes(item.id));
            setFavorites(updatedFavorites);
            
            try {
              await AsyncStorage.setItem('anime_favorites', JSON.stringify(updatedFavorites));
            } catch (error) {
              console.error('Error removing favorites:', error);
            }
            
            setSelectedItems([]);
            setIsSelectionMode(false);
          },
        },
      ]
    );
  };

  const addToCollection = (collectionId: string) => {
    const updatedCollections = collections.map(collection => {
      if (collection.id === collectionId) {
        const newAnimeIds = [...collection.animeIds];
        selectedItems.forEach(itemId => {
          if (!newAnimeIds.includes(itemId)) {
            newAnimeIds.push(itemId);
          }
        });
        return { ...collection, animeIds: newAnimeIds };
      }
      return collection;
    });
    
    setCollections(updatedCollections);
    AsyncStorage.setItem('anime_collections', JSON.stringify(updatedCollections));
    setSelectedItems([]);
    setIsSelectionMode(false);
  };

  const openPreview = (anime: FavoriteAnime) => {
    const sortedFavs = getSortedFavorites();
    const index = sortedFavs.findIndex(fav => fav.id === anime.id);
    setPreviewFavorites(sortedFavs);
    setPreviewIndex(index);
    setPreviewVisible(true);
  };

  const closePreview = () => {
    setPreviewVisible(false);
    setPreviewIndex(0);
    setPreviewFavorites([]);
  };

  const navigatePreview = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && previewIndex > 0) {
      setPreviewIndex(previewIndex - 1);
    } else if (direction === 'next' && previewIndex < previewFavorites.length - 1) {
      setPreviewIndex(previewIndex + 1);
    }
  };

  const setAsWallpaper = () => {
    const currentAnime = previewFavorites[previewIndex];
    Alert.alert(
      'Set Wallpaper',
      `Set "${currentAnime.title}" as wallpaper?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Set Wallpaper',
          onPress: () => {
            // Here you would implement actual wallpaper setting
            Alert.alert('Success!', 'Wallpaper set successfully!');
            closePreview();
          },
        },
      ]
    );
  };

  const shareWallpaper = () => {
    const currentAnime = previewFavorites[previewIndex];
    Alert.alert(
      'Share',
      `Share "${currentAnime.title}" wallpaper?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Share',
          onPress: () => {
            // Here you would implement sharing functionality
            Alert.alert('Shared!', 'Wallpaper shared successfully!');
          },
        },
      ]
    );
  };

  const renderFavorite = (item: FavoriteAnime) => (
    <TouchableOpacity
      key={item.id}
      style={[
        styles.favoriteItem,
        selectedItems.includes(item.id) && styles.favoriteItemSelected,
      ]}
      onPress={() => {
        if (isSelectionMode) {
          toggleSelection(item.id);
        } else {
          // Open preview modal
          openPreview(item);
        }
      }}
      onLongPress={() => {
        if (!isSelectionMode) {
          setIsSelectionMode(true);
          toggleSelection(item.id);
        }
      }}
    >
      <Image
        source={{ uri: item.imageUrl }}
        style={styles.favoriteImage}
        resizeMode="cover"
      />
      
      {isSelectionMode && (
        <View style={styles.selectionOverlay}>
          <View style={[
            styles.selectionCheckbox,
            selectedItems.includes(item.id) && styles.selectionCheckboxSelected,
          ]}>
            {selectedItems.includes(item.id) && (
              <Text style={styles.checkmark}>✓</Text>
            )}
          </View>
        </View>
      )}
      
      <View style={styles.favoriteOverlay}>
        <View style={styles.favoriteInfo}>
          <Text style={styles.favoriteTitle}>{item.title}</Text>
          {item.rating && (
            <Text style={styles.favoriteRating}>⭐ {item.rating}/10</Text>
          )}
          {item.episodes && (
            <Text style={styles.favoriteEpisodes}>📺 {item.episodes} episodes</Text>
          )}
          <Text style={styles.favoriteDate}>Added {new Date(item.dateAdded).toLocaleDateString()}</Text>
        </View>
        
        {!isSelectionMode && (
          <View style={styles.favoriteActions}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => openPreview(item)}
            >
              <Text style={styles.actionEmoji}>�️</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionEmoji}>🔗</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const sortedFavorites = getSortedFavorites();

  if (isCreatingCollection) {
    return (
      <View style={styles.container}>
        <View style={styles.createCollectionContainer}>
          <View style={styles.createCollectionHeader}>
            <Text style={styles.createCollectionTitle}>Create Collection</Text>
            <TouchableOpacity
              onPress={() => {
                setIsCreatingCollection(false);
                setNewCollectionName('');
                setSelectedEmoji('📱');
              }}
            >
              <Text style={styles.cancelButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.emojiSelector}>
            <Text style={styles.emojiSelectorLabel}>Choose an emoji:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.emojiScroll}>
              {emojis.map((emoji) => (
                <TouchableOpacity
                  key={emoji}
                  style={[
                    styles.emojiOption,
                    selectedEmoji === emoji && styles.emojiOptionSelected,
                  ]}
                  onPress={() => setSelectedEmoji(emoji)}
                >
                  <Text style={styles.emojiOptionText}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.nameInputContainer}>
            <Text style={styles.nameInputLabel}>Collection name:</Text>
            <TextInput
              style={styles.nameInput}
              value={newCollectionName}
              onChangeText={setNewCollectionName}
              placeholder="Enter collection name..."
              placeholderTextColor={isDarkMode ? '#666666' : '#999999'}
              autoFocus
            />
          </View>

          <View style={styles.selectedItemsInfo}>
            <Text style={styles.selectedItemsText}>
              {selectedItems.length} anime will be added to this collection
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.createButton, !newCollectionName.trim() && styles.createButtonDisabled]}
            onPress={createCollection}
            disabled={!newCollectionName.trim()}
          >
            <Text style={styles.createButtonText}>Create Collection</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (favorites.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>💔</Text>
          <Text style={styles.emptyTitle}>No Favorites Yet</Text>
          <Text style={styles.emptySubtitle}>
            Browse anime and tap the heart icon to add them to your favorites
          </Text>
          <TouchableOpacity style={styles.browseButton}>
            <Text style={styles.browseButtonText}>Browse Anime</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>
            {isSelectionMode ? `${selectedItems.length} Selected` : 'My Favorites'}
          </Text>
          <Text style={styles.subtitle}>
            {isSelectionMode ? 'Tap items to select/deselect' : `${sortedFavorites.length} anime saved`}
          </Text>
        </View>
        
        <View style={styles.headerActions}>
          {isSelectionMode ? (
            <>
              <TouchableOpacity 
                style={styles.headerButton}
                onPress={() => {
                  setSelectedItems([]);
                  setIsSelectionMode(false);
                }}
              >
                <Text style={styles.headerButtonText}>✕</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.headerButton}
                onPress={() => setIsCreatingCollection(true)}
              >
                <Text style={styles.headerButtonText}>📁</Text>
              </TouchableOpacity>
              
              {selectedItems.length > 0 && (
                <TouchableOpacity style={styles.deleteButton} onPress={removeSelected}>
                  <Text style={styles.deleteButtonText}>🗑️</Text>
                </TouchableOpacity>
              )}
            </>
          ) : (
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => setIsSelectionMode(true)}
            >
              <Text style={styles.headerButtonText}>☑️</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Collections Tabs */}
      {collections.length > 0 && !isSelectionMode && (
        <View style={styles.collectionsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              style={[
                styles.collectionTab,
                (!selectedCollection || selectedCollection === 'all') && styles.collectionTabActive,
              ]}
              onPress={() => setSelectedCollection('all')}
            >
              <Text style={styles.collectionTabEmoji}>📚</Text>
              <Text style={[
                styles.collectionTabText,
                (!selectedCollection || selectedCollection === 'all') && styles.collectionTabTextActive,
              ]}>All</Text>
            </TouchableOpacity>
            
            {collections.map((collection) => (
              <TouchableOpacity
                key={collection.id}
                style={[
                  styles.collectionTab,
                  selectedCollection === collection.id && styles.collectionTabActive,
                ]}
                onPress={() => setSelectedCollection(collection.id)}
              >
                <Text style={styles.collectionTabEmoji}>{collection.emoji}</Text>
                <Text style={[
                  styles.collectionTabText,
                  selectedCollection === collection.id && styles.collectionTabTextActive,
                ]}>{collection.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Sort Options */}
      {!isSelectionMode && (
        <View style={styles.sortContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              style={[styles.sortButton, sortBy === 'recent' && styles.sortButtonActive]}
              onPress={() => setSortBy('recent')}
            >
              <Text style={styles.sortEmoji}>🕒</Text>
              <Text style={[styles.sortText, sortBy === 'recent' && styles.sortTextActive]}>Recent</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sortButton, sortBy === 'name' && styles.sortButtonActive]}
              onPress={() => setSortBy('name')}
            >
              <Text style={styles.sortEmoji}>🔤</Text>
              <Text style={[styles.sortText, sortBy === 'name' && styles.sortTextActive]}>Name</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sortButton, sortBy === 'rating' && styles.sortButtonActive]}
              onPress={() => setSortBy('rating')}
            >
              <Text style={styles.sortEmoji}>⭐</Text>
              <Text style={[styles.sortText, sortBy === 'rating' && styles.sortTextActive]}>Rating</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}

      {/* Favorites Grid */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.favoritesContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.favoritesGrid}>
          {sortedFavorites.map(renderFavorite)}
        </View>
      </ScrollView>
    </View>
  );

  const renderPreviewModal = () => {
    if (!previewVisible || previewFavorites.length === 0) return null;
    
    const currentAnime = previewFavorites[previewIndex];
    
    return (
      <Modal
        visible={previewVisible}
        transparent={false}
        animationType="fade"
        onRequestClose={closePreview}
      >
        <StatusBar hidden />
        <View style={styles.previewContainer}>
          <Image
            source={{ uri: currentAnime.imageUrl }}
            style={styles.previewImage}
            resizeMode="contain"
          />
          
          {/* Preview Overlay */}
          <View style={styles.previewOverlay}>
            {/* Top Controls */}
            <View style={styles.previewTopControls}>
              <TouchableOpacity 
                style={styles.previewButton}
                onPress={closePreview}
              >
                <Text style={styles.previewButtonText}>✕</Text>
              </TouchableOpacity>
              
              <View style={styles.previewCounter}>
                <Text style={styles.previewCounterText}>
                  {previewIndex + 1} / {previewFavorites.length}
                </Text>
              </View>
              
              <TouchableOpacity 
                style={styles.previewButton}
                onPress={shareWallpaper}
              >
                <Text style={styles.previewButtonText}>🔗</Text>
              </TouchableOpacity>
            </View>
            
            {/* Navigation Arrows */}
            {previewIndex > 0 && (
              <TouchableOpacity
                style={[styles.previewArrow, styles.previewArrowLeft]}
                onPress={() => navigatePreview('prev')}
              >
                <Text style={styles.previewArrowText}>‹</Text>
              </TouchableOpacity>
            )}
            
            {previewIndex < previewFavorites.length - 1 && (
              <TouchableOpacity
                style={[styles.previewArrow, styles.previewArrowRight]}
                onPress={() => navigatePreview('next')}
              >
                <Text style={styles.previewArrowText}>›</Text>
              </TouchableOpacity>
            )}
            
            {/* Bottom Info */}
            <View style={styles.previewBottomControls}>
              <View style={styles.previewInfo}>
                <Text style={styles.previewTitle}>{currentAnime.title}</Text>
                {currentAnime.rating && (
                  <Text style={styles.previewRating}>⭐ {currentAnime.rating}/10</Text>
                )}
                {currentAnime.episodes && (
                  <Text style={styles.previewEpisodes}>📺 {currentAnime.episodes} episodes</Text>
                )}
                {currentAnime.synopsis && (
                  <Text style={styles.previewSynopsis} numberOfLines={3}>
                    {currentAnime.synopsis}
                  </Text>
                )}
              </View>
              
              <TouchableOpacity
                style={styles.setWallpaperButton}
                onPress={setAsWallpaper}
              >
                <Text style={styles.setWallpaperText}>📱 Set as Wallpaper</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <>
      {renderPreviewModal()}
      {/* Rest of component content goes here */}
      {isCreatingCollection ? (
        <View style={styles.container}>
          <View style={styles.createCollectionContainer}>
            <View style={styles.createCollectionHeader}>
              <Text style={styles.createCollectionTitle}>Create Collection</Text>
              <TouchableOpacity
                onPress={() => {
                  setIsCreatingCollection(false);
                  setNewCollectionName('');
                  setSelectedEmoji('📱');
                }}
              >
                <Text style={styles.cancelButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.emojiSelector}>
              <Text style={styles.emojiSelectorLabel}>Choose an emoji:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.emojiScroll}>
                {emojis.map((emoji) => (
                  <TouchableOpacity
                    key={emoji}
                    style={[
                      styles.emojiOption,
                      selectedEmoji === emoji && styles.emojiOptionSelected,
                    ]}
                    onPress={() => setSelectedEmoji(emoji)}
                  >
                    <Text style={styles.emojiOptionText}>{emoji}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.nameInputContainer}>
              <Text style={styles.nameInputLabel}>Collection name:</Text>
              <TextInput
                style={styles.nameInput}
                value={newCollectionName}
                onChangeText={setNewCollectionName}
                placeholder="Enter collection name..."
                placeholderTextColor={isDarkMode ? '#666666' : '#999999'}
                autoFocus
              />
            </View>

            <View style={styles.selectedItemsInfo}>
              <Text style={styles.selectedItemsText}>
                {selectedItems.length} anime will be added to this collection
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.createButton, !newCollectionName.trim() && styles.createButtonDisabled]}
              onPress={createCollection}
              disabled={!newCollectionName.trim()}
            >
              <Text style={styles.createButtonText}>Create Collection</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : favorites.length === 0 ? (
        <View style={styles.container}>
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>💔</Text>
            <Text style={styles.emptyTitle}>No Favorites Yet</Text>
            <Text style={styles.emptySubtitle}>
              Browse anime and tap the heart icon to add them to your favorites
            </Text>
            <TouchableOpacity style={styles.browseButton}>
              <Text style={styles.browseButtonText}>Browse Anime</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.container}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>
                {isSelectionMode ? `${selectedItems.length} Selected` : 'My Favorites'}
              </Text>
              <Text style={styles.subtitle}>
                {isSelectionMode ? 'Tap items to select/deselect' : `${sortedFavorites.length} anime saved`}
              </Text>
            </View>
            
            <View style={styles.headerActions}>
              {isSelectionMode ? (
                <>
                  <TouchableOpacity 
                    style={styles.headerButton}
                    onPress={() => {
                      setSelectedItems([]);
                      setIsSelectionMode(false);
                    }}
                  >
                    <Text style={styles.headerButtonText}>✕</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.headerButton}
                    onPress={() => setIsCreatingCollection(true)}
                  >
                    <Text style={styles.headerButtonText}>📁</Text>
                  </TouchableOpacity>
                  
                  {selectedItems.length > 0 && (
                    <TouchableOpacity style={styles.deleteButton} onPress={removeSelected}>
                      <Text style={styles.deleteButtonText}>🗑️</Text>
                    </TouchableOpacity>
                  )}
                </>
              ) : (
                <TouchableOpacity 
                  style={styles.headerButton}
                  onPress={() => setIsSelectionMode(true)}
                >
                  <Text style={styles.headerButtonText}>☑️</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {collections.length > 0 && !isSelectionMode && (
            <View style={styles.collectionsContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <TouchableOpacity
                  style={[
                    styles.collectionTab,
                    (!selectedCollection || selectedCollection === 'all') && styles.collectionTabActive,
                  ]}
                  onPress={() => setSelectedCollection('all')}
                >
                  <Text style={styles.collectionTabEmoji}>📚</Text>
                  <Text style={[
                    styles.collectionTabText,
                    (!selectedCollection || selectedCollection === 'all') && styles.collectionTabTextActive,
                  ]}>All</Text>
                </TouchableOpacity>
                
                {collections.map((collection) => (
                  <TouchableOpacity
                    key={collection.id}
                    style={[
                      styles.collectionTab,
                      selectedCollection === collection.id && styles.collectionTabActive,
                    ]}
                    onPress={() => setSelectedCollection(collection.id)}
                  >
                    <Text style={styles.collectionTabEmoji}>{collection.emoji}</Text>
                    <Text style={[
                      styles.collectionTabText,
                      selectedCollection === collection.id && styles.collectionTabTextActive,
                    ]}>{collection.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {!isSelectionMode && (
            <View style={styles.sortContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <TouchableOpacity
                  style={[styles.sortButton, sortBy === 'recent' && styles.sortButtonActive]}
                  onPress={() => setSortBy('recent')}
                >
                  <Text style={styles.sortEmoji}>🕒</Text>
                  <Text style={[styles.sortText, sortBy === 'recent' && styles.sortTextActive]}>Recent</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.sortButton, sortBy === 'name' && styles.sortButtonActive]}
                  onPress={() => setSortBy('name')}
                >
                  <Text style={styles.sortEmoji}>🔤</Text>
                  <Text style={[styles.sortText, sortBy === 'name' && styles.sortTextActive]}>Name</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.sortButton, sortBy === 'rating' && styles.sortButtonActive]}
                  onPress={() => setSortBy('rating')}
                >
                  <Text style={styles.sortEmoji}>⭐</Text>
                  <Text style={[styles.sortText, sortBy === 'rating' && styles.sortTextActive]}>Rating</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          )}

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.favoritesContainer}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.favoritesGrid}>
              {sortedFavorites.map(renderFavorite)}
            </View>
          </ScrollView>
        </View>
      )}
    </>
  );
};

export default FavoritesScreen;

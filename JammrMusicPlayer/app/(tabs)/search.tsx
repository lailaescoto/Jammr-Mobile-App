import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { sampleTracks } from '../../src/data/tracks';
import { audioPlayer } from '../../src/lib/player';

export default function SearchScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Filter tracks based on search query (shows all if empty)
  const filteredTracks = searchQuery 
    ? sampleTracks.filter(track => 
        track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        track.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
        track.album.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : sampleTracks; // Show all tracks when no search query

  const handleSearch = () => {
    if (searchQuery.trim() && !recentSearches.includes(searchQuery)) {
      setRecentSearches(prev => [searchQuery, ...prev].slice(0, 3));
    }
  };

  const handlePlayTrack = async (trackId: string) => {
    const track = sampleTracks.find(t => t.id === trackId);
    if (track) {
      await audioPlayer.loadTrack(track);
      await audioPlayer.play();
      router.push('/(tabs)/now-playing');
    }
  };

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search songs, artists, albums..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {/* All Songs / Search Results */}
      <FlatList
        data={filteredTracks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.trackItem}
            onPress={() => handlePlayTrack(item.id)}
          >
            <Image 
              source={{ uri: item.artwork }} 
              style={styles.trackImage}
            />
            <View style={styles.trackInfo}>
              <Text style={styles.trackTitle}>{item.title}</Text>
              <Text style={styles.trackSubtitle}>{item.artist} • {item.album}</Text>
            </View>
            <Ionicons name="play" size={24} color="#1DB954" />
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.resultsContainer}
        ListHeaderComponent={
          searchQuery.length === 0 && (
            <Text style={styles.sectionTitle}>All Songs</Text>
          )
        }
        ListEmptyComponent={
          searchQuery.length > 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No results found for "{searchQuery}"</Text>
            </View>
          )
        }
      />

      {/* Recent Searches (only shown when no search query) */}
      {searchQuery.length === 0 && recentSearches.length > 0 && (
        <View style={styles.recentSearchesContainer}>
          <Text style={styles.recentTitle}>Recent Searches</Text>
          {recentSearches.map((search, index) => (
            <TouchableOpacity
              key={index}
              style={styles.recentItem}
              onPress={() => setSearchQuery(search)}
            >
              <Ionicons name="time" size={16} color="#999" />
              <Text style={styles.recentText}>{search}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    paddingTop: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    color: 'white',
    fontSize: 16,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 16,
    marginBottom: 16,
  },
  resultsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  trackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  trackImage: {
    width: 50,
    height: 50,
    borderRadius: 4,
    marginRight: 16,
  },
  trackInfo: {
    flex: 1,
  },
  trackTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  trackSubtitle: {
    color: '#999',
    fontSize: 14,
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: '#999',
    fontSize: 16,
  },
  recentSearchesContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  recentTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  recentText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 12,
  },
});
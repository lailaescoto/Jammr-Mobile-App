import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { audioPlayer } from '../../src/lib/player';
import { Track } from '../../src/types';

const { width } = Dimensions.get('window');

export default function LibraryScreen() {
  const [favorites, setFavorites] = useState<Track[]>([]);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = audioPlayer.subscribe((state) => {
      setFavorites(state.favorites || []);
    });

    // Get initial favorites
    setFavorites(audioPlayer.getFavorites());

    return unsubscribe;
  }, []);

  const handleTrackSelect = (track: Track) => {
    audioPlayer.loadTrack(track);
    router.push('/(tabs)/now-playing');
  };

  const handleRemoveFavorite = (trackId: string) => {
    audioPlayer.removeFromFavorites(trackId);
  };

  const handleGoToSearch = () => {
    router.push('/(tabs)/search');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Library</Text>
        <Text style={styles.subtitle}>Your favorite songs</Text>
      </View>

      {/* Add More Songs Button */}
      <TouchableOpacity style={styles.addMoreButton} onPress={handleGoToSearch}>
        <Ionicons name="add-circle" size={24} color="#1DB954" />
        <Text style={styles.addMoreText}>Add More Songs</Text>
        <Ionicons name="chevron-forward" size={20} color="#999" />
      </TouchableOpacity>

      {/* Favorites List */}
      <View style={styles.favoritesContainer}>
        <Text style={styles.sectionTitle}>
          Favorites ({favorites.length})
        </Text>
        
        {favorites.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="heart-outline" size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>No favorites yet</Text>
            <Text style={styles.emptySubtitle}>
              Start building your music library by adding songs to favorites
            </Text>
            <TouchableOpacity style={styles.emptyStateButton} onPress={handleGoToSearch}>
              <Text style={styles.emptyStateButtonText}>Discover Music</Text>
            </TouchableOpacity>
          </View>
        ) : (
          favorites.map((track) => (
            <TouchableOpacity
              key={track.id}
              style={styles.trackItem}
              onPress={() => handleTrackSelect(track)}
            >
              <View style={styles.trackItemLeft}>
                <View style={styles.trackNumber}>
                  <Text style={styles.trackNumberText}>
                    {favorites.findIndex(t => t.id === track.id) + 1}
                  </Text>
                </View>
                <View style={styles.trackInfo}>
                  <Text style={styles.trackTitle} numberOfLines={1}>
                    {track.title}
                  </Text>
                  <Text style={styles.trackArtist} numberOfLines={1}>
                    {track.artist}
                  </Text>
                </View>
              </View>
              
              <View style={styles.trackItemRight}>
                <Text style={styles.trackDuration}>
                  {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}
                </Text>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handleRemoveFavorite(track.id)}
                >
                  <Ionicons name="heart" size={20} color="#1DB954" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  contentContainer: {
    paddingBottom: 20,
  },
  header: {
    padding: 20,
    paddingTop: 40,
    backgroundColor: 'black',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  addMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'black',
    margin: 20,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  addMoreText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  favoritesContainer: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  emptyStateButton: {
    backgroundColor: '#1DB954',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  emptyStateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  trackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'black',
    marginBottom: 8,
    borderRadius: 8,
    borderColor: '#e9ecef',
    borderWidth: 1,
  },
  trackItemLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  trackNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e9ecef',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  trackNumberText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  trackInfo: {
    flex: 1,
  },
  trackTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  trackArtist: {
    fontSize: 14,
    color: '#666',
  },
  trackItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trackDuration: {
    fontSize: 14,
    color: '#999',
    marginRight: 12,
  },
  removeButton: {
    padding: 4,
  },
});

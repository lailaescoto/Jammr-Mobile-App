import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { sampleTracks } from '../../src/data/tracks';
import { audioPlayer } from '../../src/lib/player';

export default function PlaylistsScreen() {
  const router = useRouter();
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);

  const playlists = [
    {
      id: '1',
      name: 'Workout Mix',
      coverImage: sampleTracks[0].artwork,
      tracks: [sampleTracks[0].id, sampleTracks[1].id, sampleTracks[2].id]
    },
    {
      id: '2',
      name: 'Chill Vibes',
      coverImage: sampleTracks[3].artwork,
      tracks: [sampleTracks[3].id, sampleTracks[4].id]
    }
  ];

  const recentlyPlayed = sampleTracks.slice(0, 2); // Last 2 played tracks

  const handlePlaylistPress = (playlist) => {
    setSelectedPlaylist(playlist);
  };

  const handleTrackPress = async (trackId) => {
    const track = sampleTracks.find(t => t.id === trackId);
    await audioPlayer.loadTrack(track);
    await audioPlayer.play();
    router.push('/(tabs)/now-playing');
  };

  if (selectedPlaylist) {
    const playlistTracks = sampleTracks.filter(track => 
      selectedPlaylist.tracks.includes(track.id)
    );

    return (
      <ScrollView style={styles.container}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => setSelectedPlaylist(null)}
        >
          <Ionicons name="arrow-back" size={24} color="#1DB954" />
          <Text style={styles.backText}>Back to Playlists</Text>
        </TouchableOpacity>

        <View style={styles.playlistHeader}>
          <Image 
            source={{ uri: selectedPlaylist.coverImage }} 
            style={styles.playlistCoverLarge}
          />
          <Text style={styles.playlistTitle}>{selectedPlaylist.name}</Text>
          <Text style={styles.playlistSubtitle}>
            {playlistTracks.length} song{playlistTracks.length !== 1 ? 's' : ''}
          </Text>
        </View>

        <FlatList
          data={playlistTracks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.trackItem}
              onPress={() => handleTrackPress(item.id)}
            >
              <Image 
                source={{ uri: item.artwork }} 
                style={styles.trackImage}
              />
              <View style={styles.trackInfo}>
                <Text style={styles.trackTitle}>{item.title}</Text>
                <Text style={styles.trackArtist}>{item.artist}</Text>
              </View>
              <Ionicons name="play" size={24} color="#1DB954" />
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.listContent}
        />
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Welcome Section */}
      <View style={styles.welcomeContainer}>
        <Text style={styles.welcomeText}>Welcome back!</Text>
        <Text style={styles.subtitle}>Ready to listen to your favorite tunes?</Text>
      </View>

      {/* Playlists Section */}
      <Text style={styles.sectionTitle}>Your Playlists</Text>
      <FlatList
        horizontal
        data={playlists}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.playlistItem}
            onPress={() => handlePlaylistPress(item)}
          >
            <Image 
              source={{ uri: item.coverImage }} 
              style={styles.playlistCover}
            />
            <Text style={styles.playlistName}>{item.name}</Text>
            <Text style={styles.playlistInfo}>
              {item.tracks.length} song{item.tracks.length !== 1 ? 's' : ''}
            </Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.playlistList}
        showsHorizontalScrollIndicator={false}
      />

      {/* Recently Played Section */}
      <Text style={styles.sectionTitle}>Recently Played</Text>
      <FlatList
        horizontal
        data={recentlyPlayed}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.recentItem}
            onPress={() => handleTrackPress(item.id)}
          >
            <Image 
              source={{ uri: item.artwork }} 
              style={styles.recentCover}
            />
            <Text style={styles.recentTitle}>{item.title}</Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.recentList}
        showsHorizontalScrollIndicator={false}
      />

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => router.push('/(tabs)/search')}
        >
          <Ionicons name="search" size={20} color="#1DB954" />
          <Text style={styles.actionText}>Search Songs</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => router.push('/(tabs)/now-playing')}
        >
          <Ionicons name="musical-notes" size={20} color="#1DB954" />
          <Text style={styles.actionText}>Now Playing</Text>
        </TouchableOpacity>
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
    padding: 16,
    paddingBottom: 32,
  },
  welcomeContainer: {
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  welcomeText: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    color: '#999',
    fontSize: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  backText: {
    color: '#1DB954',
    fontSize: 16,
    marginLeft: 8,
  },
  playlistHeader: {
    alignItems: 'center',
    padding: 20,
  },
  playlistCoverLarge: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginBottom: 16,
  },
  playlistTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  playlistSubtitle: {
    color: '#999',
    fontSize: 16,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    marginTop: 24,
  },
  playlistList: {
    paddingLeft: 8,
  },
  playlistItem: {
    width: 160,
    marginRight: 16,
  },
  playlistCover: {
    width: 160,
    height: 160,
    borderRadius: 8,
    marginBottom: 8,
  },
  playlistName: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  playlistInfo: {
    color: '#999',
    fontSize: 14,
  },
  listContent: {
    padding: 16,
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
  trackArtist: {
    color: '#999',
    fontSize: 14,
  },
  recentList: {
    paddingLeft: 8,
  },
  recentItem: {
    width: 120,
    marginRight: 16,
  },
  recentCover: {
    width: 120,
    height: 120,
    borderRadius: 8,
    marginBottom: 8,
  },
  recentTitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  actionButton: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 16,
    width: '48%',
    alignItems: 'center',
  },
  actionText: {
    color: '#1DB954',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
});
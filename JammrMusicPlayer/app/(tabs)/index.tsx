import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { sampleTracks } from '../../src/data/tracks';
import { audioPlayer } from '../../src/lib/player';

export default function HomeScreen() {
  const router = useRouter();
  
  // Featured playlists
  const featuredPlaylists = [
    {
      id: '1',
      name: 'Recently Played',
      coverImage: sampleTracks[0].artwork,
      tracks: [sampleTracks[0], sampleTracks[1], sampleTracks[2]]
    },
    {
      id: '2',
      name: 'Top Picks',
      coverImage: sampleTracks[3].artwork,
      tracks: [sampleTracks[3], sampleTracks[4]]
    }
  ];

  // Recently added albums
  const recentlyAdded = sampleTracks.slice(0, 3);

  const handlePlayTrack = async (trackId: string) => {
    const track = sampleTracks.find(t => t.id === trackId);
    if (track) {
      await audioPlayer.loadTrack(track);
      await audioPlayer.play();
      router.push('/(tabs)/now-playing');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Welcome Header */}
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome back</Text>
        <Text style={styles.title}>Your Library</Text>
      </View>

      {/* Featured Playlists */}
      <Text style={styles.sectionTitle}>Featured Playlists</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {featuredPlaylists.map((playlist) => (
          <TouchableOpacity 
            key={playlist.id}
            style={styles.playlistCard}
            onPress={() => router.push({
              pathname: '/playlist-detail',
              params: { 
                playlistId: playlist.id,
                playlistName: playlist.name,
                trackIds: JSON.stringify(playlist.tracks.map(t => t.id))
              }
            })}
          >
            <Image 
              source={{ uri: playlist.coverImage }} 
              style={styles.playlistImage}
            />
            <Text style={styles.playlistName}>{playlist.name}</Text>
            <Text style={styles.playlistInfo}>{playlist.tracks.length} song{playlist.tracks.length !== 1 ? 's' : ''}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Recently Added */}
      <Text style={styles.sectionTitle}>Recently Added</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {recentlyAdded.map((track) => (
          <TouchableOpacity 
            key={track.id}
            style={styles.albumCard}
            onPress={() => handlePlayTrack(track.id)}
          >
            <Image 
              source={{ uri: track.artwork }} 
              style={styles.albumImage}
            />
            <Text style={styles.albumTitle}>{track.album}</Text>
            <Text style={styles.artistName}>{track.artist}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => router.push('/(tabs)/search')}
        >
          <Ionicons name="search" size={24} color="#1DB954" />
          <Text style={styles.actionText}>Search</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => router.push('/(tabs)/library')}
        >
          <Ionicons name="musical-notes" size={24} color="#1DB954" />
          <Text style={styles.actionText}>Your Library</Text>
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
  header: {
    marginBottom: 24,
  },
  welcomeText: {
    color: '#999',
    fontSize: 16,
    marginBottom: 4,
  },
  title: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
  },
  sectionTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    marginTop: 24,
  },
  playlistCard: {
    width: 160,
    marginRight: 16,
  },
  playlistImage: {
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
  albumCard: {
    width: 140,
    marginRight: 16,
  },
  albumImage: {
    width: 140,
    height: 140,
    borderRadius: 8,
    marginBottom: 8,
  },
  albumTitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  artistName: {
    color: '#999',
    fontSize: 12,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  actionButton: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 16,
    width: '48%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    color: '#1DB954',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
});
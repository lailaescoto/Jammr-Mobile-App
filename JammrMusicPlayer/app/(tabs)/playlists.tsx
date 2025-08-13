import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, Image, ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { sampleTracks } from '../../src/data/tracks';
import { audioPlayer } from '../../src/lib/player';

interface Playlist {
  id: string;
  name: string;
  coverImage?: string;
  tracks: string[]; // track IDs
}

export default function PlaylistsScreen() {
  const router = useRouter();
  
  // Playlists with only existing tracks
  const playlists: Playlist[] = [
    {
      id: '1',
      name: 'Favorites Mix',
      coverImage: sampleTracks[0].artwork,
      tracks: [sampleTracks[0].id, sampleTracks[1].id]
    },
    {
      id: '2',
      name: 'Chill Vibes',
      coverImage: sampleTracks[2].artwork,
      tracks: [sampleTracks[2].id, sampleTracks[3].id]
    },
    {
      id: '3',
      name: 'Workout Jams',
      coverImage: sampleTracks[4].artwork,
      tracks: [sampleTracks[4].id]
    },
    {
      id: '4',
      name: 'All Tracks',
      coverImage: sampleTracks[1].artwork,
      tracks: sampleTracks.map(t => t.id)
    }
  ];

  const recentlyAdded = sampleTracks.slice(0, 3);

  const handlePlaylistPress = async (playlist: Playlist) => {
    const firstTrack = sampleTracks.find(t => t.id === playlist.tracks[0]);
    if (firstTrack) {
      await audioPlayer.loadTrack(firstTrack);
      await audioPlayer.play();
      router.push('/(tabs)/now-playing');
    }
  };

  const handleTrackPress = async (trackId: string) => {
    const track = sampleTracks.find(t => t.id === trackId);
    if (track) {
      await audioPlayer.loadTrack(track);
      await audioPlayer.play();
      router.push('/(tabs)/now-playing');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
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
            <Text style={styles.playlistInfo}>{item.tracks.length} song{item.tracks.length !== 1 ? 's' : ''}</Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.playlistList}
        showsHorizontalScrollIndicator={false}
      />

      <Text style={[styles.sectionTitle, styles.recentlyAddedTitle]}>Recently Added</Text>
      <FlatList
        horizontal
        data={recentlyAdded}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.albumItem}
            onPress={() => handleTrackPress(item.id)}
          >
            <Image 
              source={{ uri: item.artwork }} 
              style={styles.albumCover}
            />
            <Text style={styles.albumTitle}>{item.album}</Text>
            <Text style={styles.artistName}>{item.artist}</Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.albumList}
        showsHorizontalScrollIndicator={false}
      />

      <TouchableOpacity 
        style={styles.createButton}
        onPress={() => router.push('/create-playlist')}
      >
        <Ionicons name="add" size={24} color="#1DB954" />
        <Text style={styles.createButtonText}>Create New Playlist</Text>
      </TouchableOpacity>
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 16,
    marginTop: 24,
    marginBottom: 16,
  },
  recentlyAddedTitle: {
    marginTop: 32,
  },
  playlistList: {
    paddingLeft: 16,
    paddingRight: 8,
  },
  playlistItem: {
    width: 150,
    marginRight: 16,
  },
  playlistCover: {
    width: 150,
    height: 150,
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
  albumList: {
    paddingLeft: 16,
    paddingRight: 8,
  },
  albumItem: {
    width: 150,
    marginRight: 16,
  },
  albumCover: {
    width: 150,
    height: 150,
    borderRadius: 8,
    marginBottom: 8,
  },
  albumTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  artistName: {
    color: '#999',
    fontSize: 14,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    marginTop: 32,
  },
  createButtonText: {
    color: '#1DB954',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
});
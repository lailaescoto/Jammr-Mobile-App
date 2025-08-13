import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { sampleTracks } from '../../src/data/tracks';
import { audioPlayer } from '../../src/lib/player';

export default function PlaylistsScreen() {
  const router = useRouter();

  // Define two playlists with your 5 songs
  const playlists = [
    {
      id: '1',
      name: 'Popular Mix',
      coverImage: sampleTracks[0].artwork,
      tracks: [sampleTracks[0], sampleTracks[1], sampleTracks[2]] // First 3 tracks
    },
    {
      id: '2',
      name: 'Chill Vibes',
      coverImage: sampleTracks[3].artwork,
      tracks: [sampleTracks[3], sampleTracks[4]] // Last 2 tracks
    }
  ];

  const [selectedPlaylist, setSelectedPlaylist] = React.useState<typeof playlists[0] | null>(null);

  const handlePlayTrack = async (track: typeof sampleTracks[0]) => {
    await audioPlayer.loadTrack(track);
    await audioPlayer.play();
    router.push('/(tabs)/now-playing');
  };

  if (selectedPlaylist) {
    // Show tracks in selected playlist
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
          <Text style={styles.playlistSubtitle}>{selectedPlaylist.tracks.length} songs</Text>
        </View>

        <FlatList
          data={selectedPlaylist.tracks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.trackItem}
              onPress={() => handlePlayTrack(item)}
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
          scrollEnabled={false}
        />
      </ScrollView>
    );
  }

  // Show playlist selection
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.sectionTitle}>Your Playlists</Text>
      
      <TouchableOpacity 
        style={styles.playlistItem}
        onPress={() => setSelectedPlaylist(playlists[0])}
      >
        <Image 
          source={{ uri: playlists[0].coverImage }} 
          style={styles.playlistCover}
        />
        <Text style={styles.playlistName}>{playlists[0].name}</Text>
        <Text style={styles.playlistInfo}>3 songs</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.playlistItem}
        onPress={() => setSelectedPlaylist(playlists[1])}
      >
        <Image 
          source={{ uri: playlists[1].coverImage }} 
          style={styles.playlistCover}
        />
        <Text style={styles.playlistName}>{playlists[1].name}</Text>
        <Text style={styles.playlistInfo}>2 songs</Text>
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
    padding: 16,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
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
  playlistItem: {
    marginBottom: 20,
  },
  playlistCover: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 8,
  },
  playlistName: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  playlistInfo: {
    color: '#999',
    fontSize: 14,
  },
  trackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
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
});
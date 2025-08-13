import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import React from 'react';
import { FlatList, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View, TextInput, Alert } from 'react-native';
import { sampleTracks } from '../../src/data/tracks';
import { audioPlayer } from '../../src/lib/player';
import { playlistManager, Playlist } from '../../src/lib/playlists';

export default function PlaylistsScreen() {
  const router = useRouter();

  const [playlists, setPlaylists] = React.useState<Playlist[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = React.useState<Playlist | null>(null);
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [newPlaylistName, setNewPlaylistName] = React.useState('');

  const refreshPlaylists = () => {
    setPlaylists(playlistManager.getAllPlaylists());
  };

  React.useEffect(() => {
    // Load playlists from the manager
    refreshPlaylists();
  }, []);

  // Refresh playlists when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      refreshPlaylists();
    }, [])
  );

  const handlePlayTrack = async (track: typeof sampleTracks[0], playlist: Playlist) => {
    await audioPlayer.loadTrack(track, playlist);
    await audioPlayer.play();
    router.push('/(tabs)/now-playing');
  };

  const handleCreatePlaylist = () => {
    if (newPlaylistName.trim()) {
      const newPlaylist = playlistManager.createPlaylist(newPlaylistName.trim());
      setPlaylists(playlistManager.getAllPlaylists());
      setNewPlaylistName('');
      setShowCreateModal(false);
      Alert.alert('Success', `Created playlist "${newPlaylist.name}"`);
    } else {
      Alert.alert('Error', 'Please enter a playlist name');
    }
  };

  const handleDeleteTrack = (trackId: string, playlist: Playlist) => {
    const track = playlist.tracks.find(t => t.id === trackId);
    if (!track) return;

    Alert.alert(
      'Remove Track',
      `Are you sure you want to remove "${track.title}" from "${playlist.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => {
            const success = playlistManager.removeTrackFromPlaylist(playlist.id, trackId);
            if (success) {
              // Refresh the selected playlist and all playlists
              setSelectedPlaylist(playlistManager.getPlaylistById(playlist.id));
              setPlaylists(playlistManager.getAllPlaylists());
              Alert.alert('Success', 'Track removed from playlist');
            } else {
              Alert.alert('Error', 'Failed to remove track from playlist');
            }
          }
        }
      ]
    );
  };

  const handleDeletePlaylist = (playlist: Playlist) => {
    Alert.alert(
      'Delete Playlist',
      `Are you sure you want to delete "${playlist.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            const success = playlistManager.deletePlaylist(playlist.id);
            if (success) {
              setPlaylists(playlistManager.getAllPlaylists());
              if (selectedPlaylist && selectedPlaylist.id === playlist.id) {
                setSelectedPlaylist(null);
              }
              Alert.alert('Success', 'Playlist deleted');
            } else {
              Alert.alert('Error', 'Failed to delete playlist');
            }
          }
        }
      ]
    );
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
          
          <TouchableOpacity 
            style={styles.deletePlaylistButton}
            onPress={() => handleDeletePlaylist(selectedPlaylist)}
          >
            <Ionicons name="trash-outline" size={20} color="#ff6b6b" />
            <Text style={styles.deletePlaylistText}>Delete Playlist</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={selectedPlaylist.tracks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.trackItem}
              onPress={() => handlePlayTrack(item, selectedPlaylist)}
            >
              <Image 
                source={{ uri: item.artwork }} 
                style={styles.trackImage}
              />
              <View style={styles.trackInfo}>
                <Text style={styles.trackTitle}>{item.title}</Text>
                <Text style={styles.trackArtist}>{item.artist}</Text>
              </View>
              <View style={styles.trackActions}>
                <TouchableOpacity
                  style={styles.deleteTrackButton}
                  onPress={() => handleDeleteTrack(item.id, selectedPlaylist)}
                >
                  <Ionicons name="trash-outline" size={18} color="#ff6b6b" />
                </TouchableOpacity>
                <Ionicons name="play" size={24} color="#1DB954" />
              </View>
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
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Your Playlists</Text>
        <TouchableOpacity 
          style={styles.createButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Ionicons name="add" size={20} color="#1DB954" />
        </TouchableOpacity>
      </View>
      
      {playlists.map((playlist) => (
        <TouchableOpacity 
          key={playlist.id}
          style={styles.playlistItem}
          onPress={() => setSelectedPlaylist(playlist)}
        >
          <Image 
            source={{ uri: playlist.coverImage || sampleTracks[0].artwork }} 
            style={styles.playlistCover}
          />
          <Text style={styles.playlistName}>{playlist.name}</Text>
          <Text style={styles.playlistInfo}>{playlist.tracks.length} songs</Text>
        </TouchableOpacity>
      ))}

      {/* Create Playlist Modal */}
      {showCreateModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New Playlist</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Playlist name"
              placeholderTextColor="#999"
              value={newPlaylistName}
              onChangeText={setNewPlaylistName}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowCreateModal(false);
                  setNewPlaylistName('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.createPlaylistButton]}
                onPress={handleCreatePlaylist}
              >
                <Text style={styles.createPlaylistButtonText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  createButton: {
    padding: 8,
  },
  createPlaylistButton: {
    backgroundColor: '#1DB954',
  },
  createPlaylistButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
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
  trackActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  deleteTrackButton: {
    padding: 5,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  modalContent: {
    backgroundColor: '#181818',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  textInput: {
    width: '100%',
    height: 50,
    backgroundColor: '#333',
    borderRadius: 8,
    paddingHorizontal: 15,
    color: 'white',
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  cancelButton: {
    backgroundColor: '#333',
    borderWidth: 1,
    borderColor: '#555',
  },
  cancelButtonText: {
    color: '#999',
    fontSize: 16,
  },
  deletePlaylistButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 15,
    backgroundColor: '#333',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ff6b6b',
  },
  deletePlaylistText: {
    color: '#ff6b6b',
    fontSize: 14,
    marginLeft: 8,
  },
});
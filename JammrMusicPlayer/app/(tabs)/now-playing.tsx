import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { Alert, Dimensions, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { audioPlayer } from '../../src/lib/player';
import { playlistManager, Playlist } from '../../src/lib/playlists';
import { Track } from '../../src/types';
import { sampleTracks } from '../../src/data/tracks';

const { width, height } = Dimensions.get('window');

export default function NowPlayingScreen() {
  const [currentTrack, setCurrentTrack] = useState(sampleTracks[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [favorites, setFavorites] = useState<Track[]>([]);
  const [currentPlaylist, setCurrentPlaylist] = useState<Playlist | null>(null);
  const [isPlayingFromPlaylist, setIsPlayingFromPlaylist] = useState(false);
  const [shuffleMode, setShuffleMode] = useState(false);
  const [repeatMode, setRepeatMode] = useState(false); // Simple boolean: true = repeat, false = no repeat
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [availablePlaylists, setAvailablePlaylists] = useState<Playlist[]>([]);

  useEffect(() => {
    const unsubscribe = audioPlayer.subscribe((state) => {
      setCurrentTrack(state.currentTrack || sampleTracks[0]);
      setIsPlaying(state.isPlaying);
      setCurrentTime(state.currentTime);
      setDuration(state.duration);
      setFavorites(state.favorites || []);
      setCurrentPlaylist(state.currentPlaylist || null);
      setIsPlayingFromPlaylist(state.isPlayingFromPlaylist || false);
      setShuffleMode(state.shuffleMode || false);
      setRepeatMode(state.repeatMode || false);
    });

    // Load first track by default
    audioPlayer.loadTrack(sampleTracks[0]);

    // Load available playlists
    setAvailablePlaylists(playlistManager.getAllPlaylists());

    return unsubscribe;
  }, []);

  // Refresh available playlists when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      const freshPlaylists = playlistManager.getAllPlaylists();
      console.log('Now-playing screen focused, refreshing playlists:', freshPlaylists.length, 'playlists found');
      setAvailablePlaylists(freshPlaylists);
    }, [])
  );

  const handlePlayPause = async () => {
    if (isPlaying) {
      await audioPlayer.pause();
    } else {
      await audioPlayer.play();
    }
  };

  const handleStop = async () => {
    await audioPlayer.stop();
  };

  const handleSeek = async (position: number) => {
    await audioPlayer.seekTo(position);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleTrackSelect = async (track: Track) => {
    if (isPlayingFromPlaylist && currentPlaylist) {
      await audioPlayer.loadTrack(track, currentPlaylist);
    } else {
      await audioPlayer.loadTrack(track);
    }
    await audioPlayer.play();
  };

  const handleNext = async () => {
    await audioPlayer.playNext();
  };

  const handlePrevious = async () => {
    await audioPlayer.playPrevious();
  };

  const handleToggleFavorite = () => {
    if (currentTrack) {
      if (audioPlayer.isFavorite(currentTrack.id)) {
        audioPlayer.removeFromFavorites(currentTrack.id);
      } else {
        audioPlayer.addToFavorites(currentTrack);
      }
    }
  };

  const handleToggleShuffle = () => {
    audioPlayer.toggleShuffle();
  };

  const handleToggleRepeat = () => {
    audioPlayer.toggleRepeat();
  };

  const handleAddToPlaylist = () => {
    // Refresh available playlists before showing modal to include newly created ones
    const freshPlaylists = playlistManager.getAllPlaylists();
    console.log('Refreshing playlists:', freshPlaylists.length, 'playlists found');
    console.log('Playlist names:', freshPlaylists.map(p => p.name));
    setAvailablePlaylists(freshPlaylists);
    setShowPlaylistModal(true);
  };

  const addTrackToPlaylist = (playlistId: string) => {
    if (currentTrack) {
      console.log('Adding track to playlist:', playlistId, 'Track:', currentTrack.title);
      const success = playlistManager.addTrackToPlaylist(playlistId, currentTrack);
      console.log('Add track result:', success);
      if (success) {
        Alert.alert('Success', `Added "${currentTrack.title}" to playlist`);
        setShowPlaylistModal(false);
        // Refresh available playlists to show updated track counts
        const updatedPlaylists = playlistManager.getAllPlaylists();
        console.log('Updated playlists after adding track:', updatedPlaylists.length);
        setAvailablePlaylists(updatedPlaylists);
      } else {
        Alert.alert('Error', 'Failed to add track to playlist');
      }
    }
  };

  const getRepeatIcon = () => {
    return repeatMode ? 'refresh' : 'repeat';
  };

  const getRepeatColor = () => {
    return repeatMode ? '#1DB954' : '#999';
  };

  const getCurrentContextTracks = () => {
    if (isPlayingFromPlaylist && currentPlaylist) {
      return currentPlaylist.tracks;
    } else {
      return favorites;
    }
  };

  const getCurrentContextName = () => {
    if (isPlayingFromPlaylist && currentPlaylist) {
      return currentPlaylist.name;
    } else {
      return 'Liked Songs';
    }
  };

  const getCurrentContextCount = () => {
    if (isPlayingFromPlaylist && currentPlaylist) {
      return currentPlaylist.tracks.length;
    } else {
      return favorites.length;
    }
  };


  if (!currentTrack) {
    return (
      <View style={styles.container}>
        <Text style={styles.noTrackText}>No track loaded</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {/* Album Art */}
        <View style={styles.albumArtContainer}>
          {currentTrack.artwork ? (
            <Image source={{ uri: currentTrack.artwork }} style={styles.albumArt} />
          ) : (
            <View style={styles.placeholderArtwork}>
              <Ionicons name="musical-notes" size={80} color="#1DB954" />
            </View>
          )}
        </View>

        {/* Track Info */}
        <View style={styles.trackInfo}>
          <Text style={styles.trackTitle}>{currentTrack.title}</Text>
          <Text style={styles.trackArtist}>{currentTrack.artist}</Text>
          <Text style={styles.trackAlbum}>{currentTrack.album}</Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${(currentTime / duration) * 100}%` }
              ]} 
            />
          </View>
          <View style={styles.timeInfo}>
            <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
            <Text style={styles.timeText}>{formatTime(duration)}</Text>
          </View>
        </View>

        {/* Main Controls */}
        <View style={styles.mainControls}>
          <TouchableOpacity style={styles.controlButton} onPress={handlePrevious}>
            <Ionicons name="play-skip-back" size={32} color="white" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.playButton} onPress={handlePlayPause}>
            <Ionicons 
              name={isPlaying ? 'pause' : 'play'} 
              size={40} 
              color="black" 
            />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.controlButton} onPress={handleNext}>
            <Ionicons name="play-skip-forward" size={32} color="white" />
          </TouchableOpacity>
        </View>

        {/* Secondary Controls */}
        <View style={styles.secondaryControls}>
          <TouchableOpacity 
            style={styles.secondaryButton} 
            onPress={handleToggleShuffle}
          >
            <Ionicons 
              name="shuffle" 
              size={24} 
              color={shuffleMode ? "#1DB954" : "#999"} 
            />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.secondaryButton} 
            onPress={handleToggleRepeat}
          >
            <Ionicons 
              name={getRepeatIcon()} 
              size={24} 
              color={getRepeatColor()} 
            />
            {repeatMode && (
              <Text style={styles.repeatIndicator}>ON</Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.secondaryButton} onPress={handleToggleFavorite}>
            <Ionicons 
              name={currentTrack && audioPlayer.isFavorite(currentTrack.id) ? "heart" : "heart-outline"} 
              size={24} 
              color={currentTrack && audioPlayer.isFavorite(currentTrack.id) ? "#1DB954" : "#999"} 
            />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.secondaryButton} 
            onPress={handleAddToPlaylist}
          >
            <Ionicons name="add" size={24} color="#999" />
          </TouchableOpacity>
        </View>

        {/* Controls Explanation */}
        <View style={styles.controlsExplanation}>
          <Text style={styles.explanationText}>
            {repeatMode ? "Repeat: Next/Previous will stay on current song" : "Shuffle: Random track selection"}
          </Text>
        </View>

        {/* Context Track List */}
        <View style={styles.trackListContainer}>
          {/* Context Header */}
          <View style={styles.contextHeader}>
            <View style={styles.contextHeaderLeft}>
              <Ionicons 
                name={isPlayingFromPlaylist ? "list" : "heart"} 
                size={20} 
                color="#1DB954" 
              />
              <Text style={styles.contextHeaderText}>
                {isPlayingFromPlaylist 
                  ? `Playing from: ${currentPlaylist?.name || 'Playlist'}`
                  : 'Playing from: Liked Songs'
                }
              </Text>
            </View>
            {isPlayingFromPlaylist && currentPlaylist && (
              <TouchableOpacity 
                style={styles.clearContextButton}
                onPress={() => {
                  if (currentTrack) {
                    audioPlayer.loadTrack(currentTrack); // Clear playlist context
                  }
                }}
              >
                <Ionicons name="close-circle" size={20} color="#999" />
              </TouchableOpacity>
            )}
          </View>
          
          <Text style={styles.sectionTitle}>
            {getCurrentContextName()} ({getCurrentContextCount()})
          </Text>
          {getCurrentContextCount() === 0 ? (
            <Text style={styles.emptyFavoritesText}>
              {isPlayingFromPlaylist 
                ? 'This playlist is empty.'
                : 'No favorites yet. Tap the heart button to add songs!'
              }
            </Text>
          ) : (
            getCurrentContextTracks().map((track) => (
              <TouchableOpacity
                key={track.id}
                style={[
                  styles.trackItem,
                  currentTrack.id === track.id && styles.activeTrackItem
                ]}
                onPress={() => handleTrackSelect(track)}
              >
                <View style={styles.trackItemInfo}>
                  <Text style={[
                    styles.trackItemTitle,
                    currentTrack.id === track.id && styles.activeTrackText
                  ]}>
                    {track.title}
                  </Text>
                  <Text style={[
                    styles.trackItemArtist,
                    currentTrack.id === track.id && styles.activeTrackText
                  ]}>
                    {track.artist}
                  </Text>
                </View>
                <Text style={
                  currentTrack.id === track.id 
                    ? styles.activeTrackDuration 
                    : styles.trackItemDuration
                }>
                  {formatTime(track.duration)}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      {/* Playlist Selection Modal */}
      <Modal
        visible={showPlaylistModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPlaylistModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add to Playlist</Text>
              <TouchableOpacity 
                onPress={() => setShowPlaylistModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#999" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.playlistList}>
              {availablePlaylists.map((playlist) => (
                <TouchableOpacity
                  key={playlist.id}
                  style={styles.playlistOption}
                  onPress={() => addTrackToPlaylist(playlist.id)}
                >
                  <View style={styles.playlistOptionInfo}>
                    <Text style={styles.playlistOptionName}>{playlist.name}</Text>
                    <Text style={styles.playlistOptionCount}>
                      {playlist.tracks.length} {playlist.tracks.length === 1 ? 'song' : 'songs'}
                    </Text>
                  </View>
                  <Ionicons name="add-circle" size={24} color="#1DB954" />
                </TouchableOpacity>
              ))}
              {availablePlaylists.length === 0 && (
                <Text style={styles.noPlaylistsText}>No playlists available</Text>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  contentContainer: {
    paddingBottom: 100,
  },
  albumArtContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 30,
  },
  albumArt: {
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: 20,
  },
  placeholderArtwork: {
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: 20,
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackInfo: {
    alignItems: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  trackTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  trackArtist: {
    fontSize: 18,
    color: '#1DB954',
    textAlign: 'center',
    marginBottom: 4,
  },
  trackAlbum: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  progressContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#333',
    borderRadius: 2,
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#1DB954',
    borderRadius: 2,
  },
  timeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeText: {
    color: '#999',
    fontSize: 14,
  },
  mainControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  controlButton: {
    padding: 20,
  },
  playButton: {
    backgroundColor: '#1DB954',
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 30,
  },
  secondaryControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 40,
    marginBottom: 40,
  },
  secondaryButton: {
    padding: 10,
    position: 'relative', 
  },
  trackListContainer: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 16,
  },
  trackItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    marginBottom: 8,
  },
   activeTrackText: {
    color: 'black',
  },
  activeTrackItem: {
    backgroundColor: '#1DB954',
  },
  trackItemInfo: {
    flex: 1,
  },
  trackItemTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  trackItemArtist: {
    color: '#999',
    fontSize: 14,
  },
  trackItemDuration: {
    color: '#999',
    fontSize: 14,
  },
  activeTrackDuration: {
    color: 'black',
    fontSize: 14,
  },
  emptyFavoritesText: {
    color: '#999',
    fontSize: 16,
    textAlign: 'center',
    fontStyle: 'italic',
    marginVertical: 20,
  },
  noTrackText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 100,
  },
  contextHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    paddingVertical: 12,
  },
  contextHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  contextHeaderText: {
    color: '#1DB954',
    fontSize: 14,
    marginLeft: 8,
    fontWeight: '500',
  },
  clearContextButton: {
    padding: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    width: '80%',
    maxHeight: '70%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 5,
  },
  playlistList: {
    maxHeight: 300,
  },
  playlistOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    marginBottom: 8,
  },
  playlistOptionInfo: {
    flex: 1,
    marginRight: 10,
  },
  playlistOptionName: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  playlistOptionCount: {
    color: '#999',
    fontSize: 14,
  },
  repeatIndicator: {
    position: 'absolute',
    top: -15,
    right: -10,
    backgroundColor: '#1DB954',
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    borderRadius: 5,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  controlsExplanation: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  explanationText: {
    color: '#999',
    fontSize: 14,
    textAlign: 'center',
  },
  noPlaylistsText: {
    color: '#999',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
});
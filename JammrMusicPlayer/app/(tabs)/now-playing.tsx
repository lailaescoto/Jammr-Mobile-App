import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { audioPlayer } from '../../src/lib/player';
import { sampleTracks } from '../../src/data/tracks';

const { width, height } = Dimensions.get('window');

export default function NowPlayingScreen() {
  const [currentTrack, setCurrentTrack] = useState(sampleTracks[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [favorites, setFavorites] = useState<Track[]>([]);

  useEffect(() => {
    const unsubscribe = audioPlayer.subscribe((state) => {
      setCurrentTrack(state.currentTrack || sampleTracks[0]);
      setIsPlaying(state.isPlaying);
      setCurrentTime(state.currentTime);
      setDuration(state.duration);
      setFavorites(state.favorites || []);
    });

    // Load first track by default
    audioPlayer.loadTrack(sampleTracks[0]);

    return unsubscribe;
  }, []);

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

  const handleTrackSelect = async (track: any) => {
    await audioPlayer.loadTrack(track);
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


  if (!currentTrack) {
    return (
      <View style={styles.container}>
        <Text style={styles.noTrackText}>No track loaded</Text>
      </View>
    );
  }

  return (
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
        <TouchableOpacity style={styles.secondaryButton}>
          <Ionicons name="shuffle" size={24} color="#999" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.secondaryButton}>
          <Ionicons name="repeat" size={24} color="#999" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.secondaryButton} onPress={handleToggleFavorite}>
          <Ionicons 
            name={currentTrack && audioPlayer.isFavorite(currentTrack.id) ? "heart" : "heart-outline"} 
            size={24} 
            color={currentTrack && audioPlayer.isFavorite(currentTrack.id) ? "#1DB954" : "#999"} 
          />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.secondaryButton}>
          <Ionicons name="add" size={24} color="#999" />
        </TouchableOpacity>
      </View>

      {/* Favorites List */}
      <View style={styles.trackListContainer}>
        <Text style={styles.sectionTitle}>
          ❤️ Favorites ({favorites.length})
        </Text>
        {favorites.length === 0 ? (
          <Text style={styles.emptyFavoritesText}>
            No favorites yet. Tap the ❤️ button to add songs!
          </Text>
        ) : (
          favorites.map((track) => (
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
});
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Dimensions, Image, PanResponder, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { sampleTracks } from '../../src/data/tracks';
import { audioPlayer } from '../../src/lib/player';

const { width } = Dimensions.get('window');

export default function NowPlayingScreen() {
  const [currentTrack, setCurrentTrack] = useState(sampleTracks[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(sampleTracks[0].duration);
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekPosition, setSeekPosition] = useState(0);

  // Setup pan responder for seekbar dragging
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (evt, gestureState) => {
      const seekWidth = width - 40; // Adjust for padding
      const newPosition = Math.max(0, Math.min((gestureState.moveX / seekWidth) * duration, duration));
      setSeekPosition(newPosition);
      setIsSeeking(true);
    },
    onPanResponderRelease: () => {
      audioPlayer.seekTo(seekPosition);
      setIsSeeking(false);
    },
  });

  useEffect(() => {
    const unsubscribe = audioPlayer.subscribe((state) => {
      if (!isSeeking) {
        setCurrentTrack(state.currentTrack || sampleTracks[0]);
        setIsPlaying(state.isPlaying);
        setCurrentTime(state.currentTime);
        setDuration(state.duration || sampleTracks[0].duration);
      }
    });

    return unsubscribe;
  }, [isSeeking]);

  const handlePlayPause = async () => {
    if (isPlaying) await audioPlayer.pause();
    else await audioPlayer.play();
  };

  const handleNext = () => {
    const currentIndex = sampleTracks.findIndex(t => t.id === currentTrack.id);
    const nextIndex = (currentIndex + 1) % sampleTracks.length;
    audioPlayer.loadTrack(sampleTracks[nextIndex]);
    if (isPlaying) audioPlayer.play();
  };

  const handlePrevious = () => {
    const currentIndex = sampleTracks.findIndex(t => t.id === currentTrack.id);
    const prevIndex = (currentIndex - 1 + sampleTracks.length) % sampleTracks.length;
    audioPlayer.loadTrack(sampleTracks[prevIndex]);
    if (isPlaying) audioPlayer.play();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Album Art */}
      <View style={styles.albumArtContainer}>
        <Image 
          source={{ uri: currentTrack.artwork }} 
          style={styles.albumArt} 
        />
      </View>

      {/* Track Info */}
      <View style={styles.trackInfo}>
        <Text style={styles.trackTitle}>{currentTrack.title}</Text>
        <Text style={styles.trackArtist}>{currentTrack.artist}</Text>
        <Text style={styles.trackPosition}>
          {sampleTracks.findIndex(t => t.id === currentTrack.id) + 1} / {sampleTracks.length}
        </Text>
      </View>

      {/* Seekbar - Now with drag-to-seek */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar} {...panResponder.panHandlers}>
          <View style={styles.progressBackground}>
            <View style={[
              styles.progressFill,
              { 
                width: `${(isSeeking ? seekPosition : currentTime) / duration * 100}%`,
                backgroundColor: isSeeking ? '#1DB954AA' : '#1DB954'
              }
            ]} />
          </View>
        </View>
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>{formatTime(isSeeking ? seekPosition : currentTime)}</Text>
          <Text style={styles.timeText}>{formatTime(duration)}</Text>
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity onPress={handlePrevious}>
          <Ionicons name="play-skip-back" size={32} color="white" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.playButton} 
          onPress={handlePlayPause}
        >
          <Ionicons 
            name={isPlaying ? "pause" : "play"} 
            size={36} 
            color="black" 
          />
        </TouchableOpacity>
        
        <TouchableOpacity onPress={handleNext}>
          <Ionicons name="play-skip-forward" size={32} color="white" />
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
    paddingBottom: 40,
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
  trackInfo: {
    alignItems: 'center',
    marginBottom: 30,
  },
  trackTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  trackArtist: {
    fontSize: 18,
    color: '#1DB954',
    marginBottom: 4,
  },
  trackPosition: {
    fontSize: 14,
    color: '#666',
  },
  progressContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  progressBar: {
    height: 30, // Larger touch area for dragging
    justifyContent: 'center',
    marginBottom: 10,
  },
  progressBackground: {
    height: 4,
    backgroundColor: '#333',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeText: {
    color: '#999',
    fontSize: 14,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },
  playButton: {
    backgroundColor: '#1DB954',
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 30,
  },
});
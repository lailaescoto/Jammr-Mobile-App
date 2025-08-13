import { Audio } from 'expo-av';
import { Track } from '../types';

class SimpleAudioPlayer {
  private sound: Audio.Sound | null = null;
  private currentTrack: Track | null = null;
  private isPlaying: boolean = false;
  private currentTime: number = 0;
  private duration: number = 0;
  private listeners: ((state: any) => void)[] = [];
  private positionUpdateInterval: any = null;
  private queue: Track[] = [];
  private currentIndex: number = 0;

  constructor() {
    this.setupAudioSession();
    this.initializeQueue();
  }

  private initializeQueue() {
    const { sampleTracks } = require('../data/tracks');
    this.queue = sampleTracks;
  }

  private async setupAudioSession() {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true
      });
    } catch (error) {
      console.error('Failed to setup audio session:', error);
    }
  }

  public subscribe(listener: (state: any) => void) {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notifyListeners() {
    const state = {
      currentTrack: this.currentTrack,
      isPlaying: this.isPlaying,
      currentTime: this.currentTime,
      duration: this.duration,
    };
    this.listeners.forEach(listener => listener(state));
  }

  public async loadTrack(track: Track) {
    try {
      if (this.sound) {
        await this.sound.unloadAsync();
      }

      this.sound = new Audio.Sound();
      await this.sound.loadAsync({ uri: track.url });
      
      this.currentTrack = track;
      this.currentTime = 0;
      this.duration = track.duration;
      
      // Update current index if track is in queue
      const trackIndex = this.queue.findIndex(t => t.id === track.id);
      if (trackIndex !== -1) {
        this.currentIndex = trackIndex;
      }
      
      this.notifyListeners();
      return true;
    } catch (error) {
      console.error('Failed to load track:', error);
      return false;
    }
  }

  public async play() {
    if (!this.sound || !this.currentTrack) return;
    
    try {
      await this.sound.playAsync();
      this.isPlaying = true;
      this.startPositionUpdates();
      this.notifyListeners();
    } catch (error) {
      console.error('Failed to play:', error);
    }
  }

  public async pause() {
    if (!this.sound) return;
    
    try {
      await this.sound.pauseAsync();
      this.isPlaying = false;
      this.stopPositionUpdates();
      this.notifyListeners();
    } catch (error) {
      console.error('Failed to pause:', error);
    }
  }

  public async stop() {
    if (!this.sound) return;
    
    try {
      await this.sound.stopAsync();
      this.isPlaying = false;
      this.currentTime = 0;
      this.stopPositionUpdates();
      this.notifyListeners();
    } catch (error) {
      console.error('Failed to stop:', error);
    }
  }

  public async seekTo(position: number) {
    if (!this.sound) return;
    
    try {
      await this.sound.setPositionAsync(position * 1000); 
      this.currentTime = position;
      this.notifyListeners();
    } catch (error) {
      console.error('Failed to seek:', error);
    }
  }

  public async playNext() {
    if (this.queue.length === 0) return;
    
    const nextIndex = (this.currentIndex + 1) % this.queue.length;
    this.currentIndex = nextIndex;
    const nextTrack = this.queue[nextIndex];
    
    await this.loadTrack(nextTrack);
    if (this.isPlaying) {
      await this.play();
    }
  }

  public async playPrevious() {
    if (this.queue.length === 0) return;
    
    const prevIndex = this.currentIndex === 0 ? this.queue.length - 1 : this.currentIndex - 1;
    this.currentIndex = prevIndex;
    const prevTrack = this.queue[prevIndex];
    
    await this.loadTrack(prevTrack);
    if (this.isPlaying) {
      await this.play();
    }
  }

  public getCurrentState() {
    return {
      currentTrack: this.currentTrack,
      isPlaying: this.isPlaying,
      currentTime: this.currentTime,
      duration: this.duration,
    };
  }

  private startPositionUpdates() {
    if (this.positionUpdateInterval) {
      clearInterval(this.positionUpdateInterval);
    }
    
    this.positionUpdateInterval = setInterval(async () => {
      if (this.sound && this.isPlaying) {
        try {
          const status = await this.sound.getStatusAsync();
          if (status.isLoaded) {
            this.currentTime = status.positionMillis / 1000; // Convert to seconds
            this.notifyListeners();
            
            // Check if track ended
            if (status.didJustFinish) {
              this.isPlaying = false;
              this.stopPositionUpdates();
              this.notifyListeners();
            }
          }
        } catch (error) {
          console.error('Failed to get position:', error);
        }
      }
    }, 500); 
  }

  private stopPositionUpdates() {
    if (this.positionUpdateInterval) {
      clearInterval(this.positionUpdateInterval);
      this.positionUpdateInterval = null;
    }
  }

  public async cleanup() {
    this.stopPositionUpdates();
    if (this.sound) {
      await this.sound.unloadAsync();
    }
  }
}

export const audioPlayer = new SimpleAudioPlayer();

import { Audio } from 'expo-av';
import { Track } from '../types';

export interface Playlist {
  id: string;
  name: string;
  coverImage?: string;
  tracks: Track[];
}

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
  private favorites: Track[] = [];
  private currentPlaylist: Playlist | null = null;
  private isPlayingFromPlaylist: boolean = false;
  private shuffleMode: boolean = false;
  private repeatMode: boolean = false; // Simple boolean: true = repeat one, false = no repeat
  private originalTrackOrder: Track[] = [];

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
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
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
      favorites: this.favorites,
      currentPlaylist: this.currentPlaylist,
      isPlayingFromPlaylist: this.isPlayingFromPlaylist,
      shuffleMode: this.shuffleMode,
      repeatMode: this.repeatMode,
    };
    this.listeners.forEach(listener => listener(state));
  }

  public async loadTrack(track: Track, playlist?: Playlist) {
    try {
      if (this.sound) {
        await this.sound.unloadAsync();
      }

      this.sound = new Audio.Sound();
      await this.sound.loadAsync({ uri: track.url });
      
      this.currentTrack = track;
      this.currentTime = 0;
      this.duration = track.duration;
      
      // Set playlist context if provided
      if (playlist) {
        this.currentPlaylist = playlist;
        this.isPlayingFromPlaylist = true;
        // Store original order for shuffle
        this.originalTrackOrder = [...playlist.tracks];
        // Update current index within playlist
        const trackIndex = playlist.tracks.findIndex(t => t.id === track.id);
        if (trackIndex !== -1) {
          this.currentIndex = trackIndex;
        }
      } else {
        // If no playlist provided, check if track is in favorites
        if (this.favorites.some(t => t.id === track.id)) {
          this.isPlayingFromPlaylist = false;
          this.currentPlaylist = null;
          this.originalTrackOrder = [...this.favorites];
          const trackIndex = this.favorites.findIndex(t => t.id === track.id);
          if (trackIndex !== -1) {
            this.currentIndex = trackIndex;
          }
        }
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
    // If repeat is on, stay on the same track
    if (this.repeatMode) {
      if (this.currentTrack) {
        await this.loadTrack(this.currentTrack, this.currentPlaylist || undefined);
        if (this.isPlaying) {
          await this.play();
        }
      }
      return;
    }

    if (this.isPlayingFromPlaylist && this.currentPlaylist) {
      // Play next track from current playlist
      let nextIndex: number;
      
      if (this.shuffleMode) {
        // Get random track that's not the current one
        const availableTracks = this.currentPlaylist.tracks.filter((_, index) => index !== this.currentIndex);
        if (availableTracks.length === 0) {
          // End of playlist
          return;
        } else {
          const randomTrack = availableTracks[Math.floor(Math.random() * availableTracks.length)];
          nextIndex = this.currentPlaylist.tracks.findIndex(t => t.id === randomTrack.id);
        }
      } else {
        nextIndex = (this.currentIndex + 1) % this.currentPlaylist.tracks.length;
      }
      
      this.currentIndex = nextIndex;
      const nextTrack = this.currentPlaylist.tracks[nextIndex];
      
      await this.loadTrack(nextTrack, this.currentPlaylist);
      if (this.isPlaying) {
        await this.play();
      }
    } else if (this.favorites.length > 0) {
      // Play next track from favorites
      let nextIndex: number;
      
      if (this.shuffleMode) {
        // Get random track that's not the current one
        const availableTracks = this.favorites.filter((_, index) => index !== this.currentIndex);
        if (availableTracks.length === 0) {
          // End of favorites
          return;
        } else {
          const randomTrack = availableTracks[Math.floor(Math.random() * availableTracks.length)];
          nextIndex = this.favorites.findIndex(t => t.id === randomTrack.id);
        }
      } else {
        nextIndex = (this.currentIndex + 1) % this.favorites.length;
      }
      
      this.currentIndex = nextIndex;
      const nextTrack = this.favorites[nextIndex];
      
      await this.loadTrack(nextTrack);
      if (this.isPlaying) {
        await this.play();
      }
    }
  }

  public async playPrevious() {
    // If repeat is on, stay on the same track
    if (this.repeatMode) {
      if (this.currentTrack) {
        await this.loadTrack(this.currentTrack, this.currentPlaylist || undefined);
        if (this.isPlaying) {
          await this.play();
        }
      }
      return;
    }

    if (this.isPlayingFromPlaylist && this.currentPlaylist) {
      // Play previous track from current playlist
      let prevIndex: number;
      
      if (this.shuffleMode) {
        // Get random track that's not the current one
        const availableTracks = this.currentPlaylist.tracks.filter((_, index) => index !== this.currentIndex);
        if (availableTracks.length === 0) {
          // End of playlist
          return;
        } else {
          const randomTrack = availableTracks[Math.floor(Math.random() * availableTracks.length)];
          prevIndex = this.currentPlaylist.tracks.findIndex(t => t.id === randomTrack.id);
        }
      } else {
        prevIndex = this.currentIndex <= 0 ? this.currentPlaylist.tracks.length - 1 : this.currentIndex - 1;
      }
      
      this.currentIndex = prevIndex;
      const prevTrack = this.currentPlaylist.tracks[prevIndex];
      
      await this.loadTrack(prevTrack, this.currentPlaylist);
      if (this.isPlaying) {
        await this.play();
      }
    } else if (this.favorites.length > 0) {
      // Play previous track from favorites
      let prevIndex: number;
      
      if (this.shuffleMode) {
        // Get random track that's not the current one
        const availableTracks = this.favorites.filter((_, index) => index !== this.currentIndex);
        if (availableTracks.length === 0) {
          // End of favorites
          return;
        } else {
          const randomTrack = availableTracks[Math.floor(Math.random() * availableTracks.length)];
          prevIndex = this.favorites.findIndex(t => t.id === randomTrack.id);
        }
      } else {
        prevIndex = this.currentIndex <= 0 ? this.favorites.length - 1 : this.currentIndex - 1;
      }
      
      this.currentIndex = prevIndex;
      const prevTrack = this.favorites[prevIndex];
      
      await this.loadTrack(prevTrack);
      if (this.isPlaying) {
        await this.play();
      }
    }
  }

  public addToFavorites(track: Track) {
    if (!this.favorites.some(t => t.id === track.id)) {
      this.favorites.push(track);
      this.notifyListeners();
    }
  }

  public removeFromFavorites(trackId: string) {
    this.favorites = this.favorites.filter(t => t.id !== trackId);
    this.notifyListeners();
  }

  public isFavorite(trackId: string): boolean {
    return this.favorites.some(t => t.id === trackId);
  }

  public getFavorites(): Track[] {
    return [...this.favorites];
  }

  public getCurrentPlaylist(): Playlist | null {
    return this.currentPlaylist;
  }

  public isPlayingFromPlaylistContext(): boolean {
    return this.isPlayingFromPlaylist;
  }

  public getCurrentContextTracks(): Track[] {
    if (this.isPlayingFromPlaylist && this.currentPlaylist) {
      return this.currentPlaylist.tracks;
    } else {
      return this.favorites;
    }
  }

  public getCurrentContextName(): string {
    if (this.isPlayingFromPlaylist && this.currentPlaylist) {
      return this.currentPlaylist.name;
    } else {
      return 'Liked Songs';
    }
  }

  public toggleShuffle(): boolean {
    this.shuffleMode = !this.shuffleMode;
    this.notifyListeners();
    return this.shuffleMode;
  }

  public toggleRepeat(): boolean {
    this.repeatMode = !this.repeatMode;
    this.notifyListeners();
    return this.repeatMode;
  }

  public getShuffleMode(): boolean {
    return this.shuffleMode;
  }

  public getRepeatMode(): boolean {
    return this.repeatMode;
  }

  public async continuePlaying() {
    // This method is no longer needed with simplified repeat
    return;
  }

  public getCurrentState() {
    return {
      currentTrack: this.currentTrack,
      isPlaying: this.isPlaying,
      currentTime: this.currentTime,
      duration: this.duration,
      favorites: this.favorites,
      currentPlaylist: this.currentPlaylist,
      isPlayingFromPlaylist: this.isPlayingFromPlaylist,
      shuffleMode: this.shuffleMode,
      repeatMode: this.repeatMode,
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
            if ((status as any).didJustFinish) {
              this.isPlaying = false;
              this.stopPositionUpdates();
              
              // Handle repeat mode
              if (this.repeatMode) {
                // Repeat the same track
                await this.loadTrack(this.currentTrack!, this.currentPlaylist || undefined);
                await this.play();
              } else {
                // No repeat - just stop
                this.notifyListeners();
              }
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

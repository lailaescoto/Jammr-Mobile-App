import { Track } from '../types';

export interface Playlist {
  id: string;
  name: string;
  coverImage?: string;
  tracks: Track[];
  createdAt: Date;
  updatedAt: Date;
}

class PlaylistManager {
  private playlists: Playlist[] = [];
  private nextId: number = 1;

  constructor() {
    this.initializeDefaultPlaylists();
  }

  private initializeDefaultPlaylists() {
    const { sampleTracks } = require('../data/tracks');
    
    this.playlists = [
      {
        id: '1',
        name: 'Popular Mix',
        coverImage: sampleTracks[0].artwork,
        tracks: [sampleTracks[0], sampleTracks[1], sampleTracks[2]],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '2',
        name: 'Chill Vibes',
        coverImage: sampleTracks[3].artwork,
        tracks: [sampleTracks[3], sampleTracks[4]],
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];
    this.nextId = 3;
  }

  public getAllPlaylists(): Playlist[] {
    return [...this.playlists];
  }

  public getPlaylistById(id: string): Playlist | null {
    return this.playlists.find(p => p.id === id) || null;
  }

  public createPlaylist(name: string, coverImage?: string): Playlist {
    const playlist: Playlist = {
      id: this.nextId.toString(),
      name,
      coverImage,
      tracks: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.playlists.push(playlist);
    this.nextId++;
    return playlist;
  }

  public addTrackToPlaylist(playlistId: string, track: Track): boolean {
    const playlist = this.getPlaylistById(playlistId);
    if (!playlist) return false;
    
    if (!playlist.tracks.some(t => t.id === track.id)) {
      playlist.tracks.push(track);
      playlist.updatedAt = new Date();
      return true;
    }
    return false;
  }

  public removeTrackFromPlaylist(playlistId: string, trackId: string): boolean {
    const playlist = this.getPlaylistById(playlistId);
    if (!playlist) return false;
    
    const initialLength = playlist.tracks.length;
    playlist.tracks = playlist.tracks.filter(t => t.id !== trackId);
    
    if (playlist.tracks.length !== initialLength) {
      playlist.updatedAt = new Date();
      return true;
    }
    return false;
  }

  public deletePlaylist(playlistId: string): boolean {
    const index = this.playlists.findIndex(p => p.id === playlistId);
    if (index !== -1) {
      this.playlists.splice(index, 1);
      return true;
    }
    return false;
  }

  public updatePlaylist(playlistId: string, updates: Partial<Omit<Playlist, 'id' | 'createdAt'>>): boolean {
    const playlist = this.getPlaylistById(playlistId);
    if (!playlist) return false;
    
    Object.assign(playlist, updates);
    playlist.updatedAt = new Date();
    return true;
  }

  public searchPlaylists(query: string): Playlist[] {
    const lowerQuery = query.toLowerCase();
    return this.playlists.filter(playlist => 
      playlist.name.toLowerCase().includes(lowerQuery) ||
      playlist.tracks.some(track => 
        track.title.toLowerCase().includes(lowerQuery) ||
        track.artist.toLowerCase().includes(lowerQuery)
      )
    );
  }

  public getPlaylistsByTrack(trackId: string): Playlist[] {
    return this.playlists.filter(playlist => 
      playlist.tracks.some(track => track.id === trackId)
    );
  }
}

export const playlistManager = new PlaylistManager();

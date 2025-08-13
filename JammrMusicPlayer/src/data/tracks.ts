import { Track } from '../types';
import { Asset } from 'expo-asset';

export const sampleTracks: Track[] = [
  {
    id: '1',
    title: 'Tornado Warnings',
    artist: 'Sabrina Carpenter',
    album: 'Emails I Cant Send',
    duration: 205,
    artwork: Asset.fromModule(require('../../assets/images/albums/tornado-warnings.jpg')).uri,
    url: Asset.fromModule(require('../../assets/audio/tornado-warnings.mp3')).uri,
  },
  {
    id: '2',
    title: 'twilight zone',
    artist: 'Ariana Grande',
    album: 'Eternal Sunshine',
    duration: 240,
    artwork: Asset.fromModule(require('../../assets/images/albums/twilight-zone.png')).uri,
    url: Asset.fromModule(require('../../assets/audio/twilight-zone.mp3')).uri,
  },
  {
    id: '3',
    title: 'Heavy',
    artist: 'The Marias',
    album: 'CINEMA',
    duration: 252,
    artwork: Asset.fromModule(require('../../assets/images/albums/heavy.jpg')).uri,
    url: Asset.fromModule(require('../../assets/audio/heavy.mp3')).uri,
  },
  {
    id: '4',
    title: 'jupiter',
    artist: 'The Marias',
    album: 'Jupiter',
    duration: 191,
    artwork: Asset.fromModule(require('../../assets/images/albums/jupiter.jpg')).uri,
    url: Asset.fromModule(require('../../assets/audio/jupiter.mp3')).uri,
  },
  {
    id: '5',
    title: 'Good Luck, Babe!',
    artist: 'Chappell Roan',
    album: 'Good Luck, Babe!',
    duration: 217,
    artwork: Asset.fromModule(require('../../assets/images/albums/good-luck-babe.png')).uri,
    url: Asset.fromModule(require('../../assets/audio/good-luck-babe.mp3')).uri,
  }
];

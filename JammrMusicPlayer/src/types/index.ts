export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  artwork?: string; // URL or local asset path
  url: string; // streaming URL or local file path
}

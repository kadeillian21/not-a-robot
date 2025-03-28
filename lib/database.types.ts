export interface Puzzle {
  id: number;
  created_at: string;
  weekday: number;
  image_url: string;
  target_description: string;
  correct_tiles: number[];
}

// Client-side friendly version with camelCase
export interface PuzzleClient {
  id: number;
  createdAt: string;
  weekday: number;
  imageUrl: string;
  targetDescription: string;
  correctTiles: number[];
}
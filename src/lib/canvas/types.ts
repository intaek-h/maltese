export type Animal = {
  id: number;
  name: string;
  image: string;
  movement_type: string;
  created_at: number;
  updated_at: number;
  deleted_at: number | null;
};

export type Word = {
  id: number;
  input_1: string;
  input_2: string;
  author_fingerprint: string;
  animal_id: number;
  likes: number;
  report_count: number;
  created_at: number;
  updated_at: number;
  deleted_at: number | null;
};

export type MovingAnimal = {
  animal: Animal;
  pun: string;
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  width: number;
  height: number;
  imageElement: HTMLImageElement;
  isImageLoaded: boolean;
  highlightRemainingMs?: number;
  hop?: {
    baseY: number;
    amplitude: number;
    phase: number;
    speed: number;
  };
};

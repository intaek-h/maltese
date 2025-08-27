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
  input1?: string;
  input2?: string;
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
  zigzag?: {
    baseY: number;
    amplitude: number;
    phase: number;
    speed: number;
  };
  flutter?: {
    phase: number;
    bobAmplitude: number;
    bobSpeed: number;
    driftSpeed: number;
    heading: number;
  };
  orbit?: {
    centerX: number;
    centerY: number;
    radius: number;
    angle: number;
    angularSpeed: number;
    direction: 1 | -1;
    centerVX: number;
    centerVY: number;
  };
};

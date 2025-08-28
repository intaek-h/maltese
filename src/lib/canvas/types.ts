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
  // Randomized startup delay to desynchronize same-type movements
  startDelayRemainingSec?: number;
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
  deer?: {
    hopDistance: number; // px per hop forward
    hopHeight: number; // peak height of hop arc
    hopVelocity: number; // horizontal velocity during hop (px/sec)
    stopTime: number; // seconds to stop after each hop
    hopProgress: number; // 0..1 progress through current hop
    hopping: boolean; // whether currently mid-hop vs stopped
    directionX: 1 | -1; // horizontal direction
    pauseRemaining: number; // seconds remaining in stop
    baseY: number; // ground level for hop baseline
    hopStartX: number; // start x of current hop
    hopEndX: number; // target x of current hop
  };
  rabbit?: {
    hopDistance: number; // px per hop forward
    hopHeight: number; // peak height of hop arc
    hopVelocity: number; // horizontal velocity during hop (px/sec)
    stopTime: number; // seconds to stop after 3 hops
    hopsRemainingInBurst: number; // countdown of hops in current burst
    hopProgress: number; // 0..1 progress through current hop
    hopping: boolean; // whether currently mid-hop vs stopped
    directionX: 1 | -1; // horizontal direction
    pauseRemaining: number; // seconds remaining in stop
    baseY: number; // ground level for hop baseline
    hopStartX: number; // start x of current hop
    hopEndX: number; // target x of current hop
  };
};

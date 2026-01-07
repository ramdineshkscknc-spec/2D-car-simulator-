
export interface Vector2 {
  x: number;
  y: number;
}

export interface Car {
  pos: Vector2;
  velocity: Vector2;
  acceleration: number;
  angle: number;
  steering: number;
  speed: number;
  health: number;
  color: string;
}

export interface Mission {
  id: string;
  title: string;
  objective: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  targetSpeed: number;
  timeLimit: number;
}

export enum GameState {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  GAMEOVER = 'GAMEOVER',
  MISSION_SELECT = 'MISSION_SELECT'
}

export interface GameSettings {
  showDebug: boolean;
  friction: number;
  drag: number;
}

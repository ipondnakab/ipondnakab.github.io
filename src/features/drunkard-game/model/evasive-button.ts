export interface EvasivePoint {
  x: number;
  y: number;
}

export interface EvasiveSize {
  width: number;
  height: number;
}

export interface EvasivePositionInput {
  pointer: EvasivePoint;
  container: EvasiveSize;
  button: EvasiveSize;
  padding?: number;
}

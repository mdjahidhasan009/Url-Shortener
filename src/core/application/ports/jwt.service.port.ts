export interface JwtServicePort {
  sign(payload: any): string;
}
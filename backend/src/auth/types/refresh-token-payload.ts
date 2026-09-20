export interface RefreshTokenPayload {
  sub: number;
  type: 'refresh';
  jti: string;
}

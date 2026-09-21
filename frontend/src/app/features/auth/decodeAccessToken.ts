/** Decode JWT payload for display only (not verification). */
export type JwtClaims = {
  sub: number;
  email: string;
  role: string;
};

export function decodeAccessToken(token: string | null): JwtClaims | null {
  if (!token) return null;

  try {
    const segment = token.split('.')[1];
    if (!segment) return null;

    const normalized = segment.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(
      normalized.length + ((4 - (normalized.length % 4)) % 4),
      '=',
    );
    const json = atob(padded);
    const payload = JSON.parse(json) as {
      sub?: number | string;
      email?: string;
      role?: string;
    };

    const sub =
      typeof payload.sub === 'number'
        ? payload.sub
        : typeof payload.sub === 'string'
          ? Number(payload.sub)
          : NaN;

    if (
      !Number.isFinite(sub) ||
      typeof payload.email !== 'string' ||
      typeof payload.role !== 'string'
    ) {
      return null;
    }

    return {
      sub,
      email: payload.email,
      role: payload.role,
    };
  } catch {
    return null;
  }
}

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type OAuthProviders = {
  google: boolean;
  facebook: boolean;
};

export type RegisterRequest = {
  name: string;
  email: string;
  password: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  createdAt: string;
  /** Present from /users/me; may be missing on older register responses */
  hasPassword?: boolean;
};

export type UpdateProfileRequest = {
  name?: string;
  email?: string;
};

export type ChangePasswordRequest = {
  currentPassword?: string;
  newPassword: string;
};

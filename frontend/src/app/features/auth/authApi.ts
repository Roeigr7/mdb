import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithAuth } from '../../api/baseQuery';
import type {
  AuthTokens,
  AuthUser,
  LoginRequest,
  OAuthProviders,
  RegisterRequest,
} from './auth.types';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: baseQueryWithAuth,
  tagTypes: ['Me'],
  endpoints: (builder) => ({
    getOAuthProviders: builder.query<OAuthProviders, void>({
      query: () => '/auth/providers',
    }),
    getMe: builder.query<AuthUser, void>({
      query: () => '/users/me',
      providesTags: ['Me'],
    }),
    register: builder.mutation<AuthUser, RegisterRequest>({
      query: (body) => ({
        url: '/auth/register',
        method: 'POST',
        body,
      }),
    }),
    login: builder.mutation<AuthTokens, LoginRequest>({
      query: (body) => ({
        url: '/auth/login',
        method: 'POST',
        body,
      }),
    }),
    refresh: builder.mutation<AuthTokens, { refreshToken: string }>({
      query: (body) => ({
        url: '/auth/refresh',
        method: 'POST',
        body,
      }),
    }),
    logout: builder.mutation<{ message: string }, { refreshToken: string }>({
      query: (body) => ({
        url: '/auth/logout',
        method: 'POST',
        body,
      }),
    }),
    exchangeOAuthCode: builder.mutation<AuthTokens, { code: string }>({
      query: (body) => ({
        url: '/auth/oauth/exchange',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const {
  useGetOAuthProvidersQuery,
  useGetMeQuery,
  useRegisterMutation,
  useLoginMutation,
  useRefreshMutation,
  useLogoutMutation,
  useExchangeOAuthCodeMutation,
} = authApi;

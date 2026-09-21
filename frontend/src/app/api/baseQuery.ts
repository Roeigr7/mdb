import {
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query';
import { clearCredentials, setCredentials } from '../features/auth/authSlice';

type AuthAwareState = {
  auth: {
    accessToken: string | null;
    refreshToken: string | null;
  };
};

const rawBaseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as AuthAwareState).auth.accessToken;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

function isAuthEndpoint(url: string): boolean {
  return (
    url.includes('/auth/login') ||
    url.includes('/auth/register') ||
    url.includes('/auth/refresh') ||
    url.includes('/auth/logout') ||
    url.includes('/auth/oauth/exchange')
  );
}

let refreshPromise: Promise<boolean> | null = null;

async function refreshAccessToken(
  api: Parameters<BaseQueryFn>[1],
): Promise<boolean> {
  const state = api.getState() as AuthAwareState;
  const refreshToken = state.auth.refreshToken;
  if (!refreshToken) {
    return false;
  }

  const result = await rawBaseQuery(
    {
      url: '/auth/refresh',
      method: 'POST',
      body: { refreshToken },
    },
    api,
    {},
  );

  if (result.data && typeof result.data === 'object') {
    const data = result.data as { accessToken?: string; refreshToken?: string };
    if (data.accessToken && data.refreshToken) {
      api.dispatch(
        setCredentials({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        }),
      );
      return true;
    }
  }

  return false;
}

/**
 * Shared base query: attaches JWT, refreshes once on 401, then clears session.
 */
export const baseQueryWithAuth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    const url = typeof args === 'string' ? args : args.url;

    if (!isAuthEndpoint(url)) {
      if (!refreshPromise) {
        refreshPromise = refreshAccessToken(api).finally(() => {
          refreshPromise = null;
        });
      }

      const refreshed = await refreshPromise;
      if (refreshed) {
        result = await rawBaseQuery(args, api, extraOptions);
      } else {
        api.dispatch(clearCredentials());
      }
    }
  }

  return result;
};

import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithAuth } from '../../api/baseQuery';
import type { AnalyticsOverview } from './analytics.types';

export type GetAnalyticsArgs = {
  projectId?: number;
};

export const analyticsApi = createApi({
  reducerPath: 'analyticsApi',
  baseQuery: baseQueryWithAuth,
  tagTypes: ['Analytics'],
  endpoints: (builder) => ({
    getAnalytics: builder.query<AnalyticsOverview, GetAnalyticsArgs | void>({
      query: (args) => {
        const projectId = args?.projectId;
        return projectId != null
          ? `/analytics?projectId=${projectId}`
          : '/analytics';
      },
      providesTags: (_result, _error, args) => [
        {
          type: 'Analytics',
          id: args?.projectId != null ? `PROJECT-${args.projectId}` : 'ALL',
        },
      ],
    }),
  }),
});

export const { useGetAnalyticsQuery } = analyticsApi;

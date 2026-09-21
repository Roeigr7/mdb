import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithAuth } from '../../api/baseQuery';
import type { MessageResponse } from '../projects/projects.types';
import type {
  CreateRevenueRequest,
  PaginatedRevenue,
  Revenue,
  UpdateRevenueRequest,
} from './revenue.types';
import { REVENUE_PAGE_SIZE } from './revenue.types';

export type GetRevenueArgs = {
  projectId: number;
  page?: number;
  limit?: number;
};

export const revenueApi = createApi({
  reducerPath: 'revenueApi',
  baseQuery: baseQueryWithAuth,
  tagTypes: ['Revenue'],
  endpoints: (builder) => ({
    getRevenue: builder.query<PaginatedRevenue, GetRevenueArgs>({
      query: ({ projectId, page = 1, limit = REVENUE_PAGE_SIZE }) =>
        `/projects/${projectId}/revenue?page=${page}&limit=${limit}`,
      serializeQueryArgs: ({ queryArgs }) => queryArgs.projectId,
      merge: (currentCache, newItems) => {
        if (newItems.meta.page <= 1) {
          currentCache.data = newItems.data;
          currentCache.meta = newItems.meta;
          currentCache.summary = newItems.summary;
          return;
        }
        const existingIds = new Set(currentCache.data.map((item) => item.id));
        for (const item of newItems.data) {
          if (!existingIds.has(item.id)) {
            currentCache.data.push(item);
          }
        }
        currentCache.meta = newItems.meta;
        currentCache.summary = newItems.summary;
      },
      forceRefetch: ({ currentArg, previousArg }) =>
        currentArg?.page !== previousArg?.page ||
        currentArg?.projectId !== previousArg?.projectId,
      providesTags: (result, _error, { projectId }) =>
        result
          ? [
              ...result.data.map(({ id }) => ({
                type: 'Revenue' as const,
                id,
              })),
              { type: 'Revenue' as const, id: `LIST-${projectId}` },
            ]
          : [{ type: 'Revenue' as const, id: `LIST-${projectId}` }],
    }),
    getRevenueById: builder.query<
      Revenue,
      { projectId: number; revenueId: number }
    >({
      query: ({ projectId, revenueId }) =>
        `/projects/${projectId}/revenue/${revenueId}`,
      providesTags: (_result, _error, { revenueId }) => [
        { type: 'Revenue', id: revenueId },
      ],
    }),
    createRevenue: builder.mutation<
      Revenue,
      { projectId: number; body: CreateRevenueRequest }
    >({
      query: ({ projectId, body }) => ({
        url: `/projects/${projectId}/revenue`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { projectId }) => [
        { type: 'Revenue', id: `LIST-${projectId}` },
      ],
    }),
    updateRevenue: builder.mutation<
      Revenue,
      { projectId: number; revenueId: number; body: UpdateRevenueRequest }
    >({
      query: ({ projectId, revenueId, body }) => ({
        url: `/projects/${projectId}/revenue/${revenueId}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_result, _error, { projectId, revenueId }) => [
        { type: 'Revenue', id: revenueId },
        { type: 'Revenue', id: `LIST-${projectId}` },
      ],
    }),
    deleteRevenue: builder.mutation<
      MessageResponse,
      { projectId: number; revenueId: number }
    >({
      query: ({ projectId, revenueId }) => ({
        url: `/projects/${projectId}/revenue/${revenueId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { projectId, revenueId }) => [
        { type: 'Revenue', id: revenueId },
        { type: 'Revenue', id: `LIST-${projectId}` },
      ],
    }),
  }),
});

export const {
  useGetRevenueQuery,
  useGetRevenueByIdQuery,
  useCreateRevenueMutation,
  useUpdateRevenueMutation,
  useDeleteRevenueMutation,
} = revenueApi;

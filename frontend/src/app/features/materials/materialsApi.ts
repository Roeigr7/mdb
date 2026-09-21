import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithAuth } from '../../api/baseQuery';
import type { MessageResponse } from '../projects/projects.types';
import type {
  CreateMaterialRequest,
  Material,
  PaginatedMaterials,
  UpdateMaterialRequest,
} from './materials.types';
import { MATERIALS_PAGE_SIZE } from './materials.types';

export type GetMaterialsArgs = {
  projectId: number;
  page?: number;
  limit?: number;
};

export const materialsApi = createApi({
  reducerPath: 'materialsApi',
  baseQuery: baseQueryWithAuth,
  tagTypes: ['Material'],
  endpoints: (builder) => ({
    getMaterials: builder.query<PaginatedMaterials, GetMaterialsArgs>({
      query: ({ projectId, page = 1, limit = MATERIALS_PAGE_SIZE }) =>
        `/projects/${projectId}/materials?page=${page}&limit=${limit}`,
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
                type: 'Material' as const,
                id,
              })),
              { type: 'Material' as const, id: `LIST-${projectId}` },
            ]
          : [{ type: 'Material' as const, id: `LIST-${projectId}` }],
    }),
    createMaterial: builder.mutation<
      Material,
      { projectId: number; body: CreateMaterialRequest }
    >({
      query: ({ projectId, body }) => ({
        url: `/projects/${projectId}/materials`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { projectId }) => [
        { type: 'Material', id: `LIST-${projectId}` },
      ],
    }),
    updateMaterial: builder.mutation<
      Material,
      { projectId: number; materialId: number; body: UpdateMaterialRequest }
    >({
      query: ({ projectId, materialId, body }) => ({
        url: `/projects/${projectId}/materials/${materialId}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_result, _error, { projectId, materialId }) => [
        { type: 'Material', id: materialId },
        { type: 'Material', id: `LIST-${projectId}` },
      ],
    }),
    deleteMaterial: builder.mutation<
      MessageResponse,
      { projectId: number; materialId: number }
    >({
      query: ({ projectId, materialId }) => ({
        url: `/projects/${projectId}/materials/${materialId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { projectId, materialId }) => [
        { type: 'Material', id: materialId },
        { type: 'Material', id: `LIST-${projectId}` },
      ],
    }),
  }),
});

export const {
  useGetMaterialsQuery,
  useCreateMaterialMutation,
  useUpdateMaterialMutation,
  useDeleteMaterialMutation,
} = materialsApi;

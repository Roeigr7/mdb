import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithAuth } from '../../api/baseQuery';
import type {
  CreateProjectRequest,
  GetProjectsQuery,
  MessageResponse,
  PaginatedProjectsResponse,
  Project,
  UpdateProjectRequest,
} from './projects.types';
import { materialsApi } from '../materials/materialsApi';
import { expensesApi } from '../expenses/expensesApi';
import { revenueApi } from '../revenue/revenueApi';

export const projectsApi = createApi({
  reducerPath: 'projectsApi',
  baseQuery: baseQueryWithAuth,
  tagTypes: ['Project'],
  endpoints: (builder) => ({
    getProjects: builder.query<PaginatedProjectsResponse, GetProjectsQuery | void>({
      query: (params) => ({
        url: '/projects',
        ...(params ? { params } : {}),
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({
                type: 'Project' as const,
                id,
              })),
              { type: 'Project', id: 'LIST' },
            ]
          : [{ type: 'Project', id: 'LIST' }],
    }),
    getProjectById: builder.query<Project, number>({
      query: (id) => `/projects/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Project', id }],
    }),
    createProject: builder.mutation<Project, CreateProjectRequest>({
      query: (body) => ({
        url: '/projects',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Project', id: 'LIST' }],
    }),
    updateProject: builder.mutation<
      Project,
      { id: number; body: UpdateProjectRequest }
    >({
      query: ({ id, body }) => ({
        url: `/projects/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Project', id },
        { type: 'Project', id: 'LIST' },
      ],
    }),
    deleteProject: builder.mutation<MessageResponse, number>({
      query: (id) => ({
        url: `/projects/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Project', id },
        { type: 'Project', id: 'LIST' },
      ],
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        await queryFulfilled;
        dispatch(
          materialsApi.util.invalidateTags([
            { type: 'Material', id: `LIST-${id}` },
          ]),
        );
        dispatch(
          expensesApi.util.invalidateTags([
            { type: 'Expense', id: `LIST-${id}` },
          ]),
        );
        dispatch(
          revenueApi.util.invalidateTags([
            { type: 'Revenue', id: `LIST-${id}` },
          ]),
        );
      },
    }),
  }),
});

export const {
  useGetProjectsQuery,
  useGetProjectByIdQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
} = projectsApi;

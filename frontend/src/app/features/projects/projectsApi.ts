import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { Project } from './projects.types';

export const projectsApi = createApi({
  reducerPath: 'projectsApi',

  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL,
  }),

  endpoints: (builder) => ({
    getProjects: builder.query<Project[], void>({
      query: () => '/projects',
    }),
  }),
});

export const { useGetProjectsQuery } = projectsApi;
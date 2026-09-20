import { configureStore } from '@reduxjs/toolkit';
import { projectsApi } from './features/projects/projectsApi.ts';

export const store = configureStore({
  reducer: {
    [projectsApi.reducerPath]: projectsApi.reducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(projectsApi.middleware),
});
import { configureStore } from '@reduxjs/toolkit';
import { analyticsApi } from './features/analytics/analyticsApi';
import { authApi } from './features/auth/authApi';
import { authReducer } from './features/auth/authSlice';
import { expensesApi } from './features/expenses/expensesApi';
import { materialsApi } from './features/materials/materialsApi';
import { projectsApi } from './features/projects/projectsApi';
import { revenueApi } from './features/revenue/revenueApi';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
    [projectsApi.reducerPath]: projectsApi.reducer,
    [materialsApi.reducerPath]: materialsApi.reducer,
    [expensesApi.reducerPath]: expensesApi.reducer,
    [revenueApi.reducerPath]: revenueApi.reducer,
    [analyticsApi.reducerPath]: analyticsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      projectsApi.middleware,
      materialsApi.middleware,
      expensesApi.middleware,
      revenueApi.middleware,
      analyticsApi.middleware,
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

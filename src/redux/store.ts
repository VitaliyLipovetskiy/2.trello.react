import { configureStore } from '@reduxjs/toolkit';
// import { api } from './common/constants/api';

export const store = configureStore({
  reducer: {
    // [api.reducerPath]: api.reducer,
  },
  // middleware: (defaultMiddleware) => defaultMiddleware().concat(api.middleware),
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;

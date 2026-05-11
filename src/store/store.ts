import { configureStore } from '@reduxjs/toolkit';
import { rootReducer } from './root-reducer';
import { boardApi } from './board/boardSlice';
import { authApi } from './auth/authApi';

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(boardApi.middleware, authApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export { store };

import { configureStore } from '@reduxjs/toolkit';
import { rootReducer } from './root-reducer';
import api from '../api/request';
// import {boardApi} from "./board/boardSlice";

const extraArgument = {
  api,
};

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => {
    return getDefaultMiddleware({
      thunk: { extraArgument },
    });
    // .concat(boardApi.middleware)
    // .concat(loggerMiddleware)
  },
});

export type RootState = ReturnType<typeof store.getState>;
// export type RootState = ReturnType<typeof rootReducer>

export type AppDispatch = typeof store.dispatch;

type AsyncThunkConfig = {
  state: RootState;
  dispatch: AppDispatch;
  extra: typeof extraArgument;
};

export { extraArgument, store, type AsyncThunkConfig };

import { boardReducer as board } from './board/reducer'; // eslint-disable-line import/no-cycle
import { boardApi } from './board/boardSlice';
import { authReducer as auth } from './auth/authSlice';
import { authApi } from './auth/authApi';

const rootReducer = {
  board,
  auth,
  [boardApi.reducerPath]: boardApi.reducer,
  [authApi.reducerPath]: authApi.reducer,
};

export { rootReducer };

import { boardReducer as board } from './board/reducer';
import { boardApi } from './board/boardSlice';

const rootReducer = { board, [boardApi.reducerPath]: boardApi.reducer };

export { rootReducer };

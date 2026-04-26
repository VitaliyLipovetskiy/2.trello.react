import { boardReducer as board } from './board/reducer'; // eslint-disable-line import/no-cycle
import { boardApi } from './board/boardSlice';

const rootReducer = { board, [boardApi.reducerPath]: boardApi.reducer };

export { rootReducer };

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IBoard, ICard, ICardUpdate, IList } from '../../common/interfaces';
import { getAllBoards, getBoardById } from './actions';

export interface BoardState {
  boards?: IBoard[];
  board?: IBoard;
  card?: ICard;
  list?: IList;
  error: string;
}

const initialState: BoardState = {
  boards: [],
  board: {
    id: 0,
    title: '',
    lists: [],
  },
  error: '',
};

const boardSlice = createSlice({
  name: 'board',
  initialState,
  reducers: {
    setCard: (state, action: PayloadAction<{ card?: ICard; list?: IList }>) => {
      state.card = action.payload.card;
      state.list = action.payload.list;
    },
    clearCard: (state) => {
      state.card = undefined;
      state.list = undefined;
    },
    addBoard: (state, action: PayloadAction<IBoard>) => {
      state.boards?.push(action.payload);
    },
    // updateBoard: (state, action: PayloadAction<IBoard>) => {
    //   state.boards = state.boards?.map((board) => (board.id === action.payload.id ? action.payload : board));
    // },
    removeBoard: (state, action: PayloadAction<number>) => {
      state.boards = state.boards?.filter((board) => board.id !== action.payload);
    },
    addList: (state, action: PayloadAction<IList>) => {
      state.board?.lists.push(action.payload);
    },
    updateList: (state, action: PayloadAction<{ listId: number; title: string }>) => {
      if (!state.board) return;
      state.board.lists.forEach((list) => {
        if (list.id === action.payload.listId) {
          list.title = action.payload.title;
        }
      });
    },
    removeList: (state, action: PayloadAction<number>) => {
      if (!state.board) return;
      const lists = state.board.lists.filter((list) => list.id !== action.payload);
      state.board.lists.splice(0, state.board.lists.length);
      state.board.lists.push(...lists);
    },
    addCard: (state, action: PayloadAction<{ listId: number; card: ICard }>) => {
      if (!state.board) return;
      state.board.lists.forEach((list) => {
        if (list.id === action.payload.listId) {
          list.cards.push(action.payload.card);
        }
      });
    },
    updateCard: (state, action: PayloadAction<{ cardId: number; listId: number; card: ICardUpdate }>) => {
      if (!state.board) return;
      state.board.lists.forEach((list) => {
        if (list.id !== action.payload.listId) return;
        list.cards.forEach((card) => {
          if (card.id !== action.payload.cardId) return;
          card.title = action.payload.card.title.trim();
          card.description = action.payload.card.description?.trim();
        });
      });
      state.card = {
        ...state.card,
        title: action.payload.card.title.trim(),
        description: action.payload.card.description?.trim(),
      } as ICard;
    },
    removeCard: (state, action: PayloadAction<{ cardId: number; listId: number }>) => {
      if (!state.board) return;
      const list = state.board.lists.find((list) => list.id === action.payload.listId);
      if (!list) return;
      state.board.lists.forEach((list) => {
        if (list.id !== action.payload.listId) return;
        const cards = list.cards.filter((card) => card.id !== action.payload.cardId);
        list.cards.splice(0, list.cards.length);
        list.cards.push(...cards);
      });
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllBoards.rejected, (state) => {
        state.error = 'error';
      })
      .addCase(getAllBoards.fulfilled, (state, { payload }) => {
        state.boards = payload.boards;
        state.board = undefined;
      })
      .addCase(getBoardById.rejected, (state) => {
        state.error = 'error';
      })
      .addCase(getBoardById.fulfilled, (state, { payload, meta }) => {
        state.board = { ...payload, id: meta.arg };
      });
  },
});

export const {
  setCard,
  clearCard,
  addBoard,
  // updateBoard,
  removeBoard,
  addList,
  updateList,
  removeList,
  addCard,
  updateCard,
  removeCard,
} = boardSlice.actions;

const boardReducer = boardSlice.reducer;

export { boardReducer };

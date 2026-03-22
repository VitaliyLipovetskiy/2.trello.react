import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IBoard, IBoardSlot, ICard, ICardSlot, ICardUpdate, IList, IListSlot } from '../../common/interfaces';
import { getAllBoards, getBoardById } from './actions';

export interface BoardState {
  boards?: IBoard[];
  boardSlot?: IBoardSlot;
  cardSlot?: ICardSlot;
  listSlot?: IListSlot;
  error: string;
}

const initialState: BoardState = {
  boards: [],
  boardSlot: {
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
    setCard: (state, action: PayloadAction<{ cardSlot?: ICardSlot; listSlot?: IListSlot }>) => {
      state.cardSlot = action.payload.cardSlot;
      state.listSlot = action.payload.listSlot;
    },
    clearCard: (state) => {
      state.cardSlot = undefined;
      state.listSlot = undefined;
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
      const listSlot = convertListToSlot(action.payload);
      if (state.boardSlot?.lists) {
        state.boardSlot?.lists.push(listSlot);
      } else {
        state.boardSlot = { ...state.boardSlot!, lists: [listSlot] };
      }
    },
    updateList: (state, action: PayloadAction<{ listId: number; title: string }>) => {
      if (!state.boardSlot?.lists) return;
      state.boardSlot.lists.forEach((listSlot) => {
        if (listSlot.id === action.payload.listId) {
          listSlot.title = action.payload.title;
        }
      });
    },
    removeList: (state, action: PayloadAction<number>) => {
      if (!state.boardSlot) return;
      const lists = state.boardSlot.lists?.filter((list) => list.id !== action.payload);
      if (state.boardSlot.lists && lists) {
        state.boardSlot.lists.splice(0, state.boardSlot.lists.length);
        state.boardSlot.lists.push(...lists);
      }
    },
    addCard: (state, action: PayloadAction<{ listId: number; card: ICard }>) => {
      if (!state.boardSlot?.lists) return;
      state.boardSlot.lists.forEach((listSlot) => {
        if (listSlot.id === action.payload.listId) {
          const card = action.payload.card;
          const cardSlot = { position: card.position, card, view: true } as ICardSlot;
          listSlot.cardSlots.push(cardSlot);
        }
      });
    },
    updateCard: (state, action: PayloadAction<{ cardId: number; listId: number; card: ICardUpdate }>) => {
      if (!state.boardSlot?.lists) return;
      state.boardSlot.lists.forEach((listSlot) => {
        if (listSlot.id !== action.payload.listId) return;
        listSlot.cardSlots.forEach((cardSlot) => {
          if (cardSlot.card?.id !== action.payload.cardId) return;
          cardSlot.card.title = action.payload.card.title.trim();
          cardSlot.card.description = action.payload.card.description?.trim();
        });
      });
      state.cardSlot = {
        ...state.cardSlot,
        card: action.payload.card,
      } as ICardSlot;
    },
    removeCard: (state, action: PayloadAction<{ cardId: number; listId: number }>) => {
      if (!state.boardSlot) return;
      const listSlot = state.boardSlot.lists?.find((list) => list.id === action.payload.listId);
      if (!listSlot) return;
      state.boardSlot.lists?.forEach((listSlot) => {
        if (listSlot.id !== action.payload.listId) return;
        const cardSlots = listSlot.cardSlots.filter((cardSlot) => cardSlot.card?.id !== action.payload.cardId);
        listSlot.cardSlots.splice(0, listSlot.cardSlots.length);
        listSlot.cardSlots.push(...cardSlots);
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
        state.boardSlot = undefined;
      })
      .addCase(getBoardById.rejected, (state) => {
        state.error = 'error';
      })
      .addCase(getBoardById.fulfilled, (state, { payload, meta }) => {
        const lists = payload.lists?.map((list) => convertListToSlot(list));
        state.boardSlot = { ...payload, id: meta.arg, lists };
      });
  },
});

const convertListToSlot = (list: IList): IListSlot => {
  const cardSlots = [...list.cards, undefined]
    .map((card) => ({ position: card?.position || -1, card, view: !!card }) as ICardSlot)
    .sort((a, b) => a.position - b.position);
  return { id: list.id, title: list.title, position: list.position, cardSlots };
};

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

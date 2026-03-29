import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IBoard, IBoardSlot, ICard, ICardSlot, ICardUpdate, IList, IListSlot } from '../../common/interfaces';
import { getAllBoards, getBoardById } from './actions';

export interface BoardState {
  boards?: IBoard[];
  boardSlot?: IBoardSlot;
  cardSlot?: ICardSlot;
  listSlot?: IListSlot;
  error: string;
  cardDragged?: ICardSlot;
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

    setCardDragged: (state, action: PayloadAction<{ cardId?: number; listId?: number }>) => {
      if (action.payload.cardId && action.payload.listId) {
        state.cardDragged = state.boardSlot?.lists
          ?.find((listSlot) => listSlot.id === action.payload.listId)
          ?.cardSlots.find((cardSlot) => cardSlot.card?.id === action.payload.cardId);
      } else {
        state.cardDragged = undefined;
      }
    },

    hideCardDragged: (state) => {
      if (state.cardDragged) {
        state.cardDragged.view = false;
      }
    },

    showPlaceholderSlot: (state, action: PayloadAction<{ targetPosition: number; listSlot: IListSlot }>) => {
      const sourceList = state.boardSlot?.lists?.find((l) =>
        l.cardSlots.some((s) => s.card?.id === state.cardDragged?.card?.id)
      );
      const position = action.payload.targetPosition;
      const listSlot = action.payload.listSlot;
      if (state.cardDragged?.card && listSlot.id === sourceList?.id) {
        const currentPos = state.cardDragged.card.position;
        if (position === currentPos || position === currentPos + 1) {
          if (listSlot.cardSlots.some((s) => !s.card && s.view)) {
            hidePlaceholderSlot({ listSlot });
          }
          return;
        }
      }
      const currentPlaceholder = listSlot.cardSlots.find((s) => !s.card);
      if (currentPlaceholder?.view && currentPlaceholder.position === position) {
        return;
      }
      const cards = listSlot.cardSlots
        .filter((s) => !!s.card)
        .map((s) => s.card!)
        .sort((a, b) => a.position - b.position);
      const newCardSlots: ICardSlot[] = cards.map((card) => {
        const shouldShift = card.position >= position;
        return {
          card,
          view: true,
          position: card.position + (shouldShift ? 1 : 0),
        };
      });
      newCardSlots.push({
        card: undefined,
        view: true,
        position: position,
      });
      newCardSlots.sort((a, b) => a.position - b.position);
      const newList = { ...listSlot, cardSlots: newCardSlots };
      if (!state.boardSlot) return;
      const lists = state.boardSlot.lists?.map((l) => (l.id === listSlot.id ? newList : l));
      state.boardSlot = { ...state.boardSlot, lists };
    },

    hidePlaceholderSlot: (state, action: PayloadAction<{ listSlot: IListSlot }>) => {
      const listSlot = action.payload.listSlot;
      const cardSlots = listSlot.cardSlots
        .map((cardSlot) => ({
          ...cardSlot,
          view: !!cardSlot.card,
          position: cardSlot.card?.position || 0,
        }))
        .sort((a, b) => a.position - b.position);
      state.listSlot = { ...listSlot, cardSlots };
      const board = state.boardSlot;
      const list = state.listSlot;
      if (!board || !list) return;
      const listSlots: IListSlot[] = board.lists?.map((l) => (l.id === list.id ? list : l)) || [];
      state.boardSlot = { ...state.boardSlot!, lists: listSlots };
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
  setCardDragged,
  hideCardDragged,
  showPlaceholderSlot,
  hidePlaceholderSlot,
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

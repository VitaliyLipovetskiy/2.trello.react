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
  listDragged?: IListSlot;
  listPlaceholderBeforeId?: number | null;
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

const PLACEHOLDER_POSITION = -1;

const createPlaceholderSlot = (): ICardSlot => ({
  position: PLACEHOLDER_POSITION,
  card: undefined,
  view: false,
});

const convertListToSlot = (list: IList): IListSlot => {
  const cardSlots: ICardSlot[] = list.cards
    .map((card) => ({ position: card.position, card, view: true }))
    .sort((a, b) => a.position - b.position);
  cardSlots.push(createPlaceholderSlot());
  return { id: list.id, title: list.title, position: list.position, cardSlots };
};

const restorePlaceholder = (lists: IListSlot[] | undefined, listId: number): IListSlot[] | undefined => {
  return lists?.map((l) => {
    if (l.id !== listId) return l;
    const restoredCardSlots = l.cardSlots
      .map((s) => ({ ...s, view: !!s.card, position: s.card?.position ?? PLACEHOLDER_POSITION }))
      .sort((a, b) => a.position - b.position);
    return { ...l, cardSlots: restoredCardSlots };
  });
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
      if (action.payload.cardId !== undefined && action.payload.listId !== undefined) {
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
            if (state.boardSlot) {
              state.boardSlot = {
                ...state.boardSlot,
                lists: restorePlaceholder(state.boardSlot.lists, listSlot.id),
              };
            }
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
      if (!state.boardSlot) return;
      state.boardSlot = {
        ...state.boardSlot,
        lists: restorePlaceholder(state.boardSlot.lists, action.payload.listSlot.id),
      };
    },

    addBoard: (state, action: PayloadAction<IBoard>) => {
      state.boards?.push(action.payload);
    },

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
      if (!state.boardSlot?.lists) return;
      state.boardSlot.lists = state.boardSlot.lists.filter((list) => list.id !== action.payload);
    },

    addCard: (state, action: PayloadAction<{ listId: number; card: ICard }>) => {
      if (!state.boardSlot?.lists) return;
      state.boardSlot.lists.forEach((listSlot) => {
        if (listSlot.id === action.payload.listId) {
          const card = action.payload.card;
          const cardSlot: ICardSlot = { position: card.position, card, view: true };
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
      if (state.cardSlot?.card) {
        state.cardSlot.card.title = action.payload.card.title.trim();
        state.cardSlot.card.description = action.payload.card.description?.trim();
      }
    },

    setListDragged: (state, action: PayloadAction<{ listId: number }>) => {
      const list = state.boardSlot?.lists?.find((l) => l.id === action.payload.listId);
      if (!list) return;
      state.listDragged = { ...list, cardSlots: list.cardSlots.slice() };
      list.view = false;
    },

    clearListDragged: (state) => {
      const listDragged = state.listDragged;
      if (listDragged) {
        const list = state.boardSlot?.lists?.find((l) => l.id === listDragged.id);
        if (list) list.view = undefined;
      }
      state.listDragged = undefined;
      state.listPlaceholderBeforeId = undefined;
    },

    showListPlaceholder: (state, action: PayloadAction<{ beforeId: number | null }>) => {
      state.listPlaceholderBeforeId = action.payload.beforeId;
    },

    hideListPlaceholder: (state) => {
      state.listPlaceholderBeforeId = undefined;
    },

    removeCard: (state, action: PayloadAction<{ cardId: number; listId: number }>) => {
      if (!state.boardSlot?.lists) return;
      state.boardSlot.lists.forEach((listSlot) => {
        if (listSlot.id !== action.payload.listId) return;
        listSlot.cardSlots = listSlot.cardSlots.filter((cardSlot) => cardSlot.card?.id !== action.payload.cardId);
      });
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllBoards.rejected, (state, action) => {
        state.error = action.error.message ?? 'Unknown error';
      })
      .addCase(getAllBoards.fulfilled, (state, { payload }) => {
        state.boards = payload.boards;
        state.boardSlot = undefined;
      })
      .addCase(getBoardById.rejected, (state, action) => {
        state.error = action.error.message ?? 'Unknown error';
      })
      .addCase(getBoardById.fulfilled, (state, { payload, meta }) => {
        const lists = payload.lists?.map((list) => convertListToSlot(list));
        state.boardSlot = { ...payload, id: meta.arg, lists };
      });
  },
});

export const {
  setCard,
  clearCard,
  setCardDragged,
  hideCardDragged,
  showPlaceholderSlot,
  hidePlaceholderSlot,
  addBoard,
  removeBoard,
  addList,
  updateList,
  removeList,
  addCard,
  updateCard,
  removeCard,
  setListDragged,
  clearListDragged,
  showListPlaceholder,
  hideListPlaceholder,
} = boardSlice.actions;

const boardReducer = boardSlice.reducer;

export { boardReducer };

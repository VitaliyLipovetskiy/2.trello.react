import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  IBoard,
  IBoardSlot,
  ICard,
  ICardSlot,
  ICardsUpdate,
  ICardUpdate,
  IList,
  IListSlot,
} from '../../common/interfaces';
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

const isListRestored = (list: IListSlot): boolean => {
  return list.cardSlots.every((s) =>
    s.card ? s.view && s.position === s.card.position : !s.view && s.position === PLACEHOLDER_POSITION
  );
};

const restorePlaceholder = (lists: IListSlot[] | undefined, listId: number): IListSlot[] | undefined => {
  return lists?.map((l) => {
    if (l.id !== listId) return l;
    if (isListRestored(l)) return l;
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
      if (!state.boardSlot?.lists) return;
      const position = action.payload.targetPosition;
      const listSlot = state.boardSlot.lists.find((l) => l.id === action.payload.listSlot.id);
      if (!listSlot) return;

      const currentPlaceholder = listSlot.cardSlots.find((s) => !s.card);
      if (currentPlaceholder?.view && currentPlaceholder.position === position) {
        return;
      }

      const draggedCard = state.cardDragged?.card;
      if (draggedCard) {
        const sourceList = state.boardSlot.lists.find((l) =>
          l.cardSlots.some((s) => s.card?.id === draggedCard.id)
        );
        if (sourceList?.id === listSlot.id) {
          const currentPos = draggedCard.position;
          if (position === currentPos || position === currentPos + 1) {
            if (isListRestored(listSlot)) return;
            state.boardSlot.lists = restorePlaceholder(state.boardSlot.lists, listSlot.id);
            return;
          }
        }
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
      newCardSlots.push({ card: undefined, view: true, position });
      newCardSlots.sort((a, b) => a.position - b.position);
      const newList = { ...listSlot, cardSlots: newCardSlots };
      state.boardSlot.lists = state.boardSlot.lists.map((l) => (l.id === listSlot.id ? newList : l));
    },

    hidePlaceholderSlot: (state, action: PayloadAction<{ listSlot: IListSlot }>) => {
      if (!state.boardSlot?.lists) return;
      const listId = action.payload.listSlot.id;
      const listSlot = state.boardSlot.lists.find((l) => l.id === listId);
      if (!listSlot || isListRestored(listSlot)) return;
      state.boardSlot.lists = restorePlaceholder(state.boardSlot.lists, listId);
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
      const nextTitle = action.payload.card.title?.trim();
      if (!nextTitle) return;
      const nextDescription = action.payload.card.description?.trim();
      if (state.boardSlot?.lists) {
        state.boardSlot.lists.forEach((listSlot) => {
          if (listSlot.id !== action.payload.listId) return;
          listSlot.cardSlots.forEach((cardSlot) => {
            if (cardSlot.card?.id !== action.payload.cardId) return;
            cardSlot.card.title = nextTitle;
            cardSlot.card.description = nextDescription;
          });
        });
      }
      if (state.cardSlot?.card) {
        state.cardSlot.card.title = nextTitle;
        state.cardSlot.card.description = nextDescription;
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

    applyCardUpdates: (state, action: PayloadAction<ICardsUpdate[]>) => {
      if (!state.boardSlot?.lists) return;
      const updates = action.payload;
      if (updates.length === 0) return;

      const lists = state.boardSlot.lists;
      const affectedListIds = new Set<number>();

      for (const update of updates) {
        let sourceListIdx = -1;
        let cardSlotIdx = -1;
        for (let i = 0; i < lists.length; i++) {
          const idx = lists[i].cardSlots.findIndex((cs) => cs.card?.id === update.id);
          if (idx !== -1) {
            sourceListIdx = i;
            cardSlotIdx = idx;
            break;
          }
        }
        if (sourceListIdx === -1) continue;

        const sourceList = lists[sourceListIdx];
        const cardSlot = sourceList.cardSlots[cardSlotIdx];
        if (!cardSlot.card) continue;

        cardSlot.card.position = update.position;
        affectedListIds.add(sourceList.id);

        if (update.list_id !== sourceList.id) {
          const targetList = lists.find((l) => l.id === update.list_id);
          if (targetList) {
            sourceList.cardSlots.splice(cardSlotIdx, 1);
            targetList.cardSlots.push(cardSlot);
            affectedListIds.add(targetList.id);
          }
        }
      }

      state.boardSlot.lists = lists.map((l) => {
        if (!affectedListIds.has(l.id)) return l;
        const restoredCardSlots = l.cardSlots
          .map((s) =>
            s.card
              ? { ...s, view: true, position: s.card.position }
              : { ...s, view: false, position: PLACEHOLDER_POSITION }
          )
          .sort((a, b) => a.position - b.position);
        return { ...l, cardSlots: restoredCardSlots };
      });
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllBoards.rejected, (state, action) => {
        state.error = action.payload ?? action.error.message ?? 'Unknown error';
      })
      .addCase(getAllBoards.fulfilled, (state, { payload }) => {
        state.boards = payload.boards;
        state.boardSlot = undefined;
      })
      .addCase(getBoardById.rejected, (state, action) => {
        state.error = action.payload ?? action.error.message ?? 'Unknown error';
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
  applyCardUpdates,
  setListDragged,
  clearListDragged,
  showListPlaceholder,
  hideListPlaceholder,
} = boardSlice.actions;

const boardReducer = boardSlice.reducer;

export { boardReducer };

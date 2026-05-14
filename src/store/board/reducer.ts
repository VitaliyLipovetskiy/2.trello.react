import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IBoardSlot, ICardSlot, ICardsUpdate, ICardUpdate, IList, IListSlot } from '../../common/interfaces';
import { boardApi } from './boardSlice'; // eslint-disable-line import/no-cycle

export interface BoardState {
  boardSlot?: IBoardSlot;
  cardSlot?: ICardSlot;
  listSlot?: IListSlot;
  error: string;
  cardDragged?: ICardSlot;
  listDragged?: IListSlot;
  listPlaceholderBeforeId?: number | null;
}

const initialState: BoardState = {
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

const isListRestored = (list: IListSlot): boolean =>
  list.cardSlots.every((s) =>
    s.card ? s.view && s.position === s.card.position : !s.view && s.position === PLACEHOLDER_POSITION
  );

const restorePlaceholder = (lists: IListSlot[] | undefined, listId: number): IListSlot[] | undefined =>
  lists?.map((l) => {
    if (l.id !== listId) return l;
    if (isListRestored(l)) return l;
    const restoredCardSlots = l.cardSlots
      .map((s) => ({ ...s, view: !!s.card, position: s.card?.position ?? PLACEHOLDER_POSITION }))
      .sort((a, b) => a.position - b.position);
    return { ...l, cardSlots: restoredCardSlots };
  });

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
        const sourceList = state.boardSlot.lists.find((l) => l.cardSlots.some((s) => s.card?.id === draggedCard.id));
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
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
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

    setListDragged: (state, action: PayloadAction<{ listId: number }>) => {
      const list = state.boardSlot?.lists?.find((l) => l.id === action.payload.listId);
      if (!list) return;
      state.listDragged = { ...list, cardSlots: list.cardSlots.slice() };
      list.view = false;
    },

    clearListDragged: (state) => {
      const { listDragged } = state;
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

    applyCardUpdates: (state, action: PayloadAction<ICardsUpdate[]>) => {
      if (!state.boardSlot?.lists) return;
      const updates = action.payload;
      if (updates.length === 0) return;

      const { lists } = state.boardSlot;
      const affectedListIds = new Set<number>();

      updates.forEach((update) => {
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
        if (sourceListIdx === -1) return;

        const sourceList = lists[sourceListIdx];
        const cardSlot = sourceList.cardSlots[cardSlotIdx];
        if (!cardSlot.card) return;

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
      });

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
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(boardApi.endpoints.getBoardById.matchPending, (state) => {
        state.boardSlot = initialState.boardSlot;
      })
      .addMatcher(boardApi.endpoints.getBoardById.matchFulfilled, (state, { payload, meta }) => {
        const lists = payload.lists?.map((list) => convertListToSlot(list));
        state.boardSlot = { ...payload, id: meta.arg.originalArgs, lists };
        state.error = '';
      })
      .addMatcher(boardApi.endpoints.getBoardById.matchRejected, (state, action) => {
        state.error = action.error.message ?? 'Unknown error';
      })
      .addMatcher(boardApi.endpoints.createList.matchFulfilled, (state, { payload, meta }) => {
        if (!state.boardSlot?.lists) return;
        const { data } = meta.arg.originalArgs;
        state.boardSlot.lists.push(
          convertListToSlot({ id: payload.id, title: data.title, position: data.position, cards: [] })
        );
      })
      .addMatcher(boardApi.endpoints.removeListById.matchFulfilled, (state, { meta }) => {
        if (!state.boardSlot?.lists) return;
        const { listId } = meta.arg.originalArgs;
        const idx = state.boardSlot.lists.findIndex((l) => l.id === listId);
        if (idx !== -1) state.boardSlot.lists.splice(idx, 1);
      })
      .addMatcher(boardApi.endpoints.createCard.matchFulfilled, (state, { payload, meta }) => {
        if (!state.boardSlot?.lists) return;
        const { data } = meta.arg.originalArgs;
        const list = state.boardSlot.lists.find((l) => l.id === data.list_id);
        if (!list) return;
        list.cardSlots.push({
          position: data.position,
          view: true,
          card: {
            id: payload.id,
            title: data.title,
            position: data.position,
            users: [],
            ...(data.description && { description: data.description }),
            ...(data.custom && { custom: data.custom }),
          },
        });
      })
      .addMatcher(boardApi.endpoints.removeCardById.matchFulfilled, (state, { meta }) => {
        if (!state.boardSlot?.lists) return;
        const { cardId } = meta.arg.originalArgs;
        state.boardSlot.lists.forEach((list) => {
          const idx = list.cardSlots.findIndex((s) => s.card?.id === cardId);
          if (idx !== -1) list.cardSlots.splice(idx, 1);
        });
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
  applyCardUpdates,
  updateCard,
  setListDragged,
  clearListDragged,
  showListPlaceholder,
  hideListPlaceholder,
} = boardSlice.actions;

const boardReducer = boardSlice.reducer;

export { boardReducer };

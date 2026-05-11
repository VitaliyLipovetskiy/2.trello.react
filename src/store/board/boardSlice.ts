import { createApi } from '@reduxjs/toolkit/query/react';
import {
  IBoard,
  IBoardUpdate,
  ICardCreate,
  ICardsUpdate,
  ICardUpdate,
  IListCreate,
  IListUpdate,
  IListsUpdate,
  IResult,
  IResultCreated,
} from '../../common/interfaces';
import { baseQueryWithReauth } from '../auth/baseQueryWithReauth';

export const boardApi = createApi({
  reducerPath: 'boardApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Board'],
  endpoints: (builder) => ({
    getAllBoards: builder.query<{ boards: IBoard[] }, void>({
      query: () => ({ url: 'board' }),
      providesTags: ['Board'],
    }),

    getBoardById: builder.query<IBoard, number>({
      query: (id) => ({ url: `board/${id}` }),
      providesTags: (_result, _error, id) => [{ type: 'Board', id }],
      keepUnusedDataFor: 0,
    }),

    createBoard: builder.mutation<IResultCreated, string>({
      query: (title) => ({ url: 'board', method: 'POST', body: { title } }),
      async onQueryStarted(title, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(
            boardApi.util.updateQueryData('getAllBoards', undefined, (draft) => {
              draft.boards.push({ id: data.id, title, lists: [] });
            })
          );
        } catch {
          // network error — no cache update needed
        }
      },
    }),

    updateBoardById: builder.mutation<IResult, { id: number; data: IBoardUpdate }>({
      query: ({ id, data }) => ({ url: `board/${id}`, method: 'PUT', body: data }),
      async onQueryStarted({ id, data }, { dispatch, queryFulfilled }) {
        const patchSingle = dispatch(
          boardApi.util.updateQueryData('getBoardById', id, (draft) => {
            Object.assign(draft, data);
          })
        );
        const patchList = dispatch(
          boardApi.util.updateQueryData('getAllBoards', undefined, (draft) => {
            const board = draft.boards.find((b) => b.id === id);
            if (board) {
              Object.assign(board, data);
            }
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchSingle.undo();
          patchList.undo();
        }
      },
    }),

    removeBoardById: builder.mutation<IResult, number>({
      query: (id) => ({ url: `board/${id}`, method: 'DELETE' }),
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          boardApi.util.updateQueryData('getAllBoards', undefined, (draft) => {
            const idx = draft.boards.findIndex((b) => b.id === id);
            if (idx !== -1) draft.boards.splice(idx, 1);
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
    }),

    createList: builder.mutation<IResultCreated, { boardId: number; data: IListCreate }>({
      query: ({ boardId, data }) => ({ url: `board/${boardId}/list`, method: 'POST', body: data }),
    }),

    updateListById: builder.mutation<IResult, { boardId: number; listId: number; data: IListUpdate }>({
      query: ({ boardId, listId, data }) => ({ url: `board/${boardId}/list/${listId}`, method: 'PUT', body: data }),
      async onQueryStarted({ boardId, listId, data }, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          boardApi.util.updateQueryData('getBoardById', boardId, (draft) => {
            const list = draft.lists.find((l) => l.id === listId);
            if (list) Object.assign(list, data);
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
    }),

    removeListById: builder.mutation<IResult, { boardId: number; listId: number }>({
      query: ({ boardId, listId }) => ({ url: `board/${boardId}/list/${listId}`, method: 'DELETE' }),
    }),

    createCard: builder.mutation<IResultCreated, { boardId: number; data: ICardCreate }>({
      query: ({ boardId, data }) => ({ url: `board/${boardId}/card`, method: 'POST', body: data }),
    }),

    updateCardById: builder.mutation<IResult, { boardId: number; cardId: number; data: ICardUpdate }>({
      query: ({ boardId, cardId, data }) => ({ url: `board/${boardId}/card/${cardId}`, method: 'PUT', body: data }),
      async onQueryStarted({ boardId, cardId, data }, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          boardApi.util.updateQueryData('getBoardById', boardId, (draft) => {
            const card = draft.lists.flatMap((list) => list.cards).find((c) => c.id === cardId);
            if (card) Object.assign(card, data);
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
    }),

    updateGroupCards: builder.mutation<IResult, { boardId: number; data: ICardsUpdate[] }>({
      query: ({ boardId, data }) => ({ url: `board/${boardId}/card`, method: 'PUT', body: data }),
      invalidatesTags: (_result, _error, { boardId }) => [{ type: 'Board', id: boardId }],
    }),

    updateGroupLists: builder.mutation<IResult, { boardId: number; data: IListsUpdate[] }>({
      query: ({ boardId, data }) => ({ url: `board/${boardId}/list`, method: 'PUT', body: data }),
      invalidatesTags: (_result, _error, { boardId }) => [{ type: 'Board', id: boardId }],
    }),

    removeCardById: builder.mutation<IResult, { boardId: number; cardId: number }>({
      query: ({ boardId, cardId }) => ({ url: `board/${boardId}/card/${cardId}`, method: 'DELETE' }),
    }),
  }),
});

export const {
  useGetAllBoardsQuery,
  useGetBoardByIdQuery,
  useCreateBoardMutation,
  useUpdateBoardByIdMutation,
  useRemoveBoardByIdMutation,
  useCreateListMutation,
  useUpdateListByIdMutation,
  useRemoveListByIdMutation,
  useCreateCardMutation,
  useUpdateCardByIdMutation,
  useUpdateGroupCardsMutation,
  useUpdateGroupListsMutation,
  useRemoveCardByIdMutation,
} = boardApi;

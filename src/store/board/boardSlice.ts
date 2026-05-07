import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { api } from '../../common/constants';
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

export const boardApi = createApi({
  reducerPath: 'boardApi',
  baseQuery: fetchBaseQuery({
    baseUrl: api.baseURL,
    prepareHeaders: (headers) => {
      headers.set('Content-Type', 'application/json');
      headers.set('Authorization', `Bearer ${process.env.REACT_APP_API_TOKEN ?? '123'}`);
      return headers;
    },
  }),
  tagTypes: ['Board'],
  endpoints: (builder) => ({
    getAllBoards: builder.query<{ boards: IBoard[] }, void>({
      query: () => ({ url: 'board' }),
      providesTags: ['Board'],
    }),

    getBoardById: builder.query<IBoard, number>({
      query: (id) => ({ url: `board/${id}` }),
      providesTags: (_result, _error, id) => [{ type: 'Board', id }],
    }),

    createBoard: builder.mutation<IResultCreated, string>({
      query: (title) => ({ url: 'board', method: 'POST', body: { title } }),
      invalidatesTags: ['Board'],
    }),

    updateBoardById: builder.mutation<IResult, { id: number; data: IBoardUpdate }>({
      query: ({ id, data }) => ({ url: `board/${id}`, method: 'PUT', body: data }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Board', id }],
    }),

    removeBoardById: builder.mutation<IResult, number>({
      query: (id) => ({ url: `board/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Board'],
    }),

    createList: builder.mutation<IResultCreated, { boardId: number; data: IListCreate }>({
      query: ({ boardId, data }) => ({ url: `board/${boardId}/list`, method: 'POST', body: data }),
      invalidatesTags: (_result, _error, { boardId }) => [{ type: 'Board', id: boardId }],
    }),

    updateListById: builder.mutation<IResult, { boardId: number; listId: number; data: IListUpdate }>({
      query: ({ boardId, listId, data }) => ({ url: `board/${boardId}/list/${listId}`, method: 'PUT', body: data }),
      invalidatesTags: (_result, _error, { boardId }) => [{ type: 'Board', id: boardId }],
    }),

    removeListById: builder.mutation<IResult, { boardId: number; listId: number }>({
      query: ({ boardId, listId }) => ({ url: `board/${boardId}/list/${listId}`, method: 'DELETE' }),
      invalidatesTags: (_result, _error, { boardId }) => [{ type: 'Board', id: boardId }],
    }),

    createCard: builder.mutation<IResultCreated, { boardId: number; data: ICardCreate }>({
      query: ({ boardId, data }) => ({ url: `board/${boardId}/card`, method: 'POST', body: data }),
      invalidatesTags: (_result, _error, { boardId }) => [{ type: 'Board', id: boardId }],
    }),

    updateCardById: builder.mutation<IResult, { boardId: number; cardId: number; data: ICardUpdate }>({
      query: ({ boardId, cardId, data }) => ({ url: `board/${boardId}/card/${cardId}`, method: 'PUT', body: data }),
      invalidatesTags: (_result, _error, { boardId }) => [{ type: 'Board', id: boardId }],
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
      invalidatesTags: (_result, _error, { boardId }) => [{ type: 'Board', id: boardId }],
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

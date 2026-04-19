import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { api } from '../../common/constants';
import { IBoard } from '../../common/interfaces';

export const boardApi = createApi({
  reducerPath: 'boardApi',
  baseQuery: fetchBaseQuery({
    baseUrl: api.baseURL,
    prepareHeaders: (headers) => {
      headers.set('Content-Type', 'application/json');
      headers.set('Authorization', `Bearer ${process.env.REACT_APP_API_TOKEN ?? ''}`);
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getAllBoards: builder.query<{ boards: IBoard[] }, void>({
      query: () => ({ url: 'board' }),
    }),
  }),
});

export const { useGetAllBoardsQuery } = boardApi;

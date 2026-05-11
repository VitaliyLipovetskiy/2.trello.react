import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { IAuthRequest, IAuthResponse, IResultCreated } from '../../common/interfaces';
import { api } from '../../common/constants';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: api.baseURL,
    prepareHeaders: (headers) => {
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  endpoints: (builder) => ({
    signup: builder.mutation<IResultCreated, IAuthRequest>({
      query: (body) => ({ url: 'user', method: 'POST', body }),
    }),

    signin: builder.mutation<IAuthResponse, IAuthRequest>({
      query: (body) => ({ url: 'login', method: 'POST', body }),
    }),
  }),
});

export const { useSignupMutation, useSigninMutation } = authApi;

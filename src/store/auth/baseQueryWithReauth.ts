import { BaseQueryFn, FetchArgs, fetchBaseQuery, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import { api } from '../../common/constants';
import { IAuthResponse } from '../../common/interfaces';
import { isTokenValid } from '../../common/utils/isTokenValid';
import { logout, setCredentials } from './authSlice';

type AuthStateSlice = { auth: { token: string | null; refreshToken: string | null } };

const rawBaseQuery = fetchBaseQuery({
  baseUrl: api.baseURL,
  prepareHeaders: (headers, { getState }) => {
    headers.set('Content-Type', 'application/json');
    const { token } = (getState() as AuthStateSlice).auth;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

let refreshPromise: Promise<void> | null = null;

export const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  queryApi,
  extraOptions
) => {
  const { token, refreshToken } = (queryApi.getState() as AuthStateSlice).auth;

  if (!isTokenValid(token)) {
    if (!isTokenValid(refreshToken)) {
      queryApi.dispatch(logout());
      return { error: { status: 401, data: 'Unauthorized' } as FetchBaseQueryError };
    }
    if (!refreshPromise) {
      const refreshBaseQuery = fetchBaseQuery({ baseUrl: api.baseURL });
      refreshPromise = Promise.resolve(
        refreshBaseQuery({ url: 'refresh', method: 'POST', body: { refreshToken } }, queryApi, extraOptions)
      )
        .then((refreshResult) => {
          if (refreshResult.data) {
            queryApi.dispatch(setCredentials(refreshResult.data as IAuthResponse));
          } else {
            queryApi.dispatch(logout());
          }
        })
        .finally(() => {
          refreshPromise = null;
        });
    }
    await refreshPromise;
  }

  return rawBaseQuery(args, queryApi, extraOptions);
};

import { BaseQueryFn, FetchArgs, fetchBaseQuery, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import { jwtDecode } from 'jwt-decode';
import { api } from '../../common/constants';
import { IAuthResponse } from '../../common/interfaces';
import { logout, setCredentials } from './authSlice';

type AuthStateSlice = { auth: { token: string | null; refreshToken: string | null } };

const isTokenValid = (token: string | null): boolean => {
  if (!token) return false;
  try {
    const decoded = jwtDecode(token);
    return decoded.exp !== undefined && decoded.exp > Date.now() / 1000;
  } catch {
    return false;
  }
};

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

export const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  queryApi,
  extraOptions
) => {
  const { token, refreshToken } = (queryApi.getState() as AuthStateSlice).auth;

  if (!isTokenValid(token) && refreshToken) {
    const refreshBaseQuery = fetchBaseQuery({ baseUrl: api.baseURL });
    const refreshResult = await refreshBaseQuery(
      { url: 'refresh', method: 'POST', body: { refreshToken } },
      queryApi,
      extraOptions
    );

    if (refreshResult.data) {
      queryApi.dispatch(setCredentials(refreshResult.data as IAuthResponse));
    } else {
      queryApi.dispatch(logout());
    }
  }

  return rawBaseQuery(args, queryApi, extraOptions);
};

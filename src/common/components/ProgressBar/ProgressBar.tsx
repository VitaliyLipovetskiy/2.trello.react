import React, { JSX, useEffect, useState } from 'react';
import api from '../../../api/request';
import s from './progress-bar.module.scss';

export const ProgressBar = ({ children }: { children: React.ReactNode }): JSX.Element => {
  const [pending, setPending] = useState(0);

  useEffect(() => {
    const requestInterceptor = api.interceptors.request.use(
      (config) => {
        setPending((c) => c + 1);
        return config;
      },
      (error) => Promise.reject(error)
    );
    const responseInterceptor = api.interceptors.response.use(
      (config) => {
        setPending((c) => c - 1);
        return config;
      },
      (error) => {
        setPending((c) => c - 1);
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.request.eject(requestInterceptor);
      api.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  return (
    <>
      {pending > 0 && <div className={s.loader} />}
      {children}
    </>
  );
};

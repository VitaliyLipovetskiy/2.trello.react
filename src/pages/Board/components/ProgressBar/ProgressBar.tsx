import React, { useEffect, useState } from 'react';
import api from '../../../../api/request';
import './progress-bar.scss';

export const ProgressBar = ({ children }: { children: React.ReactNode }) => {
  const [showProgressBar, setShowProgressBar] = useState<boolean>(false);

  useEffect(() => {
    const requestInterceptor = api.interceptors.request.use(
      (config) => {
        setShowProgressBar(true);
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
    const responseInterceptor = api.interceptors.response.use(
      (config) => {
        setShowProgressBar(false);
        return config;
      },
      (error) => {
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
      {showProgressBar && <div className="loader"></div>}
      {children}
    </>
  );
};

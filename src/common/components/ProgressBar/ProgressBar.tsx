import React, { JSX } from 'react';
import { QueryStatus } from '@reduxjs/toolkit/query/react';
import { useAppSelector } from '../../../store/hooks';
import s from './progress-bar.module.scss';

export const ProgressBar = ({ children }: { children: React.ReactNode }): JSX.Element => {
  const pending = useAppSelector((state) => {
    const queries = Object.values(state.boardApi.queries);
    const mutations = Object.values(state.boardApi.mutations);
    return (
      queries.some((q) => q?.status === QueryStatus.pending) || mutations.some((m) => m?.status === QueryStatus.pending)
    );
  });

  return (
    <>
      {pending && <div className={s.loader} />}
      {children}
    </>
  );
};

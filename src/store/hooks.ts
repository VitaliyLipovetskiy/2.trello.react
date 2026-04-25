import { TypedUseSelectorHook, useDispatch, useSelector, useStore } from 'react-redux';
import { Store } from '@reduxjs/toolkit';
import { AppDispatch, RootState } from './store';

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export const useAppStore: () => Store<RootState> = useStore;

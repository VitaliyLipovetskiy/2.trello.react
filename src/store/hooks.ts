import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from './store';

// export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppDispatch: () => AppDispatch = useDispatch;
// export const useAppSelector = useSelector.withTypes<RootState>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

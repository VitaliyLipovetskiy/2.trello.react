import { createAsyncThunk } from '@reduxjs/toolkit';
import { ActionType } from './common';
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
import { AsyncThunkConfig } from '../store';

type AxiosLikeError = {
  isAxiosError?: boolean;
  response?: { data?: { message?: string; error?: string } };
  message?: string;
};

const extractErrorMessage = (error: unknown): string => {
  const e = error as AxiosLikeError | undefined;
  if (e?.isAxiosError) {
    return e.response?.data?.message ?? e.response?.data?.error ?? e.message ?? 'Unknown error';
  }
  if (error instanceof Error) return error.message;
  return 'Unknown error';
};

type ThunkConfigWithReject = AsyncThunkConfig & { rejectValue: string };

const getAllBoards = createAsyncThunk<{ boards: IBoard[] }, void, ThunkConfigWithReject>(
  ActionType.GET_ALL_BOARDS,
  async (_, { extra, rejectWithValue }) => {
    try {
      return await extra.api.get('board');
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

const getBoardById = createAsyncThunk<IBoard, number, ThunkConfigWithReject>(
  ActionType.GET_BOARD_BY_ID,
  async (payload, { extra, rejectWithValue }) => {
    try {
      return await extra.api.get(`board/${payload}`);
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

const createBoard = createAsyncThunk<IResultCreated, string, ThunkConfigWithReject>(
  ActionType.CREATE_BOARD,
  async (payload, { extra, rejectWithValue }) => {
    try {
      return await extra.api.post('board', { title: payload });
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

const updateBoardById = createAsyncThunk<IResult, { id: number; data: IBoardUpdate }, ThunkConfigWithReject>(
  ActionType.UPDATE_BOARD,
  async (payload, { extra, rejectWithValue }) => {
    try {
      return await extra.api.put(`board/${payload.id}`, payload.data);
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

const removeBoardById = createAsyncThunk<IResult, number, ThunkConfigWithReject>(
  ActionType.REMOVE_BOARD,
  async (payload, { extra, rejectWithValue }) => {
    try {
      return await extra.api.delete(`board/${payload}`);
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

const createList = createAsyncThunk<IResultCreated, { boardId: number; data: IListCreate }, ThunkConfigWithReject>(
  ActionType.CREATE_LIST,
  async (payload, { extra, rejectWithValue }) => {
    try {
      return await extra.api.post(`board/${payload.boardId}/list`, payload.data);
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

const updateListById = createAsyncThunk<
  IResult,
  { boardId: number; listId: number; data: IListUpdate },
  ThunkConfigWithReject
>(ActionType.UPDATE_LIST, async (payload, { extra, rejectWithValue }) => {
  try {
    return await extra.api.put(`board/${payload.boardId}/list/${payload.listId}`, payload.data);
  } catch (error) {
    return rejectWithValue(extractErrorMessage(error));
  }
});

const removeListById = createAsyncThunk<IResult, { boardId: number; listId: number }, ThunkConfigWithReject>(
  ActionType.REMOVE_LIST,
  async (payload, { extra, rejectWithValue }) => {
    try {
      return await extra.api.delete(`board/${payload.boardId}/list/${payload.listId}`);
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

const createCard = createAsyncThunk<IResultCreated, { id: number; data: ICardCreate }, ThunkConfigWithReject>(
  ActionType.CREATE_CARD,
  async (payload, { extra, rejectWithValue }) => {
    try {
      return await extra.api.post(`board/${payload.id}/card`, payload.data);
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

const updateCardById = createAsyncThunk<
  IResult,
  { boardId: number; cardId: number; data: ICardUpdate },
  ThunkConfigWithReject
>(ActionType.UPDATE_CARD, async (payload, { extra, rejectWithValue }) => {
  try {
    return await extra.api.put(`board/${payload.boardId}/card/${payload.cardId}`, payload.data);
  } catch (error) {
    return rejectWithValue(extractErrorMessage(error));
  }
});

const updateGroupCards = createAsyncThunk<IResult, { boardId: number; data: ICardsUpdate[] }, ThunkConfigWithReject>(
  ActionType.UPDATE_GROUP_CARDS,
  async (payload, { extra, rejectWithValue }) => {
    try {
      return await extra.api.put(`board/${payload.boardId}/card`, payload.data);
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

const updateGroupLists = createAsyncThunk<IResult, { boardId: number; data: IListsUpdate[] }, ThunkConfigWithReject>(
  ActionType.UPDATE_GROUP_LISTS,
  async (payload, { extra, rejectWithValue }) => {
    try {
      return await extra.api.put(`board/${payload.boardId}/list`, payload.data);
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

const removeCardById = createAsyncThunk<IResult, { boardId: number; cardId: number }, ThunkConfigWithReject>(
  ActionType.REMOVE_CARD,
  async (payload, { extra, rejectWithValue }) => {
    try {
      return await extra.api.delete(`board/${payload.boardId}/card/${payload.cardId}`);
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export {
  getAllBoards,
  getBoardById,
  createBoard,
  updateBoardById,
  removeBoardById,
  createList,
  updateListById,
  removeListById,
  createCard,
  updateCardById,
  updateGroupCards,
  updateGroupLists,
  removeCardById,
};
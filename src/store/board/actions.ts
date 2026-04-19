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

const getAllBoards = createAsyncThunk<{ boards: IBoard[] }, void, AsyncThunkConfig>(
  ActionType.GET_ALL_BOARDS,
  async (_, { extra }) => {
    const { api } = extra;
    return api.get('board');
  }
);

const getBoardById = createAsyncThunk<IBoard, number, AsyncThunkConfig>(
  ActionType.GET_BOARD_BY_ID,
  async (payload, { extra }) => {
    const { api } = extra;
    return api.get(`board/${payload}`);
  }
);

const createBoard = createAsyncThunk<IResultCreated, string, AsyncThunkConfig>(
  ActionType.CREATE_BOARD,
  async (payload, { extra }) => {
    const { api } = extra;
    return api.post('board', { title: payload });
  }
);

const updateBoardById = createAsyncThunk<IResult, { id: number; data: IBoardUpdate }, AsyncThunkConfig>(
  ActionType.UPDATE_BOARD,
  async (payload, { extra }) => {
    const { api } = extra;
    return api.put(`board/${payload.id}`, payload.data);
  }
);

const removeBoardById = createAsyncThunk<IResult, number, AsyncThunkConfig>(
  ActionType.REMOVE_BOARD,
  async (payload, { extra }) => {
    const { api } = extra;
    return api.delete(`board/${payload}`);
  }
);

const createList = createAsyncThunk<IResultCreated, { boardId: number; data: IListCreate }, AsyncThunkConfig>(
  ActionType.CREATE_LIST,
  async (payload, { extra }) => {
    const { api } = extra;
    return api.post(`board/${payload.boardId}/list`, payload.data);
  }
);

const updateListById = createAsyncThunk<
  IResult,
  { boardId: number; listId: number; data: IListUpdate },
  AsyncThunkConfig
>(ActionType.UPDATE_LIST, async (payload, { extra }) => {
  const { api } = extra;
  return api.put(`board/${payload.boardId}/list/${payload.listId}`, payload.data);
});

const removeListById = createAsyncThunk<IResult, { boardId: number; listId: number }, AsyncThunkConfig>(
  ActionType.REMOVE_LIST,
  async (payload, { extra }) => {
    const { api } = extra;
    return api.delete(`board/${payload.boardId}/list/${payload.listId}`);
  }
);

const createCard = createAsyncThunk<IResultCreated, { id: number; data: ICardCreate }, AsyncThunkConfig>(
  ActionType.CREATE_CARD,
  async (payload, { extra }) => {
    const { api } = extra;
    return api.post(`board/${payload.id}/card`, payload.data);
  }
);

const updateCardById = createAsyncThunk<
  IResult,
  { boardId: number; cardId: number; data: ICardUpdate },
  AsyncThunkConfig
>(ActionType.UPDATE_CARD, async (payload, { extra }) => {
  const { api } = extra;
  return api.put(`board/${payload.boardId}/card/${payload.cardId}`, payload.data);
});

const updateGroupCards = createAsyncThunk<IResult, { boardId: number; data: ICardsUpdate[] }, AsyncThunkConfig>(
  ActionType.UPDATE_GROUP_CARDS,
  async (payload, { extra }) => {
    const { api } = extra;
    return api.put(`board/${payload.boardId}/card`, payload.data);
  }
);

const updateGroupLists = createAsyncThunk<IResult, { boardId: number; data: IListsUpdate[] }, AsyncThunkConfig>(
  ActionType.UPDATE_GROUP_LISTS,
  async (payload, { extra }) => {
    const { api } = extra;
    return api.put(`board/${payload.boardId}/list`, payload.data);
  }
);

const removeCardById = createAsyncThunk<IResult, { boardId: number; cardId: number }, AsyncThunkConfig>(
  ActionType.REMOVE_CARD,
  async (payload, { extra }) => {
    const { api } = extra;
    return api.delete(`board/${payload.boardId}/card/${payload.cardId}`);
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
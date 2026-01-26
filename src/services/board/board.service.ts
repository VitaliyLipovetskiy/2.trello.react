import api from '../../api/request';
import {
  IBoard,
  ICreateCard,
  ICreateList,
  IResult,
  IResultCreated,
  IUpdateBoard,
  IUpdateCard,
  IUpdateList,
} from '../../common/interfaces';

const getAllBoards = () => {
  return api.get<any, { boards: IBoard[] }, any>('board');
};

const getBoardById = async (id: number) => {
  return await api.get<any, IBoard, any>(`board/${id}`);
};

const createBoard = async (title: string) => {
  return await api.post<any, IResultCreated, any>('board', { title });
};

const updateBoardById = async (id: number, data: IUpdateBoard) => {
  return await api.put<any, IResult, any>(`board/${id}`, data);
};

const removeBoardById = async (id: number) => {
  return await api.delete<any, IResult, any>(`board/${id}`);
};

const createList = async (id: number, data: ICreateList) => {
  return await api.post<any, IResult, any>(`board/${id}/list`, data);
};

const updateListById = async (boardId: number, listId: number, data: IUpdateList) => {
  return await api.put<any, IResult, any>(`board/${boardId}/list/${listId}`, data);
};

const removeListById = async (boardId: number, listId: number) => {
  return await api.delete<any, IResult, any>(`board/${boardId}/list/${listId}`);
};

const createCard = async (boardId: number, data: ICreateCard) => {
  return await api.post<any, IResultCreated, any>(`board/${boardId}/card`, data);
};

const updateCardById = async (boardId: number, cardId: number, data: IUpdateCard) => {
  return await api.put<any, IResult, any>(`board/${boardId}/card/${cardId}`, data);
};

const removeCardById = async (boardId: number, cardId: number) => {
  return await api.delete<any, IResult, any>(`board/${boardId}/card/${cardId}`);
};

const boardService = {
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
  removeCardById,
};

export default boardService;

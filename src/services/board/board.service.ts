import api from '../../api/request';
import {IBoard, IResult, IResultCreated} from "../../common/interfaces";

export const getAllBoards = () => {
    return api.get<any, { boards: IBoard[] }, any>('board');
}

export const getBoardById = async (id: number) => {
    return await api.get<any, IBoard, any>(`board/${id}`);
}

export const createBoard = async (title: string) => {
    return await api.post<any, IResultCreated, any>('board', {title});
}

export const updateBoard = async (id: number, title: string) => {
    return await api.put<any, IResult, any>(`board/${id}`, {title});
}

export const createList = async (id: number, title: string, position: number) => {
    return await api.post<any, IResult, any>(`board/${id}/list`, {title, position});
}

export const updateGroupLists = async (boardId: number, lists: {id: number, position: number}[]) => {
    return await api.put<any, IResult, any>(`board/${boardId}/list`, lists);
}

export const updateListById = async (boardId: number, listId: number, list: {title?: string, position?: number}) => {
    return await api.put<any, IResult, any>(`board/${boardId}/list/${listId}`, list);
}
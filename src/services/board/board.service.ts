import api from '../../api/request';
import {
    IBoard,
    ICreateCard,
    ICreateList,
    IResult,
    IResultCreated,
    IUpdateCard,
    IUpdateList
} from "../../common/interfaces";

export const getAllBoards = () => {
    return api.get<any, { boards: IBoard[] }, any>('board');
}

export const getBoardById = async (id: number) => {
    return await api.get<any, IBoard, any>(`board/${id}`);
}

export const createBoard = async (title: string) => {
    return await api.post<any, IResultCreated, any>('board', {title});
}

export const updateBoardById = async (id: number, title: string) => {
    return await api.put<any, IResult, any>(`board/${id}`, {title});
}

export const createList = async (id: number, data: ICreateList) => {
    return await api.post<any, IResult, any>(`board/${id}/list`, data);
}

// export const updateGroupLists = async (boardId: number, data: {id: number, position: number}[]) => {
//     return await api.put<any, IResult, any>(`board/${boardId}/list`, data);
// }

export const updateListById = async (boardId: number, listId: number, data: IUpdateList) => {
    return await api.put<any, IResult, any>(`board/${boardId}/list/${listId}`, data);
}

export const createCard = async (boardId: number, data: ICreateCard) => {
    return await api.post<any, IResultCreated, any>(`board/${boardId}/card`, data);
}

export const updateCardById = async (boardId: number, cardId: number, data: IUpdateCard) => {
    return await api.put<any, IResult, any>(`board/${boardId}/card/${cardId}`, data);
}
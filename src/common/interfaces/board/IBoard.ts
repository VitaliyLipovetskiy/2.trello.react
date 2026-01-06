import {IBoardList} from "./IBoardList";

export interface IBoard {
    id: number,
    title: string,
    custom?: {
        background: string
    },
    lists: IBoardList[],
}
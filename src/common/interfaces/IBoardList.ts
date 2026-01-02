import {ICard} from "./ICard";

export interface IBoardList {
    id: number,
    title: string,
    cards: ICard[],
}
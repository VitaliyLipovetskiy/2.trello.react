import {ICard} from "../card/ICard";

export interface IBoardList {
    id: number,
    title: string,
    position: number,
    cards: ICard[],
}
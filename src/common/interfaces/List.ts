import { ICard, ICardSlot } from './Card';

export interface IList {
  id: number;
  title: string;
  position: number;
  cards: ICard[];
}

export interface IListSlot {
  id: number;
  title: string;
  position: number;
  cardSlots: ICardSlot[];
  view?: boolean;
}

export interface IListsUpdate {
  id: number;
  position: number;
}

export interface IListCreate {
  title: string;
  position: number;
}

export interface IListUpdate {
  title?: string;
  position?: number;
}

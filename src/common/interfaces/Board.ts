import { IList } from './List';

export interface IBoard {
  id: number;
  title: string;
  custom?: {
    background: string;
  };
  lists: IList[];
}

export interface IBoards {
  boards: IBoard[];
}

export interface IBoardUpdate {
  title: string;
  custom?: {
    background: string;
  };
}

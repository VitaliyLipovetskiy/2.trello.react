export interface ICreateCard {
  title: string;
  list_id: number;
  position: number;
  description?: string;
  custom?: {
    deadline: string;
  };
}

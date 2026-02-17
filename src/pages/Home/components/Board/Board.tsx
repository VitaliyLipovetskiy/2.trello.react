import React from 'react';
import { IBoard } from '../../../../common/interfaces';
import { Tooltip } from 'react-tooltip';
import { toast } from 'react-toastify';
import { removeBoard } from '../../../../store/board/reducer';
import { useAppDispatch } from '../../../../store/hooks';
import { boardAction } from '../../../../store/actions';
import s from './board.module.scss';

export const Board = ({ board }: { board: IBoard }) => {
  const dispatch = useAppDispatch();

  const handleClickRemoveBoard = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      const { result } = await dispatch(boardAction.removeBoardById(board.id)).unwrap();
      if (result === 'Deleted') {
        dispatch(removeBoard(board.id));
        toast.success(`Дошка ${board.title} видалена успішно`);
      } else {
        console.log(`Дошка ${board.title} не видалена`);
        toast.error(`Дошка ${board.title} не видалена`);
      }
    } catch (error) {
      console.log(error);
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };

  return (
    <div className={s.board} style={{ background: board.custom?.background }}>
      <h4>{board.title}</h4>
      <button className={s.btn__remove} data-tooltip-id="tooltip-remove-board" onClick={handleClickRemoveBoard}>
        <span></span>
        <span></span>
      </button>
      <Tooltip id="tooltip-remove-board" className={s.tooltip} content="Видалити дошку!" place="left" />
    </div>
  );
};

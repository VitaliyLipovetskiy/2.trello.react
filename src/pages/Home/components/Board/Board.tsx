import React from 'react';
import { IBoard } from '../../../../common/interfaces';
import { Tooltip } from 'react-tooltip';
import s from './board.module.scss';

interface BoardProps {
  board: IBoard;
  handleRemoveBoard: (e: React.MouseEvent, board: IBoard) => void;
}

export const Board = ({ board, handleRemoveBoard }: BoardProps) => {
  return (
    <div className={s.board} style={{ background: board.custom?.background }}>
      <h4>{board.title}</h4>
      <button
        data-tooltip-id="tooltip-remove-board"
        className={s.btn__remove}
        onClick={(event) => handleRemoveBoard(event, board)}
      ></button>
      <Tooltip id="tooltip-remove-board" className={s.tooltip} content="Видалити дошку!" place="left" />
    </div>
  );
};

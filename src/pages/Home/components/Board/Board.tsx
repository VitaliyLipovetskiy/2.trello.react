import React, { JSX } from 'react';
import { Tooltip } from 'react-tooltip';
import { IBoard } from '../../../../common/interfaces';
import { useRemoveBoardByIdMutation } from '../../../../store/board/boardSlice';
import { ConfirmModal, useConfirm } from '../../../../common/components';
import { dispatchWithToast } from '../../../../common/utils/dispatchWithToast';
import s from './board.module.scss';

export const Board = ({ board }: { board: IBoard }): JSX.Element => {
  const [removeBoardById] = useRemoveBoardByIdMutation();
  const { confirm, confirmState, handleConfirm, handleCancel } = useConfirm();

  const handleClickRemoveBoard = async (e: React.MouseEvent): Promise<void> => {
    e.preventDefault();
    const confirmed = await confirm(`Видалити дошку «${board.title}»?`);
    if (!confirmed) return;
    await dispatchWithToast(
      removeBoardById(board.id).unwrap(),
      'Deleted',
      `Дошка ${board.title} видалена успішно`,
      `Дошка ${board.title} не видалена`
    );
  };

  return (
    <div className={s.board} style={{ background: board.custom?.background }}>
      <h4>{board.title}</h4>
      <button
        aria-label="Видалити дошку"
        className={s.btn__remove}
        data-tooltip-id={`tooltip-remove-board-${board.id}`}
        onClick={handleClickRemoveBoard}
      >
        <span />
        <span />
      </button>
      <Tooltip id={`tooltip-remove-board-${board.id}`} className={s.tooltip} content="Видалити дошку!" place="left" />
      {confirmState.isOpen && (
        <ConfirmModal message={confirmState.message} onConfirm={handleConfirm} onCancel={handleCancel} />
      )}
    </div>
  );
};

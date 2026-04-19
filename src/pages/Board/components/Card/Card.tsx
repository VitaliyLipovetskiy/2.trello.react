import React from 'react';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { setCard } from '../../../../store/board/reducer';
import s from './card.module.scss';
import { Link } from 'react-router-dom';

export const Card = ({ listId, cardId }: { listId: number; cardId?: number }) => {
  const dispatch = useAppDispatch();
  const { boardSlot } = useAppSelector((state) => state.board);
  const cardSlot = boardSlot?.lists
    ?.find((list) => list.id === listId)
    ?.cardSlots.find((cardSlot) => cardSlot.card?.id === cardId);

  const handleClickCard = (e: React.MouseEvent<HTMLInputElement>) => {
    const listSlot = boardSlot?.lists?.find((list) => list.id === listId);
    dispatch(setCard({ cardSlot, listSlot }));
  };

  return (
    <div className={s.card}>
      {cardSlot?.card ? (
        <Link to={`card/${cardSlot.card.id}`}>
          <input type={'text'} value={cardSlot?.card?.title || ''} required readOnly onClick={handleClickCard} />
        </Link>
      ) : (
        <input type={'text'}></input>
      )}
    </div>
  );
};

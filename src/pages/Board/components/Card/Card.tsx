import React from 'react';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { setCard } from '../../../../store/board/reducer';
import s from './card.module.scss';

export const Card = ({ listId, cardId }: { listId: number; cardId: number }) => {
  const dispatch = useAppDispatch();
  const { board } = useAppSelector((state) => state.board);
  const card = board?.lists.find((list) => list.id === listId)?.cards.find((card) => card?.id === cardId);

  const handleClickCard = (e: React.MouseEvent<HTMLInputElement>) => {
    const list = board?.lists.find((list) => list.id === listId);
    dispatch(setCard({ card, list }));
  };

  return (
    <div className={s.card}>
      <input type={'text'} value={card?.title || ''} required readOnly onClick={handleClickCard} />
    </div>
  );
};

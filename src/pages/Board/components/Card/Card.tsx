import { Link } from 'react-router-dom';
import { JSX } from 'react';
import { useAppDispatch, useAppSelector, useAppStore } from '../../../../store/hooks';
import { setCard } from '../../../../store/board/reducer';
import s from './card.module.scss';

export const Card = ({ listId, cardId }: { listId: number; cardId?: number }): JSX.Element => {
  const dispatch = useAppDispatch();
  const store = useAppStore();
  const title = useAppSelector(
    (state) =>
      state.board.boardSlot?.lists?.find((l) => l.id === listId)?.cardSlots.find((cs) => cs.card?.id === cardId)?.card
        ?.title
  );

  if (cardId === undefined || title === undefined) {
    return <div className={`${s.card} ${s.card_placeholder}`} />;
  }

  const handleClickCard = (): void => {
    const listSlot = store.getState().board.boardSlot?.lists?.find((l) => l.id === listId);
    const cardSlot = listSlot?.cardSlots.find((cs) => cs.card?.id === cardId);
    dispatch(setCard({ cardSlot, listSlot }));
  };

  return (
    <div className={s.card}>
      <Link to={`card/${cardId}`} className={s.card_link} onClick={handleClickCard} draggable={false}>
        <span className={s.card_title}>{title}</span>
      </Link>
    </div>
  );
};

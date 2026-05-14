import React, { JSX } from 'react';
import { useAppSelector } from '../../../../../store/hooks';
import s from './card-members.module.scss';

export const avatarColor = (id: number): string => `hsl(${(id * 137) % 360}, 55%, 45%)`;

export const CardMembers = (): JSX.Element | null => {
  const userIds = useAppSelector((state) => state.board.cardSlot?.card?.users ?? []);

  if (userIds.length === 0) return null;

  return (
    <div className={s.members}>
      <span className={s.label}>Учасники</span>
      {userIds.map((id) => (
        <div key={id} className={s.avatar} style={{ backgroundColor: avatarColor(id) }} aria-label={`User ${id}`}>
          <span className={s.tooltip}>#{id}</span>
        </div>
      ))}
    </div>
  );
};

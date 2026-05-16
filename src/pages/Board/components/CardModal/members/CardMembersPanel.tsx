import React, { CSSProperties, forwardRef, JSX, useEffect, useRef, useState } from 'react';
import { useFindUsersByNameQuery, useUpdateCardUsersMutation } from '../../../../../store/board/boardSlice';
import { useAppSelector } from '../../../../../store/hooks';
import { avatarColor } from './CardMembers';
import s from './card-members-panel.module.scss';

interface CardMembersPanelProps {
  onClose: () => void;
  onBack?: () => void;
  style?: CSSProperties;
}

export const CardMembersPanel = forwardRef<HTMLDivElement, CardMembersPanelProps>(
  ({ onClose, onBack, style }, ref): JSX.Element => {
    const boardId = useAppSelector((state) => state.board.boardSlot?.id ?? 0);
    const card = useAppSelector((state) => state.board.cardSlot?.card);
    const cardId = card?.id ?? 0;
    const cardUserIds = card?.users ?? [];
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    const { data: searchResults = [] } = useFindUsersByNameQuery(debouncedSearch, {
      skip: debouncedSearch.length < 2,
    });
    const [updateCardUsers] = useUpdateCardUsersMutation();

    useEffect(() => {
      inputRef.current?.focus();
    }, []);

    useEffect(() => {
      const timer = setTimeout(() => setDebouncedSearch(search), 300);
      return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent): void => {
        if (e.key === 'Escape') onClose();
      };
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    const toggle = async (userId: number): Promise<void> => {
      const isJoined = cardUserIds.includes(userId);
      await updateCardUsers({
        boardId,
        cardId,
        data: isJoined ? { add: [], remove: [userId] } : { add: [userId], remove: [] },
      });
    };

    return (
      <div ref={ref} className={s.panel} style={style} role="dialog" aria-modal="true">
        <div className={s.panel_header}>
          {onBack && (
            <button className={s.btn_back} aria-label="Назад" onClick={onBack}>
              ＜
            </button>
          )}
          <span>Учасники</span>
          <button className={s.btn__close} aria-label="Закрити" onClick={onClose}>
            <span />
            <span />
          </button>
        </div>
        <div className={s.panel_body}>
          <input
            ref={inputRef}
            className={s.search}
            type="text"
            placeholder="Пошук учасників..."
            value={search}
            onChange={(e): void => setSearch(e.target.value)}
          />
          {debouncedSearch.length >= 2 && (
            <div className={s.section}>
              <span className={s.section_label}>Результати пошуку</span>
              {searchResults.filter((u) => !cardUserIds.includes(u.id)).length === 0 ? (
                <span className={s.empty}>Нікого не знайдено</span>
              ) : (
                <ul className={s.member_list}>
                  {searchResults
                    .filter((u) => !cardUserIds.includes(u.id))
                    .map((user) => (
                      <li key={user.id}>
                        <button
                          className={`${s.member} ${s.member__add}`}
                          onClick={async (): Promise<void> => toggle(user.id)}
                        >
                          <div className={s.avatar} style={{ backgroundColor: avatarColor(user.id) }} />
                          <span className={s.member_name}>{user.username}</span>
                        </button>
                      </li>
                    ))}
                </ul>
              )}
            </div>
          )}
          <div className={s.section}>
            <span className={s.section_label}>Учасники картки</span>
            {cardUserIds.length === 0 ? (
              <span className={s.empty}>Немає учасників</span>
            ) : (
              <ul className={s.member_list}>
                {cardUserIds.map((id) => (
                  <li key={id} className={s.member}>
                    <div className={s.avatar} style={{ backgroundColor: avatarColor(id) }} />
                    <span className={s.member_name}>#{id}</span>
                    <button className={s.btn_remove} onClick={async (): Promise<void> => toggle(id)}>
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    );
  }
);

CardMembersPanel.displayName = 'CardMembersPanel';

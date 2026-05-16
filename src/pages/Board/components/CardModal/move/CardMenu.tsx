import React, { JSX, useEffect, useRef } from 'react';
import s from '../card-modal.module.scss';

interface CardMenuProps {
  isOpen: boolean;
  isJoined: boolean;
  onOpenChange: (open: boolean) => void;
  onJoinLeave: () => Promise<void>;
  onCopy: () => void;
  onMove: () => void;
  onDelete: () => Promise<void>;
}

export const CardMenu = ({
  isOpen,
  isJoined,
  onOpenChange,
  onJoinLeave,
  onCopy,
  onMove,
  onDelete,
}: CardMenuProps): JSX.Element => {
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return () => {};
    const handleClickOutside = (event: MouseEvent): void => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        menuButtonRef.current &&
        !menuButtonRef.current.contains(event.target as Node)
      ) {
        onOpenChange(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onOpenChange]);

  return (
    <div className={s.header_left}>
      <button ref={menuButtonRef} className={s.btn__menu} aria-label="Дії" onClick={(): void => onOpenChange(!isOpen)}>
        •••
      </button>
      {isOpen && (
        <div className={s.menu_dropdown} ref={menuRef}>
          <button
            onClick={async (): Promise<void> => {
              onOpenChange(false);
              await onJoinLeave();
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              {isJoined ? (
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
              ) : (
                <>
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <line x1="19" y1="8" x2="19" y2="14" />
                  <line x1="22" y1="11" x2="16" y2="11" />
                </>
              )}
            </svg>
            {isJoined ? 'Залишити' : 'Приєднатись'}
          </button>
          <button
            onClick={(): void => {
              onOpenChange(false);
              onCopy();
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="9" y="9" width="13" height="13" rx="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
            Копіювати
          </button>
          <button
            onClick={(): void => {
              onOpenChange(false);
              onMove();
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="5 9 2 12 5 15" />
              <polyline points="9 5 12 2 15 5" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <line x1="12" y1="2" x2="12" y2="22" />
            </svg>
            Перемістити
          </button>
          <button disabled>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="21 8 21 21 3 21 3 8" />
              <rect x="1" y="3" width="22" height="5" />
              <line x1="10" y1="12" x2="14" y2="12" />
            </svg>
            Заархівувати
          </button>
          <button
            onClick={async (): Promise<void> => {
              onOpenChange(false);
              await onDelete();
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14H6L5 6" />
              <path d="M10 11v6" />
              <path d="M14 11v6" />
              <path d="M9 6V4h6v2" />
            </svg>
            Видалити
          </button>
        </div>
      )}
    </div>
  );
};

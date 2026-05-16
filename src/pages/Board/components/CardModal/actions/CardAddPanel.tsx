import React, { CSSProperties, forwardRef, JSX, useEffect } from 'react';
import s from './card-add-panel.module.scss';

interface CardAddPanelProps {
  onClose: () => void;
  onOpenMembers: () => void;
  style?: CSSProperties;
}

export const CardAddPanel = forwardRef<HTMLDivElement, CardAddPanelProps>(
  ({ onClose, onOpenMembers, style }, ref): JSX.Element => {
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent): void => {
        if (e.key === 'Escape') onClose();
      };
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    return (
      <div ref={ref} className={s.panel} style={style} role="dialog" aria-modal="true">
        <div className={s.panel_header}>
          <span>Додати до картки</span>
          <button className={s.btn__close} aria-label="Закрити" onClick={onClose}>
            <span />
            <span />
          </button>
        </div>
        <div className={s.panel_body}>
          <button className={s.item} onClick={onOpenMembers}>
            <svg
              className={s.item_icon}
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <line x1="19" y1="8" x2="19" y2="14" />
              <line x1="22" y1="11" x2="16" y2="11" />
            </svg>
            <div className={s.item_text}>
              <span className={s.item_title}>Учасники</span>
              <span className={s.item_desc}>Призначайте учасників</span>
            </div>
          </button>
        </div>
      </div>
    );
  }
);

CardAddPanel.displayName = 'CardAddPanel';

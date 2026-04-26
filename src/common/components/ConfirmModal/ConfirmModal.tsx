import React, { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import s from './confirm-modal.module.scss';

interface Props {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal = ({ message, onConfirm, onCancel }: Props): React.ReactPortal => {
  const confirmBtnRef = useRef<HTMLButtonElement>(null);
  const messageId = useId();

  useEffect(() => {
    confirmBtnRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>): void => {
    e.stopPropagation();
    if (e.target === e.currentTarget) onCancel();
  };

  return createPortal(
    <div className={s.overlay} onClick={handleOverlayClick}>
      <div className={s.modal} role="dialog" aria-modal="true" aria-labelledby={messageId}>
        <p id={messageId} className={s.message}>
          {message}
        </p>
        <div className={s.actions}>
          <button type="button" className={s.btn_confirm} ref={confirmBtnRef} onClick={onConfirm}>
            Підтвердити
          </button>
          <button type="button" className={s.btn_cancel} onClick={onCancel}>
            Скасувати
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

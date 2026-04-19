import React, { useEffect, useRef } from 'react';
import s from './confirm-modal.module.scss';

interface Props {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal = ({ message, onConfirm, onCancel }: Props) => {
  const confirmBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    confirmBtnRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  return (
    <div className={s.overlay} onClick={(e) => { e.stopPropagation(); e.preventDefault(); onCancel(); }}>
      <div className={s.modal} onClick={(e) => e.stopPropagation()}>
        <p className={s.message}>{message}</p>
        <div className={s.actions}>
          <button className={s.btn_confirm} ref={confirmBtnRef} onClick={(e) => { e.stopPropagation(); e.preventDefault(); onConfirm(); }}>
            Підтвердити
          </button>
          <button className={s.btn_cancel} onClick={(e) => { e.stopPropagation(); e.preventDefault(); onCancel(); }}>
            Скасувати
          </button>
        </div>
      </div>
    </div>
  );
};

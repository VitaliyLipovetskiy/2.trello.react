import React, { JSX, useEffect, useRef, useState } from 'react';
import useValidation from '../../../../hooks/useValidation';
import { useCreateBoardMutation } from '../../../../store/board/boardSlice';
import { dispatchWithToast } from '../../../../common/utils/dispatchWithToast';
import s from './board-create.module.scss';

export const BoardCreate = ({ onClose }: { onClose: () => void }): JSX.Element => {
  const [title, setTitle] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [createBoard] = useCreateBoardMutation();
  const inputRef = useRef<HTMLInputElement>(null);
  const { errors, touched, setTouched } = useValidation(title || '');

  useEffect(() => {
    const handleEscapePress = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscapePress);
    return () => {
      document.removeEventListener('keydown', handleEscapePress);
    };
  }, [onClose]);

  const handleAcceptCreateBoard = async (e: React.MouseEvent): Promise<void> => {
    e.preventDefault();
    if (errors.length > 0 || submitting) return;
    setSubmitting(true);
    const succeeded = await dispatchWithToast(
      createBoard(title).unwrap(),
      'Created',
      `Дошка ${title} створена успішно`,
      `Дошка ${title} не створена`
    );
    if (succeeded) {
      onClose();
    } else {
      setSubmitting(false);
    }
  };

  const handleChangeTitle = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setTitle(e.target.value);
    setTouched(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter' && inputRef.current) {
      inputRef.current.blur();
    }
  };

  const disabled = errors.length > 0 || submitting;

  return (
    <div className={s.modals_wrapper}>
      <div className={s.content}>
        <button type="button" aria-label="Закрити" className={s.btn__close} onClick={onClose}>
          <span />
          <span />
        </button>
        <h1>Створити дошку</h1>
        <label htmlFor="title">Назва дошки*</label>
        <div className={`${s.title_create} ${s.title}`}>
          <input
            id="title"
            type="text"
            value={title}
            ref={inputRef}
            required
            autoFocus
            onChange={handleChangeTitle}
            onKeyDown={handleKeyDown}
          />
          <div className={s.error} hidden={!touched || errors.length === 0}>
            {errors.map((e) => (
              <p key={e}>{e}</p>
            ))}
          </div>
        </div>
        <button
          type="button"
          className={`${s.btn__accept} ${!touched || disabled ? s.disabled : ''}`}
          disabled={disabled}
          onClick={handleAcceptCreateBoard}
        >
          Створити
        </button>
      </div>
    </div>
  );
};

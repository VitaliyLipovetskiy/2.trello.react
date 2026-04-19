import React, { useEffect, useRef, useState } from 'react';
import useValidation from '../../../../hooks/useValidation';
import { IBoard } from '../../../../common/interfaces';
import { addBoard } from '../../../../store/board/reducer';
import { useAppDispatch } from '../../../../store/hooks';
import { boardAction } from '../../../../store/actions';
import { dispatchWithToast } from '../../../../common/utils/dispatchWithToast';
import s from './board-create.module.scss';

export const BoardCreate = ({ onClose }: { onClose: () => void }) => {
  const [title, setTitle] = useState('');
  const dispatch = useAppDispatch();
  const inputRef = useRef<HTMLInputElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { errors, touched, setTouched } = useValidation(title || '');

  useEffect(() => {
    const handleEscapePress = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscapePress);
    return () => {
      document.removeEventListener('keydown', handleEscapePress);
    };
  }, [onClose]);

  const handleAcceptCreateBoard = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (errors.length > 0) return;
    await dispatchWithToast(
      dispatch(boardAction.createBoard(title)).unwrap(),
      'Created',
      `Дошка ${title} створена успішно`,
      `Дошка ${title} не створена`,
      ({ id }) => dispatch(addBoard({ id, title, lists: [] } as IBoard))
    );
    onClose();
  };

  const handleChangeTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    setTouched(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputRef.current) {
      inputRef.current.blur();
    }
  };

  return (
    <div className={s.modals_wrapper}>
      <div className={s.content}>
        <button className={s.btn__close} onClick={onClose}>
          <span></span>
          <span></span>
        </button>
        <h1>Створити дошку</h1>
        <label htmlFor={'title'}>Назва дошки*</label>
        <div className={`${s.title_create} ${s.title}`}>
          <input
            id={'title'}
            type={'text'}
            value={title}
            ref={inputRef}
            required
            autoFocus
            onChange={handleChangeTitle}
            onBlur={() => buttonRef.current?.focus()}
            onKeyDown={handleKeyDown}
          />
          <div className={s.error} hidden={!touched || errors.length === 0}>
            {errors.map((e) => (
              <p key={e}>{e}</p>
            ))}
          </div>
        </div>
        <button
          className={`${s.btn__accept} ${!touched || errors.length > 0 ? s.disabled : ''}`}
          disabled={errors.length > 0}
          ref={buttonRef}
          onClick={handleAcceptCreateBoard}
        >
          Створити
        </button>
      </div>
    </div>
  );
};

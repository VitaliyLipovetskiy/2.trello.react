import React, { useEffect, useRef, useState } from 'react';
import useValidation from '../../../../hooks/useValidation';
import { IBoard } from '../../../../common/interfaces';
import { addBoard } from '../../../../store/board/reducer';
import { toast } from 'react-toastify';
import { useAppDispatch } from '../../../../store/hooks';
import { boardAction } from '../../../../store/actions';
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
    try {
      const { result, id } = await dispatch(boardAction.createBoard(title)).unwrap();
      if (result === 'Created') {
        const board: IBoard = { id, title, lists: [] };
        dispatch(addBoard(board));
        toast.success(`Дошка ${title} створена успішно`);
      } else {
        console.log(`Дошка ${title} не створена`);
        toast.error(`Дошка ${title} не створена`);
      }
    } catch (error) {
      console.log(error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        throw error;
      }
    }
    onClose();
  };

  const handleChangeTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    setTouched(true);
  };

  const handleKeyUpEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputRef.current) {
      inputRef.current.blur();
    }
  };

  return (
    <div className={s.modals_wrapper}>
      <div className={s.content}>
        <button className={s.btn__close} onClick={onClose} onKeyDown={onClose}>
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
            onKeyUp={handleKeyUpEnter}
          />
          <div className={s.error} hidden={!touched && errors.length === 0}>
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

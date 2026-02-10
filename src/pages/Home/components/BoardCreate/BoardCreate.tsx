import React, { useEffect, useRef, useState } from 'react';
import { BoardTitle } from '../../../Board/components';
import s from './board-create.module.scss';

type CreateBoardProp = {
  onClose: () => void;
  handleCreateBoard: (title: string) => void;
};

export const BoardCreate = ({ onClose, handleCreateBoard }: CreateBoardProp) => {
  const [title, setTitle] = useState('');
  const [titleValid, setTitleValid] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleAcceptCreateBoard = (e: React.MouseEvent) => {
    e.preventDefault();
    handleCreateBoard(title);
    onClose();
  };

  return (
    <div className={s.crete}>
      <div className={s.content}>
        <button className={s.btn__close} onClick={onClose} onKeyDown={onClose}>
          <span></span>
          <span></span>
        </button>
        <h1>Створити дошку</h1>
        <label htmlFor={'title'}>Назва дошки*</label>
        <BoardTitle
          className={s.title_create}
          setTitle={setTitle}
          setTitleValid={setTitleValid}
          handleOnBlurTitle={() => buttonRef.current?.focus()}
        />
        <button
          className={s.btn__accept + (titleValid ? '' : ' disabled')}
          disabled={!titleValid}
          ref={buttonRef}
          onMouseDown={handleAcceptCreateBoard}
          onClick={handleAcceptCreateBoard}
        >
          Створити
        </button>
      </div>
    </div>
  );
};

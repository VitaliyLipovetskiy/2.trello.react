import React, { useEffect, useRef, useState } from 'react';
import { BoardTitle } from '../../../Board/components/BoardTitle/BoardTitle';
import './create-board.scss';

type CreateBoardProp = {
  onClose: () => void;
  handleCreateBoard: (title: string) => void;
};

export const CreateBoard = ({ onClose, handleCreateBoard }: CreateBoardProp) => {
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
    <div className={'modal-crete-board'}>
      <div className={'modal-content'}>
        <i className={'board-btn-close'} onClick={onClose} onKeyDown={onClose}>
          &times;
        </i>
        <h1>Створити дошку</h1>
        <label htmlFor={'title'}>Назва дошки*</label>
        <BoardTitle
          className={'board-title-create'}
          setTitle={setTitle}
          setTitleValid={setTitleValid}
          handleOnBlurTitle={() => buttonRef.current?.focus()}
        />
        <button
          className={'btn-accept' + (titleValid ? '' : ' disabled')}
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

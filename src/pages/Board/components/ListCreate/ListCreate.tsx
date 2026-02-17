import React, { useEffect, useRef, useState } from 'react';
import { Tooltip } from 'react-tooltip';
import useValidation from '../../../../hooks/useValidation';
import { boardAction } from '../../../../store/actions';
import { IList, IListCreate } from '../../../../common/interfaces';
import { addList } from '../../../../store/board/reducer';
import { toast } from 'react-toastify';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import s from './list-create.module.scss';

export const ListCreate = () => {
  const dispatch = useAppDispatch();
  const [listNew, setListNew] = useState(false);
  const [title, setTitle] = useState('');
  const { board } = useAppSelector((state) => state.board);
  const { errors, touched, setTouched } = useValidation(title);
  const inputRef = useRef<HTMLInputElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setListNew(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (!listNew) {
      setTitle('');
      setTouched(false);
    }
  }, [listNew, setTouched]);

  const handleChangeTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    setTouched(true);
  };

  const setDefaultValues = () => {
    setTitle('');
    setTouched(false);
    setListNew(false);
  };

  const handleAcceptNewList = async (e: React.MouseEvent) => {
    e.preventDefault();
    setDefaultValues();
    const listData: IListCreate = {
      title,
      position: (board?.lists.length || 0) + 1,
    };
    try {
      const { result, id } = await dispatch(boardAction.createList({ boardId: board!.id, data: listData })).unwrap();
      if (result === 'Created') {
        const list: IList = { id, title, position: listData.position, cards: [] };
        dispatch(addList(list));
        toast.success('Список створено успішно');
      } else {
        console.log('Список не вдалося створити');
        toast.error('Список не вдалося створити');
      }
    } catch (error) {
      console.log(error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        throw error;
      }
    }
  };

  const handleKeyUpEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && errors.length === 0) {
      buttonRef.current?.focus();
    }
    if (e.key === 'Escape') {
      setDefaultValues();
    }
  };

  const handleBlurTitle = (e: React.FocusEvent<HTMLInputElement>) => {
    if (e.relatedTarget === null) {
      inputRef.current?.focus();
    } else if (e.relatedTarget.className !== 'list__btn_accept') {
      setDefaultValues();
    }
  };

  return (
    <div className={s.list_add}>
      {listNew ? (
        <div className={s.list_new}>
          <input
            // className={'board-list-new-input'}
            name={'listTitle'}
            type={'text'}
            value={title}
            ref={inputRef}
            required
            autoFocus
            onChange={handleChangeTitle}
            onKeyUp={handleKeyUpEnter}
            onBlur={handleBlurTitle}
          />
          <div className={s.error} hidden={errors.length === 0}>
            {errors.map((e) => (
              <p key={e}>{e}</p>
            ))}
          </div>
          <div className={s.list__btn}>
            <button
              className={`${s.list__btn_accept} ${!touched || errors.length > 0 ? s.disabled : ''}`}
              disabled={!touched || errors.length > 0}
              ref={buttonRef}
              onMouseDown={handleAcceptNewList}
              onClick={handleAcceptNewList}
            >
              Додати список
            </button>
            <Tooltip
              id="tooltip-update-list-title"
              className={s.tooltip}
              content="Скасувати зміну назви списку!"
              place="left"
            />
            <button
              data-tooltip-id="tooltip-update-list-title"
              className={s.list__btn_close}
              onMouseDown={() => setDefaultValues()}
            >
              &times;
            </button>
          </div>
        </div>
      ) : (
        <button className={s.list__btn_add} onClick={() => setListNew(true)}>
          + Додайте ще один список
        </button>
      )}
    </div>
  );
};

import React, { JSX, useEffect, useRef, useState } from 'react';
import { Tooltip } from 'react-tooltip';
import useValidation from '../../../../hooks/useValidation';
import { useCreateListMutation } from '../../../../store/board/boardSlice';
import { IListCreate } from '../../../../common/interfaces';
import { useAppSelector } from '../../../../store/hooks';
import { dispatchWithToast } from '../../../../common/utils/dispatchWithToast';
import s from './list-create.module.scss';

export const ListCreate = (): JSX.Element => {
  const [createList] = useCreateListMutation();
  const [listNew, setListNew] = useState(false);
  const [title, setTitle] = useState('');
  const { boardSlot } = useAppSelector((state) => state.board);
  const { errors, touched, setTouched } = useValidation(title);
  const inputRef = useRef<HTMLInputElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
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

  const handleChangeTitle = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setTitle(e.target.value);
    setTouched(true);
  };

  const setDefaultValues = (): void => {
    setTitle('');
    setTouched(false);
    setListNew(false);
  };

  const handleAcceptNewList = async (e: React.MouseEvent): Promise<void> => {
    e.preventDefault();
    const savedTitle = title;
    setDefaultValues();
    const listData: IListCreate = {
      title: savedTitle,
      position: Math.max(0, ...(boardSlot?.lists?.map((l) => l.position) || [])) + 1,
    };
    if (!boardSlot) return;
    await dispatchWithToast(
      createList({ boardId: boardSlot.id, data: listData }).unwrap(),
      'Created',
      'Список створено успішно',
      'Список не вдалося створити'
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter' && errors.length === 0) {
      buttonRef.current?.focus();
    }
    if (e.key === 'Escape') {
      setDefaultValues();
    }
  };

  const handleBlurTitle = (e: React.FocusEvent<HTMLInputElement>): void => {
    if (e.relatedTarget === null) {
      inputRef.current?.focus();
    } else if (e.relatedTarget !== buttonRef.current) {
      setDefaultValues();
    }
  };

  return (
    <div className={s.list_add}>
      {listNew ? (
        <div className={s.list_new}>
          <input
            name="listTitle"
            type="text"
            value={title}
            ref={inputRef}
            required
            autoFocus
            onChange={handleChangeTitle}
            onKeyDown={handleKeyDown}
            onBlur={handleBlurTitle}
          />
          <div className={s.error} hidden={!touched || errors.length === 0}>
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
            >
              Додати список
            </button>
            <Tooltip
              id="tooltip-cancel-create-list"
              className={s.tooltip}
              content="Скасувати створення списку!"
              place="left"
            />
            <button
              data-tooltip-id="tooltip-cancel-create-list"
              className={s.list__btn_close}
              onMouseDown={(): void => setDefaultValues()}
            >
              &times;
            </button>
          </div>
        </div>
      ) : (
        <button className={s.list__btn_add} onClick={(): void => setListNew(true)}>
          + Додайте ще один список
        </button>
      )}
    </div>
  );
};

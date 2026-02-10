import React, { useEffect, useRef, useState } from 'react';
import { validateTitle } from '../../../../utils/validates';
import { Tooltip } from 'react-tooltip';
import s from './list-create.module.scss';

type CreateListProps = {
  isListNew: boolean;
  setIsListNew: (value: boolean) => void;
  handleCreateList: (name: string) => void;
};

export const ListCreate = ({ isListNew, setIsListNew, handleCreateList }: CreateListProps) => {
  const [title, setTitle] = useState('');
  const [titleTouched, setTitleTouched] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isListNew) {
      setTitle('');
      setTitleTouched(false);
      setErrors([]);
    }
  }, [isListNew]);

  const handleChangeTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    setTitleTouched(true);
    const titleErrors = validateTitle(e.target.value);
    setErrors(titleErrors);
  };

  const setDefaultValues = () => {
    setTitle('');
    setTitleTouched(false);
    setErrors([]);
    setIsListNew(false);
  };

  const handleAcceptNewList = (e: React.MouseEvent) => {
    e.preventDefault();
    setDefaultValues();
    handleCreateList(title);
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
      {isListNew ? (
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
              className={s.list__btn_accept + (titleTouched && errors.length === 0 ? '' : ' disabled')}
              disabled={!(titleTouched && errors.length === 0)}
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
        <button className={s.list__btn_add} onClick={() => setIsListNew(true)}>
          + Додайте ще один список
        </button>
      )}
    </div>
  );
};

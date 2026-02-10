import React, { useEffect, useRef, useState } from 'react';
import { validateTitle } from '../../../../utils/validates';
import { Tooltip } from 'react-tooltip';
import s from './card-create.module.scss';

export const CardCreate = ({
  isCardNew,
  setIsCardNew,
  handleCreateCard,
}: {
  isCardNew: boolean;
  setIsCardNew: (value: boolean) => void;
  handleCreateCard: (name: string) => void;
}) => {
  const [title, setTitle] = useState('');
  const [titleTouched, setTitleTouched] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!isCardNew) {
      setTitle('');
      setTitleTouched(false);
      setErrors([]);
    }
  }, [isCardNew]);

  const handleChangeTitle = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTitle(e.target.value);
    setTitleTouched(true);
    const titleErrors = validateTitle(e.target.value);
    setErrors(titleErrors);
  };

  const handleAcceptCreateNewCard = (e: React.FormEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setDefaultValues();
    handleCreateCard(title);
  };

  const setDefaultValues = () => {
    setTitle('');
    setTitleTouched(false);
    setErrors([]);
    setIsCardNew(false);
  };

  const handleKeyUpEnter = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Escape') {
      setDefaultValues();
    }
  };

  const handleBlurTitle = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    if (e.relatedTarget === null) {
      inputRef.current?.focus();
    } else if (e.relatedTarget.className !== 'card-btn-accept') {
      setDefaultValues();
    }
  };

  return (
    <div className={s.card_add}>
      {isCardNew ? (
        <div className={s.card_new}>
          <textarea
            name={'cardTitle'}
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
          <div className={s.card__btn}>
            <button
              className={s.card__btn_accept + (titleTouched && errors.length === 0 ? '' : ' disabled')}
              disabled={!(titleTouched && errors.length === 0)}
              onMouseDown={handleAcceptCreateNewCard}
            >
              Додати картку
            </button>
            <Tooltip id="tooltip-create-card" className="tooltip" content="Скасувати створення картки!" place="left" />
            <button
              data-tooltip-id="tooltip-create-card"
              className={s.card__btn_close}
              onMouseDown={() => setDefaultValues()}
            >
              &times;
            </button>
          </div>
        </div>
      ) : (
        <button className={s.card__btm_add} onClick={() => setIsCardNew(true)}>
          + Додати картку
        </button>
      )}
    </div>
  );
};

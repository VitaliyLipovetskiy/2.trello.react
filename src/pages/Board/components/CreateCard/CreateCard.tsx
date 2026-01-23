import React, { useEffect, useRef, useState } from 'react';
import { validateTitle } from '../../../../utils/validates';
import './create-card.scss';
import { Tooltip } from 'react-tooltip';

export const CreateCard = ({
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
    <div className={'board-add-card'}>
      {isCardNew ? (
        <div className={'board-card-new'}>
          <textarea
            className={'board-card-new-input'}
            name={'cardTitle'}
            value={title}
            ref={inputRef}
            required
            autoFocus
            onChange={handleChangeTitle}
            onKeyUp={handleKeyUpEnter}
            onBlur={handleBlurTitle}
          />
          <div className={'error'} hidden={errors.length === 0}>
            {errors.map((e) => (
              <p key={e}>{e}</p>
            ))}
          </div>
          <div className={'board-card-btn'}>
            <button
              className={'card-btn-accept' + (titleTouched && errors.length === 0 ? '' : ' disabled')}
              disabled={!(titleTouched && errors.length === 0)}
              onMouseDown={handleAcceptCreateNewCard}
            >
              Додати картку
            </button>
            <Tooltip id="tooltip-create-card" className="tooltip" content="Скасувати створення картки!" place="left" />
            <button
              data-tooltip-id="tooltip-create-card"
              className={'card-btn-close'}
              onMouseDown={() => setDefaultValues()}
            >
              &times;
            </button>
          </div>
        </div>
      ) : (
        <button className={'board-card-add-btn'} onClick={() => setIsCardNew(true)}>
          + Додати картку
        </button>
      )}
    </div>
  );
};

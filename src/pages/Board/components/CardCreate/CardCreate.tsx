import React, { JSX, useEffect, useRef, useState } from 'react';
import { Tooltip } from 'react-tooltip';
import useValidation from '../../../../hooks/useValidation';
import { ICardCreate } from '../../../../common/interfaces';
import { useAppSelector } from '../../../../store/hooks';
import { useCreateCardMutation } from '../../../../store/board/boardSlice';
import { dispatchWithToast } from '../../../../common/utils/dispatchWithToast';
import 'react-toastify/dist/ReactToastify.css';
import s from './card-create.module.scss';

export const CardCreate = ({ listId }: { listId: number }): JSX.Element => {
  const [createCard] = useCreateCardMutation();
  const { boardSlot } = useAppSelector((state) => state.board);
  const listSlot = boardSlot?.lists?.find((list) => list.id === listId);
  const [title, setTitle] = useState('');
  const [isCardNew, setIsCardNew] = useState(false);
  const { errors, touched, setTouched } = useValidation(title);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const acceptButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isCardNew) {
      setTitle('');
      setTouched(false);
    }
  }, [isCardNew, setTouched]);

  const setDefaultValues = (): void => {
    setTitle('');
    setTouched(false);
    setIsCardNew(false);
  };

  const handleChangeTitle = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    setTitle(e.target.value);
    setTouched(true);
  };

  const handleAcceptCreateNewCard = async (e: React.FormEvent<HTMLButtonElement>): Promise<void> => {
    e.preventDefault();
    if (!boardSlot || !listSlot) return;
    const data: ICardCreate = {
      title,
      list_id: listSlot.id,
      position:
        listSlot.cardSlots
          .filter((c) => !!c.card)
          .map((c) => c.card?.position ?? 0)
          .reduce((a, b) => Math.max(a, b), 0) + 1,
    };
    await dispatchWithToast(
      createCard({ boardId: boardSlot.id, data }).unwrap(),
      'Created',
      `Карточка ${title} створена успішно`,
      `Карточка ${title} не створена`
    );
    setDefaultValues();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === 'Escape') {
      setDefaultValues();
    }
  };

  const handleBlurTitle = (e: React.FocusEvent<HTMLTextAreaElement>): void => {
    if (e.relatedTarget === null) {
      inputRef.current?.focus();
    } else if (e.relatedTarget !== acceptButtonRef.current) {
      setDefaultValues();
    }
  };

  return (
    <div className={s.card_add}>
      {isCardNew ? (
        <div className={s.card_new}>
          <textarea
            name="cardTitle"
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
          <div className={s.card__btn}>
            <button
              ref={acceptButtonRef}
              className={`${s.card__btn_accept} ${!touched || errors.length > 0 ? s.disabled : ''}`}
              disabled={!touched || errors.length > 0}
              onMouseDown={handleAcceptCreateNewCard}
            >
              Додати картку
            </button>
            <Tooltip
              id={`tooltip-create-card-${listId}`}
              className="tooltip"
              content="Скасувати створення картки!"
              place="left"
            />
            <button
              data-tooltip-id={`tooltip-create-card-${listId}`}
              className={s.card__btn_close}
              onMouseDown={(): void => setDefaultValues()}
            >
              &times;
            </button>
          </div>
        </div>
      ) : (
        <button className={s.card__btm_add} onClick={(): void => setIsCardNew(true)}>
          + Додати картку
        </button>
      )}
    </div>
  );
};

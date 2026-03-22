import React, { useEffect, useRef, useState } from 'react';
import { Tooltip } from 'react-tooltip';
import useValidation from '../../../../hooks/useValidation';
import { ICard, ICardCreate } from '../../../../common/interfaces';
import { addCard } from '../../../../store/board/reducer';
import { toast } from 'react-toastify';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { boardAction } from '../../../../store/actions';
import 'react-toastify/dist/ReactToastify.css';
import s from './card-create.module.scss';

export const CardCreate = ({ listId }: { listId: number }) => {
  const dispatch = useAppDispatch();
  const { boardSlot } = useAppSelector((state) => state.board);
  const listSlot = boardSlot?.lists?.find((list) => list.id === listId);
  const [title, setTitle] = useState('');
  const [isCardNew, setIsCardNew] = useState(false);
  const { errors, touched, setTouched } = useValidation(title);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!isCardNew) {
      setTitle('');
      setTouched(false);
    }
  }, [isCardNew, setTitle, setTouched]);

  const handleChangeTitle = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTitle(e.target.value);
    setTouched(true);
  };

  const handleAcceptCreateNewCard = async (e: React.FormEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const data: ICardCreate = {
      title,
      list_id: listSlot!.id,
      position: listSlot!.cardSlots.map((c) => c.position).reduce((a, b) => Math.max(a, b), 0) + 1,
    };
    try {
      const { result, id } = await dispatch(boardAction.createCard({ id: boardSlot!.id, data })).unwrap();
      if (result === 'Created') {
        const card: ICard = { id, title, position: data.position, users: [] };
        dispatch(addCard({ listId: listSlot!.id, card }));
        toast.success(`Карточка ${title} створена успішно`);
      } else {
        console.log(`Карточка ${title} не створена`);
        toast.error(`Карточка ${title} не створена`);
      }
    } catch (error) {
      console.log(error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        throw error;
      }
    }
    setDefaultValues();
  };

  const setDefaultValues = () => {
    setTitle('');
    setTouched(false);
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
    } else if (e.relatedTarget.className !== s.card__btn_accept) {
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
              className={`${s.card__btn_accept} ${!touched || errors.length > 0 ? s.disabled : ''}`}
              disabled={!touched || errors.length > 0}
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

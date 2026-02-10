import React, { useRef, useState } from 'react';
import boardService from '../../../../services/board/board.service';
import { IUpdateCard } from '../../../../common/interfaces';
import { validateTitle } from '../../../../utils/validates';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Tooltip } from 'react-tooltip';
import s from './card.module.scss';

type CardTitleProps = {
  boardId: number;
  listId: number;
  cardId: number;
  title: string;
  handleUpdateCard: () => void;
  handleRemoveCard: (cardId: number) => void;
};

export const Card = (props: CardTitleProps) => {
  const [readOnly, setReadOnly] = useState(true);
  const [title, setTitle] = useState(props.title);
  const [errors, setErrors] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChangeTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    const titleErrors = validateTitle(e.target.value);
    setErrors(titleErrors);
  };

  const handleOnBlurTitle = () => {
    if (errors.length !== 0) {
      setDefaultValues();
      toast.warning('Оновлення карточки скасовано');
      return;
    }
    if (title.trim() === props.title) {
      return;
    }
    const cardData: IUpdateCard = {
      title: title.trim(),
      list_id: props.listId,
    };
    (async () => {
      try {
        let { result } = await boardService.updateCardById(props.boardId, props.cardId, cardData);
        if (result === 'Updated') {
          props.handleUpdateCard();
          toast.success('Карточку оновлено успішно');
        }
      } catch (error) {
        console.log(error);
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          throw error;
        }
      }
    })();
  };

  const handleKeyUpEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      inputRef.current?.blur();
    }
    if (e.key === 'Escape') {
      setDefaultValues();
    }
  };

  const setDefaultValues = () => {
    setTitle(props.title);
    setErrors([]);
    setReadOnly(true);
  };

  return (
    <div>
      <div className={`${readOnly ? s.card_readonly : s.card_edit} ${s.card}`}>
        <button
          className={s.btn__remove}
          data-tooltip-id="tooltip-remove-card"
          onClick={() => props.handleRemoveCard(props.cardId)}
        >
          <span></span>
          <span></span>
        </button>
        <Tooltip id="tooltip-remove-card" className={s.tooltip} content="Видалити картку!" place="left" />
        <input
          type={'text'}
          value={title}
          required
          readOnly={readOnly}
          autoFocus={!readOnly}
          ref={inputRef}
          onClick={() => setReadOnly(false)}
          onChange={handleChangeTitle}
          onBlur={handleOnBlurTitle}
          onKeyUp={handleKeyUpEnter}
        />
      </div>
      <div className={s.error} hidden={errors.length === 0}>
        {errors.map((e) => (
          <p key={e}>{e}</p>
        ))}
      </div>
    </div>
  );
};

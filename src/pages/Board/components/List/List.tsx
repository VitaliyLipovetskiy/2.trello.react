import React, { useRef, useState } from 'react';
import { IBoardList, ICreateCard } from '../../../../common/interfaces';
import { Card } from '../Card/Card';
import { CardCreate } from '../CardCreate/CardCreate';
import boardService from '../../../../services/board/board.service';
import { validateTitle } from '../../../../utils/validates';
import { toast } from 'react-toastify';
import { Tooltip } from 'react-tooltip';
import 'react-toastify/dist/ReactToastify.css';
import s from './list.module.scss';

type ListProps = {
  boardId: number;
  list: IBoardList;
  handleUpdateBoard: () => void;
};

export const List = ({ boardId, list, handleUpdateBoard }: ListProps) => {
  const [titleReadOnly, setTitleReadOnly] = useState(true);
  const [title, setTitle] = useState(list.title);
  const [errors, setErrors] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isCardNew, setIsCardNew] = useState(false);

  const handleChangeTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    const titleErrors = validateTitle(e.target.value);
    setErrors(titleErrors);
  };

  const handleOnBlurTitle = () => {
    setErrors([]);
    setTitleReadOnly(true);
    if (errors.length !== 0) {
      setTitle(list.title);
      toast.warning('Оновлення списка скасовано');
    } else if (list.title !== title.trim()) {
      (async () => {
        try {
          const { result } = await boardService.updateListById(boardId, list.id, { title: title.trim() });
          if (result === 'Updated') {
            handleUpdateBoard();
            toast.success('Назва списка оновлена успішно');
          } else {
            console.log('Назва списка не оновлена');
            toast.error('Назва списка не оновлена');
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
    }
  };

  const handleKeyUpEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (inputRef.current) {
        inputRef.current.blur();
      }
    }
  };

  const handleCreateCard = async (title: string) => {
    const newCard: ICreateCard = {
      title,
      list_id: list.id,
      position: list.cards.map((c) => c.position).reduce((a, b) => Math.max(a, b), 0) + 1,
    };
    const { result } = await boardService.createCard(boardId, newCard);
    if (result === 'Created') {
      handleUpdateBoard();
      toast.success('Карточка створена успішно');
    } else {
      console.log('Карточка не створена');
      toast.error('Карточка не створена');
    }
  };

  const handleRemoveCard = async (cardId: number) => {
    const { result } = await boardService.removeCardById(boardId, cardId);
    if (result === 'Deleted') {
      handleUpdateBoard();
      toast.success('Карточка видалена успішно');
    } else {
      console.log('Карточка не видалена');
      toast.error('Карточка не видалена');
    }
  };

  const handleRemoveList = async () => {
    const { result } = await boardService.removeListById(boardId, list.id);
    if (result === 'Deleted') {
      handleUpdateBoard();
      toast.success('Список видалений успішно');
    } else {
      console.log('Список не видалений');
      toast.error('Список не видалений');
    }
  };

  return (
    <div className={s.list}>
      <button className={s.btn__remove} data-tooltip-id="tooltip-remove-list" onClick={handleRemoveList}>
        <span></span>
        <span></span>
      </button>
      <Tooltip id="tooltip-remove-list" className={s.tooltip} content="Видалити список!" place="left" />
      <div className={`${titleReadOnly ? s.list_title_readonly : s.list_title_write} ${s.list_title}`}>
        <input
          name={'title'}
          type={'text'}
          value={title}
          ref={inputRef}
          required
          readOnly={titleReadOnly}
          autoFocus={!titleReadOnly}
          onClick={() => setTitleReadOnly(false)}
          onChange={handleChangeTitle}
          onBlur={handleOnBlurTitle}
          onKeyUp={handleKeyUpEnter}
        />
        <div className={s.error} hidden={errors.length === 0}>
          {errors.map((e) => (
            <p key={e}>{e}</p>
          ))}
        </div>
      </div>
      {list.cards.map((card) => (
        <Card
          key={card.id}
          boardId={boardId}
          listId={list.id}
          cardId={card.id}
          title={card.title}
          handleUpdateCard={handleUpdateBoard}
          handleRemoveCard={handleRemoveCard}
        />
      ))}
      <CardCreate isCardNew={isCardNew} setIsCardNew={setIsCardNew} handleCreateCard={handleCreateCard} />
    </div>
  );
};

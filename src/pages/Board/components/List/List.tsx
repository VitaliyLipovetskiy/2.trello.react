import React, { useRef, useState } from 'react';
import { IBoardList, ICreateCard } from '../../../../common/interfaces';
import { Card } from '../Card/Card';
import { CreateCard } from '../components';
import { createCard, updateListById } from '../../../../services/board/board.service';
import { validateTitle } from '../../../../utils/validates';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './list.scss';

type ListProps = {
  boarId: number;
  list: IBoardList;
  handleUpdateBoard: () => void;
};

export const List = ({ boarId, list, handleUpdateBoard }: ListProps) => {
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
      toast.warning('Update list title canceled');
    } else if (list.title !== title.trim()) {
      const fetchData = async () => {
        const { result } = await updateListById(boarId, list.id, { title: title.trim() });
        if (result === 'Updated') {
          handleUpdateBoard();
          toast.success('List title updated');
        } else {
          console.log('List title is not updated');
          toast.error('List title is not updated');
        }
      };
      fetchData().catch((error) => {
        console.log(error);
        toast.error(error);
      });
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
    console.log('handleCreateCard');
    const newCard: ICreateCard = {
      title,
      list_id: list.id,
      position: list.cards.map((c) => c.position).reduce((a, b) => Math.max(a, b), 0) + 1,
    };
    const { result } = await createCard(boarId, newCard);
    if (result === 'Created') {
      handleUpdateBoard();
      toast.success('New card created');
    } else {
      console.log('Card is not created');
      toast.error('Card is not created');
    }
  };

  return (
    <div className={'board-list'}>
      <button
          type="button"
          className="board-list-remove"
          data-dismiss="modal"
          aria-label="Видалити"
          aria-labelledby={'67'}
          // onClick={closeModal}
      >
        <span aria-hidden="true">&times;</span>
      </button>
      <div className={`${titleReadOnly ? 'board-list-title-readonly' : 'board-list-title-write'} board-list-title`}>
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
        <div className={'error'} hidden={errors.length === 0}>
          {errors.map((e) => (
            <p key={e}>{e}</p>
          ))}
        </div>
      </div>
      {list.cards.map((card) => (
        <Card
          key={card.id}
          boardId={boarId}
          listId={list.id}
          cardId={card.id}
          title={card.title}
          handleUpdateCard={handleUpdateBoard}
        />
      ))}
      <CreateCard isCardNew={isCardNew} setIsCardNew={setIsCardNew} handleCreateCard={handleCreateCard} />
    </div>
  );
};

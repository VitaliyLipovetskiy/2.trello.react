import React, { useRef, useState } from 'react';
import { Card } from '../Card/Card';
import { CardCreate } from '../CardCreate/CardCreate';
import { toast } from 'react-toastify';
import { Tooltip } from 'react-tooltip';
import useValidation from '../../../../hooks/useValidation';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { removeList, updateList } from '../../../../store/board/reducer';
import { boardAction } from '../../../../store/actions';
import { Link, Outlet, useLocation } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import s from './list.module.scss';

export const List = ({ id }: { id: number }) => {
  const dispatch = useAppDispatch();
  const { board } = useAppSelector((state) => state.board);
  const [titleReadOnly, setTitleReadOnly] = useState(true);
  const list = board?.lists.find((list) => list.id === id);
  const [title, setTitle] = useState(list?.title || '');
  const inputRef = useRef<HTMLInputElement>(null);
  const { errors, touched, setTouched } = useValidation(title);
  const location = useLocation();

  const handleChangeTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setTitle(e.target.value);
    setTouched(true);
  };

  const handleOnBlurTitle = async (e: React.FocusEvent<HTMLInputElement>) => {
    e.preventDefault();
    setTitleReadOnly(true);
    if (errors.length !== 0) {
      setTitle(list!.title);
      toast.warning('Оновлення списка скасовано');
    } else if (list?.title !== title.trim()) {
      try {
        const { result } = await dispatch(
          boardAction.updateListById({ boardId: board!.id, listId: id, data: { title: title.trim() } })
        ).unwrap();
        if (result === 'Updated') {
          dispatch(updateList({ listId: id, title }));
          toast.success(`Назва списка ${title} оновлена успішно`);
        } else {
          console.log(`Назва списка ${title} не оновлена`);
          toast.error(`Назва списка ${title} не оновлена`);
        }
      } catch (error) {
        console.log(error);
        if (error instanceof Error) {
          toast.error(error.message);
        }
      }
    }
  };

  const handleKeyUpEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (inputRef.current) {
        inputRef.current.blur();
      }
    }
  };

  const handleClickRemoveList = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      const { result } = await dispatch(boardAction.remoteListById({ boardId: board!.id, listId: id })).unwrap();
      if (result === 'Deleted') {
        dispatch(removeList(id));
        toast.success(`Список ${list?.title} видалений успішно`);
      } else {
        console.log(`Список ${list?.title} не видалений`);
        toast.error(`Список ${list?.title} не видалений`);
      }
    } catch (error) {
      console.log(error);
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };

  return (
    <div className={s.list}>
      <button className={s.btn__remove} data-tooltip-id="tooltip-remove-list" onClick={handleClickRemoveList}>
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
        <div className={s.error} hidden={!touched && errors.length === 0}>
          {errors.map((e) => (
            <p key={e}>{e}</p>
          ))}
        </div>
      </div>
      {list?.cards.map((card) => (
        <Link key={card.id} to={`card/${card.id}`} reloadDocument={true} state={{ background: location }}>
          <Card key={card.id} listId={list.id} cardId={card.id} />
        </Link>
      ))}
      <Outlet />
      <CardCreate listId={list!.id} />
    </div>
  );
};

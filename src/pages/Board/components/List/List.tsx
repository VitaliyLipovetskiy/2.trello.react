import React, { useRef, useState } from 'react';
import { Card } from '../Card/Card';
import { CardCreate } from '../CardCreate/CardCreate';
import { toast } from 'react-toastify';
import { Tooltip } from 'react-tooltip';
import useValidation from '../../../../hooks/useValidation';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import {
  hideCardDragged,
  hidePlaceholderSlot,
  removeList,
  setCardDragged,
  showPlaceholderSlot,
  updateList,
} from '../../../../store/board/reducer';
import { boardAction } from '../../../../store/actions';
import { Outlet } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import s from './list.module.scss';
import { ICardsUpdate } from '../../../../common/interfaces';

export const List = ({ id }: { id: number }) => {
  const dispatch = useAppDispatch();
  const { boardSlot } = useAppSelector((state) => state.board);
  const [titleReadOnly, setTitleReadOnly] = useState(true);
  const listSlot = boardSlot?.lists?.find((list) => list.id === id);
  const [title, setTitle] = useState(listSlot?.title || '');
  const inputRef = useRef<HTMLInputElement>(null);
  const { errors, touched, setTouched } = useValidation(title);
  const cardElementsRef = useRef<HTMLLIElement[]>([]);

  const handleChangeTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setTitle(e.target.value);
    setTouched(true);
  };

  const handleOnBlurTitle = async (e: React.FocusEvent<HTMLInputElement>) => {
    e.preventDefault();
    setTitleReadOnly(true);
    if (!listSlot || !boardSlot) return;
    if (errors.length !== 0) {
      setTitle(listSlot.title);
      toast.warning('Оновлення списка скасовано');
    } else if (listSlot.title !== title.trim()) {
      try {
        const { result } = await dispatch(
          boardAction.updateListById({ boardId: boardSlot.id, listId: id, data: { title: title.trim() } })
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
      const { result } = await dispatch(boardAction.remoteListById({ boardId: boardSlot!.id, listId: id })).unwrap();
      if (result === 'Deleted') {
        dispatch(removeList(id));
        toast.success(`Список ${listSlot?.title} видалений успішно`);
      } else {
        console.log(`Список ${listSlot?.title} не видалений`);
        toast.error(`Список ${listSlot?.title} не видалений`);
      }
    } catch (error) {
      console.log(error);
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    const target = e.currentTarget as HTMLLIElement;
    const cardId = target.dataset['id'];
    dispatch(setCardDragged({ cardId: cardId ? +cardId : undefined, listId: listSlot?.id }));

    if (!e.dataTransfer) {
      return;
    }
    e.dataTransfer.setData('card_id', cardId || '');
    e.dataTransfer.setData('list_id', listSlot?.id.toString() || '');
    e.dataTransfer.effectAllowed = 'move';

    const rect = target.getBoundingClientRect();

    const cardSlot = listSlot?.cardSlots?.find((s) => s.card?.id === (cardId ? +cardId : undefined));
    const text = cardSlot?.card?.title || '';

    const padding = 40;
    const canvasWidth = rect.width + padding * 2;
    const canvasHeight = rect.height + padding * 2;

    const canvas = document.createElement('canvas');
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      ctx.save();
      ctx.translate(canvasWidth / 2, canvasHeight / 2);
      ctx.rotate((3 * Math.PI) / 180);
      ctx.scale(1.02, 1.02);

      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 12;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 6;

      ctx.fillStyle = '#3b3b3b';
      const x = -rect.width / 2;
      const y = -rect.height / 2;
      const w = rect.width;
      const h = rect.height;
      const r = 5;
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
      ctx.fill();

      ctx.shadowColor = 'transparent';

      if (text) {
        ctx.fillStyle = 'white';
        ctx.font = '16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, -rect.width / 2 + 12, 0);
      }

      ctx.restore();

      canvas.style.position = 'fixed';
      canvas.style.top = '-9999px';
      document.body.appendChild(canvas);

      e.dataTransfer.setDragImage(canvas, canvasWidth / 2, canvasHeight / 2);

      setTimeout(() => {
        canvas.remove();
      }, 100);
    }

    setTimeout(() => {
      target.classList.add('dragging');
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    const target = e.currentTarget as HTMLLIElement;
    target.classList.remove('dragging');
    dispatch(setCardDragged({ cardId: undefined, listId: undefined }));
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (!e.dataTransfer?.types?.includes('card_id')) {
      return;
    }
    e.preventDefault();

    if (!listSlot) return;

    const elements = cardElementsRef.current;

    const targetIndex = elements.findIndex((el) => {
      const rect = el.getBoundingClientRect();
      return e.clientY < rect.top + rect.height / 2;
    });

    const actualCards = listSlot.cardSlots
      .filter((s) => !!s.card)
      .sort((a, b) => (a.card?.position || 0) - (b.card?.position || 0));

    let targetPosition: number;
    if (targetIndex === -1) {
      targetPosition = (actualCards.at(-1)?.card?.position || 0) + 1;
    } else {
      targetPosition = actualCards[targetIndex]?.card?.position || 1;
    }

    dispatch(showPlaceholderSlot({ targetPosition, listSlot }));
  };

  const handleDragLeave = (e: React.DragEvent) => {
    const list = (e.currentTarget as HTMLDivElement).children[0];
    const relatedTarget = e.relatedTarget as HTMLDivElement;
    if (list.contains(relatedTarget)) {
      return;
    }
    if (listSlot) {
      dispatch(hidePlaceholderSlot({ listSlot }));
    }
    console.log('handleDragLeave');
    dispatch(hideCardDragged());
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const draggedCardId = e.dataTransfer?.getData('card_id');
    const sourceListId = e.dataTransfer?.getData('list_id');

    if (!boardSlot || !listSlot) {
      return;
    }

    const placeholderHidden = listSlot.cardSlots.some((slot) => !slot.card && !slot.view);
    if (placeholderHidden) {
      return;
    }

    const data: ICardsUpdate[] = listSlot.cardSlots
      .filter((slot) => slot.card?.id !== +draggedCardId)
      .map((slot, index) => ({
        card: slot.card,
        position: index + 1,
      }))
      .filter((slot) => slot.position !== slot.card?.position)
      .map((slot) => ({
        id: slot.card?.id || +draggedCardId,
        position: slot.position,
        list_id: listSlot.id,
      }));

    if (+sourceListId !== listSlot.id) {
      const sourceList = boardSlot.lists?.find((l) => l.id === +sourceListId);
      if (sourceList) {
        // Беремо всі картки вихідного списку, крім тієї, що перетягнули і де помінявся номер позиції
        const sourceUpdates = sourceList.cardSlots
          .filter((slot) => !!slot.card && slot.card.id !== +draggedCardId)
          .map((slot, index) => ({
            card: slot.card,
            position: index + 1, // Перераховуємо позиції 1, 2, 3...
          }))
          .filter((slot) => slot.position !== slot.card!.position)
          .map((slot) => ({
            id: slot.card!.id,
            position: slot.position,
            list_id: sourceList.id,
          }));
        data.push(...sourceUpdates);
      }
    }

    try {
      const { result } = await dispatch(boardAction.updateGroupCards({ boardId: boardSlot.id, data })).unwrap();
      if (result === 'Updated') {
        dispatch(boardAction.getBoardById(boardSlot.id));
        toast.success(`Карточка ${draggedCardId} переміщена успішно`);
      } else {
        console.log(`Карточка ${draggedCardId} не переміщена`);
        toast.error(`Карточка${draggedCardId} не переміщена`);
      }
    } catch (error) {
      console.log(error);
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }

    dispatch(hidePlaceholderSlot({ listSlot }));
    dispatch(setCardDragged({ cardId: undefined, listId: undefined }));
  };

  return (
    <div
      id={listSlot?.id.toString()}
      className={s.list_wraper}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
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
        <ol className={s.container}>
          {listSlot?.cardSlots?.map((cardSlot) =>
            cardSlot.card ? (
              <li
                className={s.card_wrapper}
                key={cardSlot.card.id}
                draggable={true}
                data-type="card"
                data-id={cardSlot.card.id}
                data-position={cardSlot.position}
                ref={(el) => {
                  if (el) {
                    cardElementsRef.current.push(el);
                  }
                }}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              >
                {/*<Link to={`card/${card.id}`} reloadDocument={true} state={{ background: location }}>*/}
                <Card listId={listSlot.id} cardId={cardSlot.card.id} />
                {/*</Link>*/}
              </li>
            ) : (
              <li
                className={s.card_wrapper}
                key={-1}
                hidden={!cardSlot.view}
                data-type="placeholder"
                data-position={cardSlot.position}
              >
                <Card listId={listSlot.id} />
              </li>
            )
          )}
        </ol>
        <Outlet />
        {listSlot && <CardCreate listId={listSlot.id} />}
      </div>
    </div>
  );
};

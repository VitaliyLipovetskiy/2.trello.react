import React, { useEffect, useRef, useState } from 'react';
import { Card } from '../Card/Card';
import { CardCreate } from '../CardCreate/CardCreate';
import { toast } from 'react-toastify';
import { Tooltip } from 'react-tooltip';
import useValidation from '../../../../hooks/useValidation';
import { ConfirmModal, useConfirm } from '../../../../common/components';
import { dispatchWithToast } from '../../../../common/utils/dispatchWithToast';
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
import 'react-toastify/dist/ReactToastify.css';
import s from './list.module.scss';
import colors from '../../../../styles/variables.module.scss';
import { ICardsUpdate } from '../../../../common/interfaces';

export const List = ({ id }: { id: number }) => {
  const dispatch = useAppDispatch();
  const listSlot = useAppSelector((state) => state.board.boardSlot?.lists?.find((list) => list.id === id));
  const boardSlot = useAppSelector((state) => state.board.boardSlot);
  const [titleReadOnly, setTitleReadOnly] = useState(true);
  const [title, setTitle] = useState(listSlot?.title || '');
  const inputRef = useRef<HTMLInputElement>(null);
  const { errors, touched, setTouched } = useValidation(title);
  const cardElementsRef = useRef<HTMLLIElement[]>([]);
  const [draggingCardId, setDraggingCardId] = useState<number | null>(null);
  const escapeCancelledRef = useRef(false);
  const { confirm, confirmState, handleConfirm, handleCancel } = useConfirm();

  useEffect(() => {
    setTitle(listSlot?.title || '');
  }, [listSlot?.title]);

  const handleChangeTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setTitle(e.target.value);
    setTouched(true);
  };

  const handleOnBlurTitle = async (e: React.FocusEvent<HTMLInputElement>) => {
    e.preventDefault();
    setTitleReadOnly(true);
    if (escapeCancelledRef.current) {
      escapeCancelledRef.current = false;
      return;
    }
    if (!listSlot || !boardSlot) return;
    if (errors.length !== 0) {
      setTitle(listSlot.title);
      toast.warning('Оновлення списка скасовано');
    } else if (listSlot.title !== title.trim()) {
      await dispatchWithToast(
        dispatch(
          boardAction.updateListById({ boardId: boardSlot.id, listId: id, data: { title: title.trim() } })
        ).unwrap(),
        'Updated',
        `Назва списка ${title} оновлена успішно`,
        `Назва списка ${title} не оновлена`,
        () => dispatch(updateList({ listId: id, title: title.trim() }))
      );
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      inputRef.current?.blur();
    }
    if (e.key === 'Escape') {
      escapeCancelledRef.current = true;
      setTitle(listSlot?.title || '');
      setTouched(false);
      inputRef.current?.blur();
    }
  };

  const handleClickRemoveList = async (e: React.MouseEvent) => {
    e.preventDefault();
    const confirmed = await confirm(`Видалити список «${listSlot?.title}»?`);
    if (!confirmed) return;
    if (!boardSlot) return;
    await dispatchWithToast(
      dispatch(boardAction.removeListById({ boardId: boardSlot.id, listId: id })).unwrap(),
      'Deleted',
      `Список ${listSlot?.title} видалений успішно`,
      `Список ${listSlot?.title} не видалений`,
      () => dispatch(removeList(id))
    );
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.stopPropagation();
    const target = e.currentTarget as HTMLLIElement;
    const cardId = target.dataset['id'];
    dispatch(setCardDragged({ cardId: cardId ? +cardId : undefined, listId: listSlot?.id }));

    if (!e.dataTransfer) {
      return;
    }
    e.dataTransfer.setData('card_id', cardId || '');
    e.dataTransfer.setData('source_list_id', listSlot?.id.toString() || '');
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

      ctx.fillStyle = colors.primaryBackgroundElement;
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
        ctx.fillStyle = colors.primaryColor;
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

    const id = cardId ? +cardId : null;
    setTimeout(() => setDraggingCardId(id), 0);
  };

  const handleDragEnd = () => {
    setDraggingCardId(null);
    dispatch(setCardDragged({ cardId: undefined, listId: undefined }));
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (!e.dataTransfer?.types?.includes('card_id')) {
      return;
    }
    e.preventDefault();

    if (!listSlot) return;

    const elements = cardElementsRef.current.filter(Boolean);

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
    dispatch(hideCardDragged());
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    if (
      !e.dataTransfer ||
      !e.dataTransfer?.types?.includes('card_id') ||
      !e.dataTransfer.types?.includes('source_list_id')
    ) {
      return;
    }
    const draggedCardId = +e.dataTransfer.getData('card_id');
    const sourceListId = +e.dataTransfer.getData('source_list_id');

    if (!boardSlot || !listSlot) {
      return;
    }

    const placeholder = listSlot.cardSlots.find((slot) => !slot.card && slot.view);
    if (!placeholder) {
      return;
    }

    const placeholderPosition = placeholder.position;

    const otherSlots = listSlot.cardSlots
      .filter((slot) => !!slot.card && slot.card.id !== draggedCardId)
      .sort((a, b) => a.position - b.position);

    const insertIndex = otherSlots.filter((slot) => slot.position < placeholderPosition).length;
    const draggedNewPos = insertIndex + 1;

    const data: ICardsUpdate[] = [{ id: draggedCardId, position: draggedNewPos, list_id: listSlot.id }];

    otherSlots.forEach((slot, i) => {
      const newPos = i < insertIndex ? i + 1 : i + 2;
      if (slot.card && newPos !== slot.card.position) {
        data.push({ id: slot.card.id, position: newPos, list_id: listSlot.id });
      }
    });

    // For cross-list drag: renumber remaining cards in the source list
    if (sourceListId !== listSlot.id) {
      const sourceList = boardSlot.lists?.find((l) => l.id === sourceListId);
      if (sourceList) {
        const sourceUpdates = sourceList.cardSlots
          .filter((slot) => !!slot.card && slot.card.id !== draggedCardId)
          .map((slot, index) => ({
            card: slot.card,
            position: index + 1,
          }))
          .filter((slot) => slot.card && slot.position !== slot.card.position)
          .map((slot) => ({
            id: slot.card!.id,
            position: slot.position,
            list_id: sourceList.id,
          }));
        data.push(...sourceUpdates);
      }
    }

    const succeeded = await dispatchWithToast(
      dispatch(boardAction.updateGroupCards({ boardId: boardSlot.id, data })).unwrap(),
      'Updated',
      `Карточка ${draggedCardId} переміщена успішно`,
      `Карточка ${draggedCardId} не переміщена`,
      () => dispatch(boardAction.getBoardById(boardSlot.id))
    );

    if (!succeeded) dispatch(hidePlaceholderSlot({ listSlot }));
    dispatch(setCardDragged({ cardId: undefined, listId: undefined }));
  };

  const cardCount = listSlot?.cardSlots?.length || 0;
  useEffect(() => {
    cardElementsRef.current = cardElementsRef.current.slice(0, cardCount);
  }, [cardCount]);

  return (
    <div
      id={listSlot?.id.toString()}
      className={s.list_wraper}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className={s.list}>
        <button className={s.btn__remove} data-tooltip-id={`tooltip-remove-list-${id}`} onClick={handleClickRemoveList}>
          <span></span>
          <span></span>
        </button>
        <Tooltip id={`tooltip-remove-list-${id}`} className={s.tooltip} content="Видалити список!" place="left" />
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
            onKeyDown={handleKeyDown}
          />
          <div className={s.error} hidden={!touched && errors.length === 0}>
            {errors.map((e) => (
              <p key={e}>{e}</p>
            ))}
          </div>
        </div>
        <ol className={s.container}>
          {listSlot?.cardSlots?.map((cardSlot, index) =>
            cardSlot.card ? (
              <li
                className={`${s.card_wrapper}${draggingCardId === cardSlot.card.id ? ' dragging' : ''}`}
                key={cardSlot.card.id}
                draggable={true}
                data-type="card"
                data-id={cardSlot.card.id}
                data-position={cardSlot.position}
                ref={(el) => {
                  if (el) cardElementsRef.current[index] = el;
                }}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              >
                <Card listId={listSlot.id} cardId={cardSlot.card.id} />
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
        {listSlot && <CardCreate listId={listSlot.id} />}
      </div>
      {confirmState.isOpen && (
        <ConfirmModal message={confirmState.message} onConfirm={handleConfirm} onCancel={handleCancel} />
      )}
    </div>
  );
};

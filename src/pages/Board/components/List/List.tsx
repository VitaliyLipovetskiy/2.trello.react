import React, { JSX, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { Tooltip } from 'react-tooltip';
import { Card } from '../Card/Card';
import { CardCreate } from '../CardCreate/CardCreate';
import useValidation from '../../../../hooks/useValidation';
import { ConfirmModal, useConfirm } from '../../../../common/components';
import { dispatchWithToast } from '../../../../common/utils/dispatchWithToast';
import { useAppDispatch, useAppSelector, useAppStore } from '../../../../store/hooks';
import {
  applyCardUpdates,
  hideCardDragged,
  hidePlaceholderSlot,
  setCardDragged,
  showPlaceholderSlot,
} from '../../../../store/board/reducer';
import {
  useRemoveListByIdMutation,
  useUpdateGroupCardsMutation,
  useUpdateListByIdMutation,
} from '../../../../store/board/boardSlice';
import 'react-toastify/dist/ReactToastify.css';
import s from './list.module.scss';
import colors from '../../../../styles/variables.module.scss';
import { ICardsUpdate } from '../../../../common/interfaces';
import { isCardDrag, setActiveDragType } from '../../../../common/utils/dragState';

export const List = ({ id }: { id: number }): JSX.Element => {
  const dispatch = useAppDispatch();
  const store = useAppStore();
  const listSlot = useAppSelector((state) => state.board.boardSlot?.lists?.find((list) => list.id === id));
  const boardId = useAppSelector((state) => state.board.boardSlot?.id);
  const [updateListById] = useUpdateListByIdMutation();
  const [removeListById] = useRemoveListByIdMutation();
  const [updateGroupCards] = useUpdateGroupCardsMutation();
  const [titleReadOnly, setTitleReadOnly] = useState(true);
  const [title, setTitle] = useState(listSlot?.title || '');
  const inputRef = useRef<HTMLInputElement>(null);
  const { errors, touched, setTouched } = useValidation(title);
  const containerRef = useRef<HTMLOListElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const dragOverRafRef = useRef<number | null>(null);
  const pendingClientYRef = useRef<number | null>(null);
  const dragImageCanvasRef = useRef<HTMLElement | null>(null);
  const [draggingCardId, setDraggingCardId] = useState<number | null>(null);
  const escapeCancelledRef = useRef(false);
  const { confirm, confirmState, handleConfirm, handleCancel } = useConfirm();

  useEffect(
    () => () => {
      if (dragOverRafRef.current !== null) {
        cancelAnimationFrame(dragOverRafRef.current);
        dragOverRafRef.current = null;
      }
      dragImageCanvasRef.current?.remove();
      dragImageCanvasRef.current = null;
    },
    []
  );

  useEffect(() => {
    setTitle(listSlot?.title || '');
  }, [listSlot?.title]);

  useEffect(() => {
    if (!titleReadOnly) {
      inputRef.current?.focus();
    }
  }, [titleReadOnly]);

  const handleChangeTitle = (e: React.ChangeEvent<HTMLInputElement>): void => {
    e.preventDefault();
    setTitle(e.target.value);
    setTouched(true);
  };

  const handleOnBlurTitle = async (e: React.FocusEvent<HTMLInputElement>): Promise<void> => {
    e.preventDefault();
    setTitleReadOnly(true);
    if (escapeCancelledRef.current) {
      escapeCancelledRef.current = false;
      return;
    }
    if (!listSlot || boardId === undefined) return;
    if (errors.length !== 0) {
      setTitle(listSlot.title);
      toast.warning('Оновлення списка скасовано');
    } else if (listSlot.title !== title.trim()) {
      await dispatchWithToast(
        updateListById({ boardId, listId: id, data: { title: title.trim() } }).unwrap(),
        'Updated',
        `Назва списка ${title} оновлена успішно`,
        `Назва списка ${title} не оновлена`
      );
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
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

  const handleClickRemoveList = async (e: React.MouseEvent): Promise<void> => {
    e.preventDefault();
    const confirmed = await confirm(`Видалити список «${listSlot?.title}»?`);
    if (!confirmed) return;
    if (boardId === undefined) return;
    await dispatchWithToast(
      removeListById({ boardId, listId: id }).unwrap(),
      'Deleted',
      `Список ${listSlot?.title} видалений успішно`,
      `Список ${listSlot?.title} не видалений`
    );
  };

  const handleDragStart = (e: React.DragEvent): void => {
    e.stopPropagation();
    const target = e.currentTarget as HTMLLIElement;
    const cardId = target.dataset.id;
    dispatch(setCardDragged({ cardId: cardId ? +cardId : undefined, listId: listSlot?.id }));

    if (!e.dataTransfer) {
      return;
    }
    setActiveDragType('card');
    e.dataTransfer.setData('text/plain', JSON.stringify({ card_id: cardId, source_list_id: listSlot?.id }));
    e.dataTransfer.effectAllowed = 'move';

    const rect = target.getBoundingClientRect();

    const cardSlot = listSlot?.cardSlots?.find((slot) => slot.card?.id === (cardId ? +cardId : 0));
    const text = cardSlot?.card?.title || '';

    const padding = 40;
    const canvasWidth = rect.width + padding * 2;
    const canvasHeight = rect.height + padding * 2;

    const dpr = window.devicePixelRatio || 1;
    const canvas = document.createElement('canvas');
    canvas.width = canvasWidth * dpr;
    canvas.height = canvasHeight * dpr;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      ctx.save();
      ctx.translate(canvasWidth / 2, canvasHeight / 2);
      ctx.rotate((3 * Math.PI) / 180);
      ctx.scale(1.02, 1.02);

      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 12;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 6;

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

      ctx.fillStyle = '#211e43';
      ctx.fill();
      ctx.shadowColor = 'transparent';
      ctx.fillStyle = colors.primaryBackgroundElement;
      ctx.fill();

      if (text) {
        ctx.fillStyle = colors.primaryColor;
        ctx.font = '16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, -rect.width / 2 + 12, 0);
      }

      ctx.restore();

      const img = document.createElement('img');
      img.src = canvas.toDataURL('image/png');
      img.width = canvasWidth;
      img.height = canvasHeight;
      img.style.cssText = 'position:fixed;top:-9999px;left:0;pointer-events:none;';
      document.body.appendChild(img);

      e.dataTransfer.setDragImage(img, canvasWidth / 2, canvasHeight / 2);

      dragImageCanvasRef.current?.remove();
      dragImageCanvasRef.current = img;
    }

    const dragCardId = cardId ? +cardId : null;
    requestAnimationFrame(() => setDraggingCardId(dragCardId));
  };

  const handleDragEnd = (): void => {
    setActiveDragType(null);
    setDraggingCardId(null);
    dispatch(setCardDragged({ cardId: undefined, listId: undefined }));
    dragImageCanvasRef.current?.remove();
    dragImageCanvasRef.current = null;
    if (dragOverRafRef.current !== null) {
      cancelAnimationFrame(dragOverRafRef.current);
      dragOverRafRef.current = null;
    }
    if (listSlot) {
      dispatch(hidePlaceholderSlot({ listSlot }));
    }
  };

  const handleDragOver = (e: React.DragEvent): void => {
    if (!isCardDrag()) return;
    e.preventDefault();
    if (!listSlot) return;

    pendingClientYRef.current = e.clientY;
    if (dragOverRafRef.current !== null) return;

    dragOverRafRef.current = requestAnimationFrame(() => {
      dragOverRafRef.current = null;
      const clientY = pendingClientYRef.current;
      if (clientY == null || !listSlot || !containerRef.current) return;

      const cardEls = Array.from(containerRef.current.querySelectorAll<HTMLLIElement>('li[data-type="card"]'));

      const targetIndex = cardEls.findIndex((el) => {
        const rect = el.getBoundingClientRect();
        return clientY < rect.top + rect.height / 2;
      });

      const actualCards = listSlot.cardSlots
        .filter((slot) => !!slot.card)
        .sort((a, b) => (a.card?.position || 0) - (b.card?.position || 0));

      let targetPosition: number;
      if (targetIndex === -1) {
        targetPosition = (actualCards.at(-1)?.card?.position || 0) + 1;
      } else {
        targetPosition = actualCards[targetIndex]?.card?.position || 1;
      }

      dispatch(showPlaceholderSlot({ targetPosition, listSlot }));
    });
  };

  const handleDragLeave = (e: React.DragEvent): void => {
    if (!isCardDrag()) return;
    const rect = rootRef.current?.getBoundingClientRect();
    if (
      rect &&
      e.clientX >= rect.left &&
      e.clientX <= rect.right &&
      e.clientY >= rect.top &&
      e.clientY <= rect.bottom
    ) {
      return;
    }
    if (dragOverRafRef.current !== null) {
      cancelAnimationFrame(dragOverRafRef.current);
      dragOverRafRef.current = null;
    }
    if (listSlot) {
      dispatch(hidePlaceholderSlot({ listSlot }));
    }
    dispatch(hideCardDragged());
  };

  const handleDrop = async (e: React.DragEvent): Promise<void> => {
    e.preventDefault();
    if (!isCardDrag() || !e.dataTransfer) {
      return;
    }
    let parsed: { card_id?: string; source_list_id?: string } = {};
    try {
      parsed = JSON.parse(e.dataTransfer.getData('text/plain') || '{}') as {
        card_id: string;
        source_list_id: string;
      };
    } catch {
      return;
    }
    const draggedCardId = +(parsed.card_id ?? '');
    const sourceListId = +(parsed.source_list_id ?? '');

    if (boardId === undefined || !listSlot) {
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

    if (sourceListId !== listSlot.id) {
      const sourceList = store.getState().board.boardSlot?.lists?.find((l) => l.id === sourceListId);
      if (sourceList) {
        const sourceUpdates = sourceList.cardSlots
          .filter((slot) => !!slot.card && slot.card.id !== draggedCardId)
          .map((slot, index) => ({
            card: slot.card,
            position: index + 1,
          }))
          .filter((slot) => slot.card && slot.position !== slot.card.position)
          .map((slot) => ({
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            id: slot.card!.id,
            position: slot.position,
            list_id: sourceList.id,
          }));
        data.push(...sourceUpdates);
      }
    }

    const succeeded = await dispatchWithToast(
      updateGroupCards({ boardId, data }).unwrap(),
      'Updated',
      `Карточка ${draggedCardId} переміщена успішно`,
      `Карточка ${draggedCardId} не переміщена`,
      () => dispatch(applyCardUpdates(data))
    );

    if (!succeeded) dispatch(hidePlaceholderSlot({ listSlot }));
    dispatch(setCardDragged({ cardId: undefined, listId: undefined }));
  };

  return (
    <div
      id={listSlot?.id.toString()}
      ref={rootRef}
      className={s.list_wrapper}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className={s.list}>
        <button
          aria-label="Видалити список"
          className={s.btn__remove}
          data-tooltip-id={`tooltip-remove-list-${id}`}
          onClick={handleClickRemoveList}
        >
          <span />
          <span />
        </button>
        <Tooltip id={`tooltip-remove-list-${id}`} className={s.tooltip} content="Видалити список!" place="left" />
        <div className={`${titleReadOnly ? s.list_title_readonly : s.list_title_write} ${s.list_title}`}>
          <input
            name="title"
            type="text"
            value={title}
            ref={inputRef}
            required
            readOnly={titleReadOnly}
            autoFocus={!titleReadOnly}
            onClick={(): void => setTitleReadOnly(false)}
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
        <ol className={s.container} ref={containerRef}>
          {listSlot?.cardSlots?.map((cardSlot) =>
            cardSlot.card ? (
              <li
                className={`${s.card_wrapper}${draggingCardId === cardSlot.card.id ? ' dragging' : ''}`}
                key={cardSlot.card.id}
                draggable
                data-type="card"
                data-id={cardSlot.card.id}
                data-position={cardSlot.position}
                aria-roledescription="Перетягувана картка"
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              >
                <Card listId={listSlot.id} cardId={cardSlot.card.id} />
              </li>
            ) : (
              <li
                className={s.card_wrapper}
                key={`placeholder-${listSlot.id}`}
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

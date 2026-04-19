import React, { useEffect, useRef, useState } from 'react';
import { Link, Outlet, useParams } from 'react-router-dom';
import { ListCreate, List } from './components';
import { IBoardUpdate, IListSlot, IListsUpdate } from '../../common/interfaces';
import { ToastContainer, toast } from 'react-toastify';
import { ProgressBar } from '../../common/components';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { boardAction } from '../../store/actions';
import useValidation from '../../hooks/useValidation';
import { dispatchWithToast } from '../../common/utils/dispatchWithToast';
import { clearListDragged, hideListPlaceholder, setListDragged, showListPlaceholder } from '../../store/board/reducer';
import 'react-toastify/dist/ReactToastify.css';
import s from './board.module.scss';
import colors from '../../styles/variables.module.scss';

const Board = () => {
  const { boardId } = useParams();
  const dispatch = useAppDispatch();
  const { boardSlot, listDragged, listPlaceholderBeforeId } = useAppSelector((state) => state.board);
  const [title, setTitle] = useState('');
  const [titleEdit, setTitleEdit] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState(boardSlot?.custom?.background || '');
  const inputTitleRef = useRef<HTMLInputElement>(null);
  const inputColorRef = useRef<HTMLInputElement>(null);
  const colorDebounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const listElementsRef = useRef<HTMLDivElement[]>([]);
  const { errors, touched, setTouched } = useValidation(title);
  const escapeCancelledRef = useRef(false);

  useEffect(() => {
    if (boardId) {
      dispatch(boardAction.getBoardById(+boardId));
    }
  }, [boardId, dispatch]);

  useEffect(() => {
    return () => clearTimeout(colorDebounceRef.current);
  }, []);

  useEffect(() => {
    setTitle(boardSlot?.title || '');
    setBackgroundColor(boardSlot?.custom?.background || '');
  }, [boardSlot?.custom?.background, boardSlot?.title]);

  const handleOnBlurTitle = async () => {
    setTitleEdit(false);
    if (escapeCancelledRef.current) {
      escapeCancelledRef.current = false;
      return;
    }
    if (errors.length > 0) {
      setTitle(boardSlot?.title || '');
      toast.warning('Назва дошки не оновлена');
    } else if (boardSlot && touched && boardSlot.title !== title.trim()) {
      await dispatchWithToast(
        dispatch(boardAction.updateBoardById({ id: +(boardId || 0), data: { title: title.trim() } })).unwrap(),
        'Updated',
        'Дошку оновлено успішно',
        'Дошку не оновлено'
      );
    }
  };

  const handleColorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setBackgroundColor(value);
    clearTimeout(colorDebounceRef.current);
    colorDebounceRef.current = setTimeout(async () => {
      if (value !== boardSlot?.custom?.background) {
        const boardUpdate: IBoardUpdate = { title: boardSlot?.title || '', custom: { background: value } };
        const success = await dispatchWithToast(
          dispatch(boardAction.updateBoardById({ id: +(boardId || 0), data: boardUpdate })).unwrap(),
          'Updated',
          'Дошку оновлено успішно',
          'Дошку не оновлено'
        );
        if (!success) setBackgroundColor(boardSlot?.custom?.background || '');
      }
    }, 400);
  };

  const handleChangeTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    setTouched(true);
  };

  const handleKeyDownTitle = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      inputTitleRef.current?.blur();
    }
    if (e.key === 'Escape') {
      escapeCancelledRef.current = true;
      setTitle(boardSlot?.title || '');
      setTouched(false);
      inputTitleRef.current?.blur();
    }
  };

  const drawListDragImage = (e: React.DragEvent, listSlot: IListSlot, element: HTMLDivElement) => {
    const rect = element.getBoundingClientRect();
    const pad = 4;
    const canvasWidth = rect.width + pad * 2;
    const canvasHeight = rect.height + pad * 2;

    const canvas = document.createElement('canvas');
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const drawRoundRect = (c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
      c.beginPath();
      c.moveTo(x + r, y);
      c.lineTo(x + w - r, y);
      c.quadraticCurveTo(x + w, y, x + w, y + r);
      c.lineTo(x + w, y + h - r);
      c.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      c.lineTo(x + r, y + h);
      c.quadraticCurveTo(x, y + h, x, y + h - r);
      c.lineTo(x, y + r);
      c.quadraticCurveTo(x, y, x + r, y);
      c.closePath();
    };

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.save();
    ctx.translate(canvasWidth / 2, canvasHeight / 2);
    ctx.rotate((2 * Math.PI) / 180);

    // List background with shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 16;
    ctx.shadowOffsetX = 4;
    ctx.shadowOffsetY = 8;
    ctx.fillStyle = colors.primaryBackground;
    const lx = -rect.width / 2;
    const ly = -rect.height / 2;
    drawRoundRect(ctx, lx, ly, rect.width, rect.height, 10);
    ctx.fill();
    ctx.shadowColor = 'transparent';

    ctx.fillStyle = colors.primaryColor;
    ctx.font = 'bold 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textBaseline = 'middle';
    ctx.fillText(listSlot.title, lx + 10, ly + 26, rect.width - 40);

    const btnMargin = 6;
    const btnPadV = 10;
    const btnFontSize = 16;
    const btnLineH = btnFontSize * 1.5;
    const btnH = btnPadV * 2 + btnLineH;
    const btnY = ly + rect.height - btnMargin - btnH;
    const btnX = lx + btnMargin;
    const btnW = rect.width - btnMargin * 2;

    ctx.fillStyle = colors.primaryBackground;
    drawRoundRect(ctx, btnX, btnY, btnW, btnH, 10);
    ctx.fill();

    ctx.fillStyle = colors.secondaryBackground;
    ctx.font = `${btnFontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.textBaseline = 'middle';
    ctx.fillText('+ Додати картку', btnX + 10, btnY + btnH / 2);

    // Cards (stop before button area)
    const cards = listSlot.cardSlots
      .filter((s) => s.card && s.view)
      .map((s) => s.card!)
      .sort((a, b) => a.position - b.position);

    const cardPad = 5;
    const cardH = 32;
    const cardGap = 3;
    let cardY = ly + 48;
    const cardAreaBottom = btnY - cardGap;

    for (const card of cards) {
      if (cardY + cardH > cardAreaBottom) break;
      ctx.fillStyle = colors.primaryBackgroundElement;
      drawRoundRect(ctx, lx + cardPad, cardY, rect.width - cardPad * 2, cardH, 5);
      ctx.fill();
      ctx.fillStyle = colors.primaryColor;
      ctx.font = '14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.textBaseline = 'middle';
      ctx.fillText(card.title, lx + cardPad + 8, cardY + cardH / 2, rect.width - cardPad * 2 - 16);
      cardY += cardH + cardGap;
    }

    ctx.restore();

    canvas.style.position = 'fixed';
    canvas.style.top = '-9999px';
    document.body.appendChild(canvas);
    e.dataTransfer.setDragImage(canvas, canvasWidth / 2, canvasHeight / 2);
    setTimeout(() => canvas.remove(), 100);
  };

  const handleListDragStart = (e: React.DragEvent, listSlot: IListSlot, index: number) => {
    e.stopPropagation();
    e.dataTransfer.setData('list_id', listSlot.id.toString());
    e.dataTransfer.effectAllowed = 'move';

    const element = listElementsRef.current[index];
    if (element) {
      drawListDragImage(e, listSlot, element);
    }

    // dispatch after drag image is captured — React re-render applies opacity
    dispatch(setListDragged({ listId: listSlot.id }));
  };

  const handleListDragEnd = () => {
    dispatch(clearListDragged());
  };

  const handleContainerDragOver = (e: React.DragEvent) => {
    if (!e.dataTransfer?.types?.includes('list_id')) return;
    e.preventDefault();
    if (!listDragged || !boardSlot?.lists) return;

    const sortedLists = [...boardSlot.lists].sort((a, b) => a.position - b.position);
    const draggedIndex = sortedLists.findIndex((l) => l.id === listDragged.id);
    const elements = listElementsRef.current.filter(Boolean);

    const hoverIndex = elements.findIndex((el) => {
      const rect = el.getBoundingClientRect();
      return e.clientX < rect.left + rect.width / 2;
    });

    // No-op: would stay in the same position
    const isAdjacentToDragged =
      hoverIndex === draggedIndex ||
      hoverIndex === draggedIndex + 1 ||
      (hoverIndex === -1 && draggedIndex === sortedLists.length - 1);

    if (isAdjacentToDragged) {
      dispatch(hideListPlaceholder());
      return;
    }

    const beforeId = hoverIndex === -1 ? null : sortedLists[hoverIndex].id;
    dispatch(showListPlaceholder({ beforeId }));
  };

  const handleContainerDragLeave = (e: React.DragEvent) => {
    if (!e.dataTransfer?.types?.includes('list_id')) return;
    if ((e.currentTarget as HTMLElement).contains(e.relatedTarget as Node)) return;
    dispatch(hideListPlaceholder());
  };

  const handleContainerDrop = async (e: React.DragEvent) => {
    if (!e.dataTransfer?.types?.includes('list_id')) return;
    e.preventDefault();

    const draggedId = +(e.dataTransfer.getData('list_id') || 0);
    const targetBeforeId = listPlaceholderBeforeId;

    dispatch(clearListDragged());

    if (!draggedId || !boardSlot || targetBeforeId === undefined) return;

    const sortedLists = [...(boardSlot.lists || [])].sort((a, b) => a.position - b.position);
    const listsWithoutDragged = sortedLists.filter((l) => l.id !== draggedId);
    const draggedList = sortedLists.find((l) => l.id === draggedId);
    if (!draggedList) return;

    const insertIndex =
      targetBeforeId === null
        ? listsWithoutDragged.length
        : listsWithoutDragged.findIndex((l) => l.id === targetBeforeId);

    if (insertIndex === -1) return;

    const newOrder = [...listsWithoutDragged];
    newOrder.splice(insertIndex, 0, draggedList);

    const data: IListsUpdate[] = newOrder
      .map((l, i) => ({ id: l.id, position: i + 1 }))
      .filter((item) => {
        const original = sortedLists.find((l) => l.id === item.id);
        return original?.position !== item.position;
      });

    if (data.length === 0) return;

    await dispatchWithToast(
      dispatch(boardAction.updateGroupLists({ boardId: boardSlot.id, data })).unwrap(),
      'Updated',
      'Список переміщено успішно',
      'Список не переміщено',
      () => dispatch(boardAction.getBoardById(boardSlot.id))
    );
  };

  const sortedLists = [...(boardSlot?.lists || [])].sort((a, b) => a.position - b.position);

  useEffect(() => {
    listElementsRef.current = listElementsRef.current.slice(0, sortedLists.length);
  }, [sortedLists.length]);

  return (
    <ProgressBar>
      <div className={s.board}>
        <header>
          <div className={s.header}>
            <div className={s.content}>
              <div className={`${s.title} ${titleEdit ? s.title_edit : ''}`}>
                <input
                  id={'title'}
                  name={'title'}
                  type={'text'}
                  value={title}
                  ref={inputTitleRef}
                  required
                  readOnly={!titleEdit}
                  autoFocus={titleEdit}
                  onClick={() => setTitleEdit(true)}
                  onChange={handleChangeTitle}
                  onBlur={handleOnBlurTitle}
                  onKeyDown={handleKeyDownTitle}
                />
                <div className={s.error} hidden={!touched || errors.length === 0}>
                  {errors.map((e) => (
                    <p key={e}>{e}</p>
                  ))}
                </div>
              </div>
            </div>
            <div className={s.home}>
              <Link to={'/'}>{'<-Додому'}</Link>
            </div>
            <div className={s.color_picker_wrapper}>
              <input
                type="color"
                className={s.color_input}
                ref={inputColorRef}
                value={backgroundColor || '#000000'}
                onChange={handleColorChange}
              ></input>
              <button
                className={`${s.color_swatch} ${backgroundColor ? '' : s.color_swatch_empty}`}
                style={backgroundColor ? { backgroundColor } : undefined}
                onClick={() => inputColorRef.current?.click()}
              />
            </div>
          </div>
        </header>
        <div
          className={s.container}
          onDragOver={handleContainerDragOver}
          onDragLeave={handleContainerDragLeave}
          onDrop={handleContainerDrop}
        >
          {sortedLists.map((listSlot, index) => (
            <React.Fragment key={listSlot.id}>
              {listPlaceholderBeforeId === listSlot.id && <div className={s.list_placeholder} />}
              <div
                ref={(el) => {
                  if (el) listElementsRef.current[index] = el;
                }}
                className={listSlot.view === false ? s.list_dragging : ''}
                draggable
                onDragStart={(e) => handleListDragStart(e, listSlot, index)}
                onDragEnd={handleListDragEnd}
              >
                <List id={listSlot.id} />
              </div>
            </React.Fragment>
          ))}
          {listPlaceholderBeforeId === null && <div className={s.list_placeholder} />}
          <ListCreate />
        </div>
      </div>
      <Outlet />
      <ToastContainer />
    </ProgressBar>
  );
};

export default Board;

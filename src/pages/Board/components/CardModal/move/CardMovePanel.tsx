import React, { JSX, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { ICard, ICardsUpdate, IList } from '../../../../../common/interfaces';
import {
  useGetAllBoardsQuery,
  useGetBoardByIdQuery,
  useCreateCardMutation,
  useUpdateGroupCardsMutation,
  useRemoveCardByIdMutation,
} from '../../../../../store/board/boardSlice';
import s from './card-move-panel.module.scss';

interface CardMoveProps {
  mode: 'move' | 'copy';
  card: ICard;
  currentBoardId: number;
  currentListId: number;
  onClose: () => void;
  onBack?: () => void;
  onSuccess: () => void;
}

export const CardMovePanel = ({
  mode,
  card,
  currentBoardId,
  currentListId,
  onClose,
  onBack,
  onSuccess,
}: CardMoveProps): JSX.Element => {
  const originBoardId = useRef(currentBoardId).current;
  const [copyTitle, setCopyTitle] = useState(`${card.title} - копія`);
  const [selectedBoardId, setSelectedBoardId] = useState(originBoardId);
  const [selectedListId, setSelectedListId] = useState<number | null>(currentListId);
  const [selectedPosition, setSelectedPosition] = useState(1);

  const { data: allBoards } = useGetAllBoardsQuery();
  const { data: targetBoardData, isFetching: targetBoardFetching } = useGetBoardByIdQuery(selectedBoardId, {
    skip: !selectedBoardId,
  });
  const { data: currentBoardData } = useGetBoardByIdQuery(originBoardId, { skip: !originBoardId });
  const [createCard] = useCreateCardMutation();
  const [updateGroupCards] = useUpdateGroupCardsMutation();
  const [removeCardById] = useRemoveCardByIdMutation();

  const targetLists = targetBoardData?.lists ?? [];
  const targetList = targetLists.find((l) => l.id === selectedListId);
  const otherCards = (targetList?.cards ?? [])
    .filter((c) => !(mode === 'move' && selectedBoardId === originBoardId && c.id === card.id))
    .sort((a, b) => a.position - b.position);
  const maxPosition = otherCards.length + 1;

  const currentBoardLists = currentBoardData?.lists ?? [];
  const currentIndex = currentBoardLists.findIndex((l) => l.id === currentListId);
  const prevList = currentIndex > 0 ? currentBoardLists[currentIndex - 1] : null;
  const nextList =
    currentIndex !== -1 && currentIndex < currentBoardLists.length - 1 ? currentBoardLists[currentIndex + 1] : null;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (targetLists.length > 0) {
      const defaultList = targetLists.find((l) => l.id === currentListId) ?? targetLists[0];
      setSelectedListId(defaultList.id);
    }
  }, [selectedBoardId, targetLists, currentListId]);

  useEffect(() => {
    setSelectedPosition(otherCards.length + 1);
  }, [selectedListId, otherCards.length]);

  const handleBoardChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    setSelectedBoardId(Number(e.target.value));
    setSelectedListId(null);
  };

  const handleListChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    setSelectedListId(Number(e.target.value));
  };

  const buildPositionUpdates = (): ICardsUpdate[] => {
    const updates: ICardsUpdate[] = [];
    let pos = 1;
    let inserted = false;
    for (let i = 0; i <= otherCards.length; i++) {
      if (!inserted && pos === selectedPosition && selectedListId) {
        updates.push({ id: card.id, list_id: selectedListId, position: pos++ });
        inserted = true;
      }
      if (i < otherCards.length && selectedListId) {
        updates.push({ id: otherCards[i].id, list_id: selectedListId, position: pos++ });
      }
    }
    if (!inserted && selectedListId) {
      updates.push({ id: card.id, list_id: selectedListId, position: pos });
    }
    return updates;
  };

  const quickMoveToList = async (destList: IList): Promise<void> => {
    const sortedDest = [...destList.cards].sort((a, b) => a.position - b.position);
    const newPosition = sortedDest.length + 1;
    const updates: ICardsUpdate[] = [
      ...sortedDest.map((c, i) => ({ id: c.id, list_id: destList.id, position: i + 1 })),
      { id: card.id, list_id: destList.id, position: newPosition },
    ];
    const sourceList = currentBoardLists.find((l) => l.id === currentListId);
    if (sourceList) {
      const sourceUpdates = [...sourceList.cards]
        .filter((c) => c.id !== card.id)
        .sort((a, b) => a.position - b.position)
        .map((c, i) => ({ id: c.id, list_id: sourceList.id, position: i + 1 }));
      updates.push(...sourceUpdates);
    }
    await updateGroupCards({ boardId: originBoardId, data: updates }).unwrap();
  };

  const executeCopy = async (): Promise<void> => {
    if (!selectedListId) return;
    await createCard({
      boardId: selectedBoardId,
      data: {
        title: copyTitle.trim() || card.title,
        list_id: selectedListId,
        position: selectedPosition,
        description: card.description,
      },
    }).unwrap();
    toast.success('Картку скопійовано');
  };

  const executeMove = async (): Promise<void> => {
    if (!targetList) return;
    if (selectedBoardId === originBoardId) {
      await updateGroupCards({ boardId: originBoardId, data: buildPositionUpdates() }).unwrap();
    } else if (selectedListId) {
      await createCard({
        boardId: selectedBoardId,
        data: { title: card.title, list_id: selectedListId, position: selectedPosition, description: card.description },
      }).unwrap();
      // removeCardById викликається після успішного createCard.
      // Якщо видалення впаде — ловимо окремо, щоб не маскувати помилку за загальним catch у handleSubmit
      try {
        await removeCardById({ boardId: originBoardId, cardId: card.id }).unwrap();
      } catch {
        toast.error('Картку створено на новій дошці, але не вдалося видалити оригінал — видаліть вручну');
        return;
      }
    }
    toast.success('Картку переміщено');
  };

  const handleSubmit = async (): Promise<void> => {
    try {
      await (mode === 'copy' ? executeCopy() : executeMove());
      onSuccess();
    } catch {
      toast.error(mode === 'copy' ? 'Не вдалося скопіювати картку' : 'Не вдалося перемістити картку');
    }
  };

  const handleMoveToPrevList = async (): Promise<void> => {
    if (!prevList) return;
    try {
      await quickMoveToList(prevList);
      toast.success('Картку переміщено');
      onSuccess();
    } catch {
      toast.error('Не вдалося перемістити картку');
    }
  };

  const handleMoveToNextList = async (): Promise<void> => {
    if (!nextList) return;
    try {
      await quickMoveToList(nextList);
      toast.success('Картку переміщено');
      onSuccess();
    } catch {
      toast.error('Не вдалося перемістити картку');
    }
  };

  return (
    <div
      className={s.overlay}
      role="presentation"
      onClick={(e): void => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={s.panel} role="dialog" aria-modal="true">
        <div className={s.panel_header}>
          {onBack && (
            <button className={s.btn_back} aria-label="Назад до меню" onClick={onBack}>
              ＜
            </button>
          )}
          <span>{mode === 'move' ? 'Перемістити картку' : 'Копіювати картку'}</span>
          <button className={s.btn__close} aria-label="Закрити" onClick={onClose}>
            <span />
            <span />
          </button>
        </div>
        <div className={s.panel_body}>
          {mode === 'move' && (
            <div className={s.recommended}>
              <span>Рекомендовано</span>
              <button hidden={prevList === null} onClick={handleMoveToPrevList}>
                <span>←</span>
                <span>{prevList?.title}</span>
              </button>
              <button hidden={nextList === null} onClick={handleMoveToNextList}>
                <span>→</span>
                <span>{nextList?.title}</span>
              </button>
            </div>
          )}
          {mode === 'copy' && (
            <label className={s.field}>
              <span className={s.label}>Назва</span>
              <textarea value={copyTitle} onChange={(e): void => setCopyTitle(e.target.value)} />
            </label>
          )}
          <span className={s.label_dest}>{mode === 'copy' ? 'Скопіювати в...' : 'Вибрати місце призначення'}</span>
          <label className={s.field}>
            <span className={s.label_bold}>Дошка</span>
            <select value={selectedBoardId} onChange={handleBoardChange}>
              {allBoards?.boards.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.title}
                </option>
              ))}
            </select>
          </label>
          <div className={s.list}>
            <label className={s.field}>
              <span className={s.label_bold}>Список</span>
              <select value={selectedListId || 0} onChange={handleListChange}>
                {targetLists.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.title}
                  </option>
                ))}
              </select>
            </label>
            <label className={s.field}>
              <span className={s.label_bold}>Позиція</span>
              <select value={selectedPosition} onChange={(e): void => setSelectedPosition(Number(e.target.value))}>
                {Array.from({ length: maxPosition }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <button className={s.btn_submit} onClick={handleSubmit} disabled={targetBoardFetching || !targetList}>
            {mode === 'move' ? 'Перемістити' : 'Створити картку'}
          </button>
        </div>
      </div>
    </div>
  );
};

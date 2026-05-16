import React, { JSX, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { toast } from 'react-toastify';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { clearCard, setCard, updateCard } from '../../../../store/board/reducer';
import useValidation from '../../../../hooks/useValidation';
import { ICardUpdate } from '../../../../common/interfaces';
import {
  useUpdateCardByIdMutation,
  useRemoveCardByIdMutation,
  useUpdateCardUsersMutation,
} from '../../../../store/board/boardSlice';
import s from './card-modal.module.scss';
import transformMarkdown from '../../../../hooks/useMarkdown';
import { ConfirmModal, useConfirm } from '../../../../common/components';
import { dispatchWithToast } from '../../../../common/utils/dispatchWithToast';
import { CardMovePanel } from './move/CardMovePanel';
import { CardMenu } from './move/CardMenu';
import { CardActionsBar } from './actions/CardActionsBar';
import { CardMembers } from './members/CardMembers';

export const CardModal = (): JSX.Element | null => {
  const { cardId } = useParams();
  const navigate = useNavigate();
  const { cardSlot, boardSlot, listSlot } = useAppSelector((state) => state.board);
  const userId = useAppSelector((state) => state.auth.userId);
  const dispatch = useAppDispatch();
  const [updateCardById] = useUpdateCardByIdMutation();
  const [removeCardById] = useRemoveCardByIdMutation();
  const [updateCardUsers] = useUpdateCardUsersMutation();
  const [formData, setFormData] = useState({
    title: cardSlot?.card?.title || '',
    description: cardSlot?.card?.description || '',
  });
  const { errors, setTouched: setTitleTouched, touched: titleTouched } = useValidation(formData.title);
  const rootRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const { confirm, confirmState, handleConfirm, handleCancel } = useConfirm();
  const [editingDescription, setEditingDescription] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [panelMode, setPanelMode] = useState<'move' | 'copy' | null>(null);
  const [panelSource, setPanelSource] = useState<'menu' | 'list'>('menu');
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const innerHTML = useMemo(() => transformMarkdown(formData.description), [formData.description]);
  const escapeCancelledRef = useRef(false);
  const confirmOpenRef = useRef(false);
  confirmOpenRef.current = confirmState.isOpen;
  const panelModeRef = useRef<'move' | 'copy' | null>(null);
  panelModeRef.current = panelMode;
  const menuOpenRef = useRef(false);
  menuOpenRef.current = menuOpen;
  const closingRef = useRef(false);

  const handleModalClose = useCallback((): void => {
    closingRef.current = true;
    dispatch(clearCard());
    navigate(`/board/${boardSlot?.id}`);
  }, [dispatch, navigate, boardSlot?.id]);

  useEffect(() => {
    const handleWrapperClick = (event: MouseEvent): void => {
      const { target } = event;
      if (target instanceof Node && rootRef.current?.contains(target) && !modalRef.current?.contains(target)) {
        if (panelModeRef.current) {
          setPanelMode(null);
        } else {
          handleModalClose();
        }
      }
    };
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        if (confirmOpenRef.current) {
          return;
        }
        if (panelModeRef.current) {
          setPanelMode(null);
          return;
        }
        if (menuOpenRef.current) {
          setMenuOpen(false);
          return;
        }
        handleModalClose();
      }
    };
    document.addEventListener('click', handleWrapperClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('click', handleWrapperClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleModalClose]);

  useEffect(() => {
    if (closingRef.current) return;
    if (cardSlot || !boardSlot?.id || !boardSlot?.lists || !cardId) return;
    const numericId = Number(cardId);
    if (!Number.isFinite(numericId)) {
      handleModalClose();
      return;
    }
    const foundList = boardSlot.lists.find((list) => list.cardSlots.some((cs) => cs.card?.id === numericId));
    if (foundList) {
      const found = foundList.cardSlots.find((cs) => cs.card?.id === numericId);
      dispatch(setCard({ cardSlot: found, listSlot: foundList }));
      return;
    }
    toast.warning(`Картка ${cardId} не знайдена`);
    handleModalClose();
  }, [cardSlot, boardSlot, cardId, dispatch, handleModalClose]);

  useEffect(() => {
    if (!cardSlot?.card?.id || !boardSlot?.lists) return;
    const foundList = boardSlot.lists.find((list) => list.cardSlots.some((cs) => cs.card?.id === cardSlot.card?.id));
    if (!foundList) return;
    const found = foundList.cardSlots.find((cs) => cs.card?.id === cardSlot.card?.id);
    dispatch(setCard({ cardSlot: found, listSlot: foundList }));
  }, [boardSlot?.lists]); // навмисно — реагуємо лише на оновлення борду після рефетчу

  useEffect(() => {
    setFormData({
      title: cardSlot?.card?.title || '',
      description: cardSlot?.card?.description || '',
    });
  }, [cardSlot]);

  if (!cardSlot) {
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    e.preventDefault();
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
    if (name === 'title') {
      setTitleTouched(true);
    }
  };

  const setDefaultValues = (): void => {
    setFormData({
      title: cardSlot?.card?.title || '',
      description: cardSlot?.card?.description || '',
    });
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    if (e.key !== 'Escape') return;

    const { name, value } = e.currentTarget;
    const initialValue = name === 'title' ? cardSlot?.card?.title : cardSlot?.card?.description;

    e.stopPropagation();

    if (value.trim() !== initialValue?.trim()) {
      escapeCancelledRef.current = true;
      setDefaultValues();
    }
    if (e.currentTarget.tagName === 'TEXTAREA') {
      setEditingDescription(false);
    }
    e.currentTarget.blur();
  };

  const handleInputOnBlur = async (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>): Promise<void> => {
    e.preventDefault();
    setEditingDescription(false);
    if (escapeCancelledRef.current) {
      escapeCancelledRef.current = false;
      return;
    }
    if (errors.length !== 0) {
      setDefaultValues();
      toast.warning('Оновлення карточки скасовано');
      return;
    }
    const nextDescription = formData.description.trim() || undefined;
    const prevDescription = cardSlot?.card?.description?.trim() || undefined;
    if (formData.title.trim() === cardSlot?.card?.title?.trim() && nextDescription === prevDescription) {
      return;
    }
    const data: ICardUpdate = {
      title: formData.title.trim(),
      description: nextDescription,
      list_id: listSlot?.id,
    };
    if (!boardSlot || !cardSlot?.card || !listSlot) return;
    await dispatchWithToast(
      updateCardById({ boardId: boardSlot.id, cardId: cardSlot.card.id, data }).unwrap(),
      'Updated',
      `Картка ${formData.title} оновлена успішно`,
      `Картка ${cardSlot.card.title} не оновлена`,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      () => dispatch(updateCard({ cardId: cardSlot.card!.id, listId: listSlot!.id, card: data }))
    );
  };

  const handleDeleteCard = async (): Promise<void> => {
    const confirmed = await confirm(`Видалити картку «${cardSlot?.card?.title}»?`);
    if (!confirmed) return;
    if (!boardSlot || !cardSlot?.card || !listSlot) return;
    await dispatchWithToast(
      removeCardById({ boardId: boardSlot.id, cardId: cardSlot.card.id }).unwrap(),
      'Deleted',
      'Картка видалена успішно',
      'Картку не вдалося видалити',
      () => handleModalClose()
    );
  };

  const toggleEditDescription = (): void => {
    flushSync(() => setEditingDescription(true));
    descriptionRef.current?.focus();
  };

  const openPanel = (mode: 'move' | 'copy'): void => {
    setPanelSource('menu');
    setPanelMode(mode);
  };

  const handleJoinLeave = async (): Promise<void> => {
    if (!boardSlot || !cardSlot?.card || !userId) return;
    const isJoined = cardSlot.card.users.includes(userId);
    await dispatchWithToast(
      updateCardUsers({
        boardId: boardSlot.id,
        cardId: cardSlot.card.id,
        data: isJoined ? { add: [], remove: [userId] } : { add: [userId], remove: [] },
      }).unwrap(),
      'Updated',
      isJoined ? 'Ви покинули картку' : 'Ви приєднались до картки',
      isJoined ? 'Не вдалося покинути картку' : 'Не вдалося приєднатись до картки'
    );
  };

  return (
    <div className={s.modals_wrapper} ref={rootRef}>
      <div className={s.modal} ref={modalRef}>
        <header className={s.modal_header}>
          <button
            className={s.header_list}
            onClick={(): void => {
              setPanelSource('list');
              setPanelMode('move');
            }}
            aria-label="Перемістити картку"
          >
            {listSlot?.title}
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          <CardMenu
            isOpen={menuOpen}
            isJoined={cardSlot.card?.users.includes(userId ?? -1) ?? false}
            onOpenChange={setMenuOpen}
            onJoinLeave={handleJoinLeave}
            onCopy={(): void => openPanel('copy')}
            onMove={(): void => openPanel('move')}
            onDelete={handleDeleteCard}
          />
          <button aria-label="Закрити" className={s.btn__close} onClick={handleModalClose}>
            <span />
            <span />
          </button>
        </header>
        <div className={s.modal_body}>
          <div className={s.form}>
            <div className={s.title}>
              <input
                type="text"
                name="title"
                value={formData.title}
                placeholder="Card title"
                required
                onChange={handleInputChange}
                onBlur={handleInputOnBlur}
                onKeyDown={handleInputKeyDown}
              />
              <div className={s.error} hidden={!titleTouched && errors.length === 0}>
                {errors.map((e) => (
                  <p key={e}>{e}</p>
                ))}
              </div>
            </div>
            <CardActionsBar />
            <CardMembers />
            <div className={s.description}>
              {editingDescription || formData.description.length === 0 ? (
                <textarea
                  name="description"
                  placeholder="Card description"
                  rows={3}
                  ref={descriptionRef}
                  value={formData.description}
                  onChange={handleInputChange}
                  onFocus={(): void => setEditingDescription(true)}
                  onBlur={handleInputOnBlur}
                  onKeyDown={handleInputKeyDown}
                />
              ) : (
                <div
                  className={s.description_viewer}
                  role="button"
                  aria-label="Редагувати опис"
                  tabIndex={0}
                  dangerouslySetInnerHTML={{ __html: innerHTML }} // eslint-disable-line react/no-danger
                  onClick={toggleEditDescription}
                  onKeyDown={(e): void => {
                    if (e.key === 'Enter' || e.key === ' ') toggleEditDescription();
                  }}
                />
              )}
            </div>
          </div>
        </div>
        {panelMode && cardSlot.card && (
          <CardMovePanel
            mode={panelMode}
            card={cardSlot.card}
            currentBoardId={boardSlot?.id ?? 0}
            currentListId={listSlot?.id ?? 0}
            onClose={(): void => setPanelMode(null)}
            onBack={
              panelSource === 'menu'
                ? (): void => {
                    setPanelMode(null);
                    setMenuOpen(true);
                  }
                : undefined
            }
            onSuccess={(): void => setPanelMode(null)}
          />
        )}
      </div>
      {confirmState.isOpen && (
        <ConfirmModal message={confirmState.message} onConfirm={handleConfirm} onCancel={handleCancel} />
      )}
    </div>
  );
};

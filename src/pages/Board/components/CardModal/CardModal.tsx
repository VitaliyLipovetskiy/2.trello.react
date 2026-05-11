import React, { JSX, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { toast } from 'react-toastify';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { clearCard, setCard, updateCard } from '../../../../store/board/reducer';
import useValidation from '../../../../hooks/useValidation';
import { ICardUpdate } from '../../../../common/interfaces';
import { useUpdateCardByIdMutation, useRemoveCardByIdMutation } from '../../../../store/board/boardSlice';
import s from './card-modal.module.scss';
import transformMarkdown from '../../../../hooks/useMarkdown';
import { ConfirmModal, useConfirm } from '../../../../common/components';
import { dispatchWithToast } from '../../../../common/utils/dispatchWithToast';
import { CardMovePanel } from './CardMovePanel';

export const CardModal = (): JSX.Element | null => {
  const { cardId } = useParams();
  const navigate = useNavigate();
  const { cardSlot, boardSlot, listSlot } = useAppSelector((state) => state.board);
  const dispatch = useAppDispatch();
  const [updateCardById] = useUpdateCardByIdMutation();
  const [removeCardById] = useRemoveCardByIdMutation();
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
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
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
    if (foundList && foundList.id !== listSlot?.id) {
      const found = foundList.cardSlots.find((cs) => cs.card?.id === cardSlot.card?.id);
      dispatch(setCard({ cardSlot: found, listSlot: foundList }));
    }
  }, [boardSlot?.lists]); // навмисно — реагуємо лише на оновлення борду після переміщення

  useEffect(() => {
    setFormData({
      title: cardSlot?.card?.title || '',
      description: cardSlot?.card?.description || '',
    });
  }, [cardSlot]);

  useEffect(() => {
    if (!menuOpen) return () => {};
    const handleClickOutside = (event: MouseEvent): void => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        menuButtonRef.current &&
        !menuButtonRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

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
    if (
      formData.title.trim() === cardSlot?.card?.title?.trim() &&
      formData.description.trim() === cardSlot?.card?.description?.trim()
    ) {
      return;
    }
    const data: ICardUpdate = {
      title: formData.title.trim(),
      description: formData.description?.trim(),
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
          <div className={s.header_left}>
            <button
              ref={menuButtonRef}
              className={s.btn__menu}
              aria-label="Дії"
              onClick={(): void => setMenuOpen((v) => !v)}
            >
              •••
            </button>
            {menuOpen && (
              <div className={s.menu_dropdown} ref={menuRef}>
                <button
                  onClick={(): void => {
                    setMenuOpen(false);
                    setPanelSource('menu');
                    setPanelMode('copy');
                  }}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <rect x="9" y="9" width="13" height="13" rx="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                  Копіювати
                </button>
                <button
                  onClick={(): void => {
                    setMenuOpen(false);
                    setPanelSource('menu');
                    setPanelMode('move');
                  }}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <polyline points="5 9 2 12 5 15" />
                    <polyline points="9 5 12 2 15 5" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <line x1="12" y1="2" x2="12" y2="22" />
                  </svg>
                  Перемістити
                </button>
                <button disabled>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <polyline points="21 8 21 21 3 21 3 8" />
                    <rect x="1" y="3" width="22" height="5" />
                    <line x1="10" y1="12" x2="14" y2="12" />
                  </svg>
                  Заархівувати
                </button>
                <button
                  onClick={async (): Promise<void> => {
                    setMenuOpen(false);
                    await handleDeleteCard();
                  }}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14H6L5 6" />
                    <path d="M10 11v6" />
                    <path d="M14 11v6" />
                    <path d="M9 6V4h6v2" />
                  </svg>
                  Видалити
                </button>
              </div>
            )}
          </div>
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

import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { clearCard, updateCard } from '../../../../store/board/reducer';
import React, { MouseEventHandler, useCallback, useEffect, useRef, useState } from 'react';
import useValidation from '../../../../hooks/useValidation';
import { toast } from 'react-toastify';
import { ICardUpdate } from '../../../../common/interfaces';
import { boardAction } from '../../../../store/actions';
import s from './card-modal.module.scss';
import { useNavigate } from 'react-router-dom';
import useMarkdown from '../../../../hooks/useMarkdown';

export const CardModal = () => {
  const navigate = useNavigate();
  const { cardSlot, boardSlot, listSlot } = useAppSelector((state) => state.board);
  const dispatch = useAppDispatch();
  const [formData, setFormData] = useState({
    title: cardSlot?.card?.title || '',
    description: cardSlot?.card?.description || '',
  });
  const { errors, setTouched: setTitleTouched, touched: titleTouched } = useValidation(formData.title);
  const rootRef = useRef<HTMLDivElement>(null);
  const [editingDescription, setEditingDescription] = useState(false);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const { innerHTML } = useMarkdown(formData.description);

  const handleModalClose = useCallback(() => {
    dispatch(clearCard());
    navigate(`/board/${boardSlot?.id}`);
  }, [dispatch, navigate]);

  const handleClose: MouseEventHandler<HTMLButtonElement> = useCallback(() => {
    handleModalClose();
  }, [handleModalClose]);

  useEffect(() => {
    const handleWrapperClick = (event: MouseEvent) => {
      const { target } = event;
      if (target instanceof Node && rootRef.current === target) {
        console.log('close');
        handleModalClose();
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
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
    setFormData({
      title: cardSlot?.card?.title || '',
      description: cardSlot?.card?.description || '',
    });
  }, [cardSlot]);

  if (!cardSlot) {
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

  const setDefaultValues = () => {
    setFormData({
      title: cardSlot?.card?.title || '',
      description: cardSlot?.card?.description || '',
    });
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key !== 'Escape') return;

    const { name, value } = e.currentTarget;
    const initialValue = name === 'title' ? cardSlot?.card?.title : cardSlot?.card?.description;

    if (value.trim() === initialValue?.trim()) {
      return;
    }

    e.stopPropagation();
    setDefaultValues();
    if (e.currentTarget.tagName === 'TEXTAREA') {
      setEditingDescription(false);
    }
    e.currentTarget.blur();
  };

  const handleInputOnBlur = async (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.preventDefault();
    setEditingDescription(false);
    if (errors.length !== 0) {
      setDefaultValues();
      toast.warning('Оновлення карточки скасовано');
      return;
    }
    if (
      formData.title.trim() === cardSlot?.card?.title.trim() &&
      formData.description.trim() === cardSlot?.card?.description?.trim()
    ) {
      return;
    }
    const data: ICardUpdate = {
      title: formData.title.trim(),
      description: formData.description?.trim(),
      list_id: listSlot?.id,
    };
    try {
      const { result } = await dispatch(
        boardAction.updateCardById({ boardId: boardSlot!.id, cardId: cardSlot.card!.id, data })
      ).unwrap();
      if (result === 'Updated') {
        dispatch(updateCard({ cardId: cardSlot.card!.id, listId: listSlot!.id, card: data }));
        toast.success(`Картка ${formData.title} оновлена успішно`);
      } else {
        console.log(`Картка ${cardSlot.card!.title} не оновлена`);
        toast.error(`Картка ${cardSlot.card!.title} не оновлена`);
      }
    } catch (error) {
      console.log(error);
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };

  const toggleEditDescription = () => {
    setEditingDescription(true);
    setTimeout(() => {
      descriptionRef.current?.focus();
    });
  };

  const handleDeleteCard = () => {
    console.log('handleDeleteCard');
  };

  return (
    <div className={s.modals_wrapper} ref={rootRef}>
      <div className={s.modal}>
        <header className={s.modal_header}>
          <button className={s.btn__close} onClick={handleClose}>
            <span></span>
            <span></span>
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
              <p>
                в колонці <ins>{listSlot?.title}</ins>
              </p>
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
                  onBlur={handleInputOnBlur}
                  onKeyDown={handleInputKeyDown}
                />
              ) : (
                <div
                  className={s.description_viewer}
                  dangerouslySetInnerHTML={{ __html: innerHTML }}
                  onClick={toggleEditDescription}
                ></div>
              )}
            </div>
          </div>
          <div className={s.modal_actions}>
            <span>ДІЇ</span>
            <button disabled>Копіювати</button>
            <button disabled>Перемістити</button>
            <button disabled>Заархівувати</button>
            <button onClick={handleDeleteCard}>Видалити</button>
          </div>
        </div>
      </div>
    </div>
  );
};

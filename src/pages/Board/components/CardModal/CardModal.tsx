import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { clearCard, updateCard } from '../../../../store/board/reducer';
import React, { MouseEventHandler, useCallback, useEffect, useRef, useState } from 'react';
import useValidation from '../../../../hooks/useValidation';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ICardUpdate } from '../../../../common/interfaces';
import { boardAction } from '../../../../store/actions';
import s from './card-modal.module.scss';

export const CardModal = () => {
  const { card, board, list } = useAppSelector((state) => state.board);
  const dispatch = useAppDispatch();
  const [formData, setFormData] = useState({
    title: card?.title || '',
    description: card?.description || '',
  });
  const { errors, setTouched: setTitleTouched, touched } = useValidation(formData.title);
  const rootRef = useRef<HTMLDivElement>(null);

  const handleModalClose = () => {
    dispatch(clearCard());
  };

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
      title: card?.title || '',
      description: card?.description || '',
    });
  }, [card]);

  if (!card) {
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
      title: card?.title || '',
      description: card?.description || '',
    });
  };

  const handleInputOnBlur = async (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.preventDefault();
    if (errors.length !== 0) {
      setDefaultValues();
      toast.warning('Оновлення карточки скасовано');
      return;
    }
    if (formData.title.trim() === card?.title.trim() && formData.description.trim() === card?.description?.trim()) {
      return;
    }
    const data: ICardUpdate = {
      title: formData.title.trim(),
      description: formData.description?.trim(),
      list_id: list?.id,
    };
    try {
      const { result } = await dispatch(
        boardAction.updateCardById({ boardId: board!.id, cardId: card.id, data })
      ).unwrap();
      if (result === 'Updated') {
        dispatch(updateCard({ cardId: card.id, listId: list!.id, card: data }));
        toast.success(`Картка ${formData.title} оновлена успішно`);
      } else {
        console.log(`Картка ${card.title} не оновлена`);
        toast.error(`Картка ${card.title} не оновлена`);
      }
    } catch (error) {
      console.log(error);
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
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
              />
              <div className={s.error} hidden={!touched && errors.length === 0}>
                {errors.map((e) => (
                  <p key={e}>{e}</p>
                ))}
              </div>
              <label htmlFor="title">
                в колонці <ins>{list?.title}</ins>
              </label>
            </div>
            <div className={s.description}>
              <label htmlFor={'description'}>Опис</label>
              <textarea
                name="description"
                placeholder="Card description"
                rows={3}
                value={formData.description}
                onChange={handleInputChange}
                onBlur={handleInputOnBlur}
              />
            </div>
          </div>
          <div className={s.modal_actions}>
            <span>ДІЇ</span>
            <button>Копіювати</button>
            <button>Перемістити</button>
            <button>Заархівувати</button>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ListCreate, List, CardModal } from './components';
import { IBoardUpdate } from '../../common/interfaces';
import { toast, ToastContainer } from 'react-toastify';
import { ProgressBar } from '../../common/components';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { boardAction } from '../../store/actions';
import useValidation from '../../hooks/useValidation';
import 'react-toastify/dist/ReactToastify.css';
import s from './board.module.scss';

const Board = () => {
  const { boardId } = useParams();
  const dispatch = useAppDispatch();
  const { board } = useAppSelector((state) => state.board);
  const [title, setTitle] = useState('');
  const [titleEdit, setTitleEdit] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState(board?.custom?.background || '');
  const inputTitleRef = useRef<HTMLInputElement>(null);
  const inputColorRef = useRef<HTMLInputElement>(null);
  const { errors, touched, setTouched } = useValidation(title);

  useEffect(() => {
    if (boardId) {
      dispatch(boardAction.getBoardById(+boardId));
    }
  }, [boardId, dispatch]);

  useEffect(() => {
    setTitle(board?.title || '');
    setBackgroundColor(board?.custom?.background || '');
  }, [board?.custom?.background, board?.title, dispatch]);

  const handleOnBlurTitle = async () => {
    setTitleEdit(false);
    if (errors.length > 0) {
      setTitle(board?.title || '');
      toast.warning('Назва дошки не оновлена');
    } else if (board && touched && board.title !== title.trim()) {
      try {
        const { result } = await dispatch(
          boardAction.updateBoardById({ id: +(boardId || 0), data: { title } })
        ).unwrap();
        if (result === 'Updated') {
          toast.success('Дошку оновлено успішно');
        }
      } catch (error) {
        console.log(error);
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          throw error;
        }
      }
    }
  };

  const handleColorChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setBackgroundColor(event.target.value);
    if (event.target.value !== board?.custom?.background) {
      const boardUpdate: IBoardUpdate = {
        title,
        custom: { background: event.target.value },
      };
      try {
        const { result } = await dispatch(
          boardAction.updateBoardById({ id: +(boardId || 0), data: boardUpdate })
        ).unwrap();
        if (result === 'Updated') {
          toast.success('Дошку оновлено успішно');
        }
      } catch (error) {
        console.log(error);
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          throw error;
        }
      }
    }
  };

  const handleChangeTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    setTouched(true);
  };

  const handleKeyUpTitleEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputTitleRef.current) {
      inputTitleRef.current.blur();
    }
  };

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
                  onKeyUp={handleKeyUpTitleEnter}
                />
                <div className={s.error} hidden={!touched && errors.length === 0}>
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
                value={backgroundColor}
                onChange={handleColorChange}
              ></input>
              <button
                className={s.color_swatch}
                style={{ backgroundColor: backgroundColor }}
                onClick={() => inputColorRef.current?.click()}
              />
            </div>
          </div>
        </header>
        <div className={s.container}>
          {board?.lists.map((list) => (
            <List key={list.id} id={list.id} />
          ))}
          <ListCreate />
        </div>
      </div>
      <CardModal />
      <ToastContainer />
    </ProgressBar>
  );
};

export default Board;

import React, { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { BoardTitle, ListCreate, List } from './components';
import { IBoard, ICreateList } from '../../common/interfaces';
import boardService from '../../services/board/board.service';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ProgressBar } from '../../common/components';
import s from './board.module.scss';

const Board = () => {
  const { id } = useParams();
  const [board, setBoard] = useState<IBoard>();
  const [title, setTitle] = useState(board?.title || '');
  const [titleValid, setTitleValid] = useState(true);
  const [titleReadOnly, setTitleReadOnly] = useState(true);
  const [isListNew, setIsListNew] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState(board?.custom?.background || '');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    (async () => {
      try {
        const iBoard = await boardService.getBoardById(+(id || 0));
        setBoard(iBoard);
        setTitle(iBoard.title);
        setBackgroundColor(iBoard.custom?.background || '');
      } catch (error) {
        console.log(error);
        if (error instanceof Error) {
          toast.error(error.message);
        }
      }
    })();
  }, [id]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsListNew(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleOnBlurTitle = () => {
    setTitleReadOnly(true);
    if (!titleValid) {
      setTitle(board?.title || '');
      toast.warning('Назва дошки не оновлена');
    } else if (board?.title !== title.trim()) {
      (async () => {
        try {
          const { result } = await boardService.updateBoardById(+(id || 0), { title });
          if (result === 'Updated') {
            const board = await boardService.getBoardById(+(id || 0));
            setBoard(board);
            setTitle(board.title);
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
      })();
    }
  };

  const handleCreateList = async (title: string) => {
    const listData: ICreateList = {
      title,
      position: (board?.lists.length || 0) + 1,
    };
    const { result } = await boardService.createList(+(id || 0), listData);
    if (result === 'Created') {
      const board = await boardService.getBoardById(+(id || 0));
      setBoard(board);
      toast.success('Список створено успішно');
    } else {
      console.log('Список не вдалося створити');
      toast.error('Список не вдалося створити');
    }
  };

  const handleUpdateBoard = () => {
    (async () => {
      try {
        const iBoard = await boardService.getBoardById(+(id || 0));
        setBoard(iBoard);
      } catch (error) {
        console.log(error);
        if (error instanceof Error) {
          toast.error(error.message);
        }
      }
    })();
  };

  const handleColorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setBackgroundColor(event.target.value);
    if (event.target.value !== board?.custom?.background) {
      (async () => {
        try {
          const { result } = await boardService.updateBoardById(+(id || 0), {
            title,
            custom: { background: event.target.value },
          });
          if (result === 'Updated') {
            const board = await boardService.getBoardById(+(id || 0));
            setBoard(board);
            setBackgroundColor(board.custom?.background || '');
            toast.success('Дошку оновлено успішно');
            console.log('Дошку оновлено успішно');
          }
        } catch (error) {
          console.log(error);
          if (error instanceof Error) {
            toast.error(error.message);
          } else {
            throw error;
          }
        }
      })();
    }
  };

  return (
    <ProgressBar>
      <div className={s.board}>
        <header>
          <div className={s.header}>
            <div className={s.content}>
              <BoardTitle
                title={title}
                setTitle={setTitle}
                setTitleValid={setTitleValid}
                readonly={titleReadOnly}
                className={titleReadOnly ? s.title_readonly : s.title_edit}
                handleClickTitle={() => setTitleReadOnly(false)}
                handleOnBlurTitle={handleOnBlurTitle}
              />
            </div>
            <div className={s.home}>
              <Link to={'/'}>{'<-Додому'}</Link>
            </div>
            <div className={s.color_picker_wrapper}>
              <input
                type="color"
                className={s.color_input}
                ref={inputRef}
                value={backgroundColor}
                onChange={handleColorChange}
              ></input>
              <button
                className={s.color_swatch}
                style={{ backgroundColor: backgroundColor }}
                onClick={() => inputRef.current?.click()}
              />
            </div>
          </div>
        </header>
        <div className={s.container}>
          {board?.lists.map((list) => (
            <List key={list.id} boardId={+(id || 0)} list={list} handleUpdateBoard={handleUpdateBoard} />
          ))}
          <ListCreate isListNew={isListNew} setIsListNew={setIsListNew} handleCreateList={handleCreateList} />
        </div>
      </div>
      <ToastContainer />
    </ProgressBar>
  );
};

export default Board;

import React, { useEffect, useState } from 'react';
import { Board, BoardCreate } from './components';
import { Link } from 'react-router-dom';
import { IBoard } from '../../common/interfaces';
import boardService from '../../services/board/board.service';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import s from './home.module.scss';
import { ProgressBar } from '../../common/components';

const Home = () => {
  const [boards, setBoards] = useState<IBoard[]>([]);
  const [boardModal, setBoardModal] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { boards } = await boardService.getAllBoards();
        setBoards(boards);
      } catch (error) {
        console.log(error);
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          throw error;
        }
      }
    })();
  }, []);

  const handleCreateBoard = async (title: string) => {
    const { result, id } = await boardService.createBoard(title);
    if (result === 'Created') {
      const board = await boardService.getBoardById(id);
      setBoards([...boards, board]);
      toast.success(`Дошка ${board.title} створена успішно`);
    } else {
      console.log(`Дошка ${title} не створена`);
      toast.error(`Дошка ${title} не створена`);
    }
  };

  const handleRemoveBoard = (e: React.MouseEvent, board: IBoard) => {
    e.preventDefault();
    (async () => {
      try {
        const { result } = await boardService.removeBoardById(board.id);
        if (result === 'Deleted') {
          const { boards } = await boardService.getAllBoards();
          setBoards(boards);
          toast.success(`Дошка ${board.title} видалена успішно`);
        } else {
          console.log(`Дошка ${board.title} не видалена`);
          toast.error(`Дошка ${board.title} не видалена`);
        }
      } catch (error) {
        console.log(error);
        if (error instanceof Error) {
          toast.error(error.message);
        }
      }
    })();
  };

  return (
    <ProgressBar>
      <div className={s.home}>
        <h1>Мої дошки</h1>
        <div className={s.container}>
          {boards?.map((board) => (
            <Link key={board.id} to={`/board/${board.id}`}>
              <Board board={board} handleRemoveBoard={handleRemoveBoard} />
            </Link>
          ))}
          <button className={s.board__add} onClick={() => setBoardModal(true)}>
            + Додати дошку
          </button>
        </div>
        {boardModal && <BoardCreate onClose={() => setBoardModal(false)} handleCreateBoard={handleCreateBoard} />}
      </div>
      <ToastContainer />
    </ProgressBar>
  );
};

export default Home;

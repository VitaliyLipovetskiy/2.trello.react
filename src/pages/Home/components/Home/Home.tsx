import React, { useEffect, useState } from 'react';
import { CreateBoard, ProgressBar } from '../../../Board/components/components';
import { Link } from 'react-router-dom';
import { IBoard } from '../../../../common/interfaces';
import { createBoard, getAllBoards, getBoardById, removeBoardById } from '../../../../services/services';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './home.scss';
import { Tooltip } from 'react-tooltip';

export const Home = () => {
  const [boards, setBoards] = useState<IBoard[]>([]);
  const [boardModal, setBoardModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const { boards } = await getAllBoards();
      setBoards(boards);
    };
    fetchData().catch((error) => {
      console.log(error);
      toast.error(error);
    });
  }, []);

  const handleCreateBoard = async (title: string) => {
    const { result, id } = await createBoard(title);
    if (result === 'Created') {
      const board = await getBoardById(id);
      setBoards([...boards, board]);
      toast.success(`Дошка ${board.title} створена успішно`);
    } else {
      console.log(`Дошка ${title} не створена`);
      toast.error(`Дошка ${title} не створена`);
    }
  };

  const handleRemoveBoard = (e: React.MouseEvent, board: IBoard) => {
    e.preventDefault();
    const fetchData = async () => {
      const { result } = await removeBoardById(board.id);
      if (result === 'Deleted') {
        const { boards } = await getAllBoards();
        setBoards(boards);
        toast.success(`Дошка ${board.title} видалена успішно`);
      } else {
        console.log(`Дошка ${board.title} не видалена`);
        toast.error(`Дошка ${board.title} не видалена`);
      }
    }
    fetchData().catch((error) => {
      console.log(error);
      toast.error(error);
    });
  };

  return (
    <ProgressBar>
      <div className={'home'}>
        <h1>Мої дошки</h1>
        <div className={'container'}>
          {boards?.map((board) => (
            <Link key={board.id} to={'/board/' + board.id}>
              <div className={'home-board'} style={{ background: board.custom?.background }}>
                <h4>{board.title}</h4>
                <button
                  data-tooltip-id="tooltip-remove-board"
                  type="button"
                  className="board-btn-remove"
                  aria-label="Видалити дошку"
                  onClick={(event) => handleRemoveBoard(event, board)}
                >
                  &times;
                </button>
                <Tooltip
                  id="tooltip-remove-board"
                  className="tooltip"
                  content="Видалити дошку!"
                  place="left"
                />
              </div>
            </Link>
          ))}
          <button className={'board-add'} onClick={() => setBoardModal(true)}>
            + Додати дошку
          </button>
        </div>
        {boardModal && <CreateBoard onClose={() => setBoardModal(false)} handleCreateBoard={handleCreateBoard} />}
      </div>
    </ProgressBar>
  );
};

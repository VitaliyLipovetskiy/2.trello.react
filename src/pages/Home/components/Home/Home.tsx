import { useEffect, useState } from 'react';
import { CreateBoard, ProgressBar } from '../../../Board/components/components';
import { Link } from 'react-router-dom';
import { IBoard } from '../../../../common/interfaces';
import { createBoard, getAllBoards, getBoardById } from '../../../../services/services';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './home.scss';

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
      toast.success('New board created');
    } else {
      console.log('Board is not created');
      toast.error('Board is not created');
    }
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

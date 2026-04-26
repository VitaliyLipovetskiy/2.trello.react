import React, { JSX, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { Board, BoardCreate } from './components';
import { ProgressBar } from '../../common/components';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { boardAction } from '../../store/actions';
import 'react-toastify/dist/ReactToastify.css';
import s from './home.module.scss';

const Home = (): JSX.Element => {
  const dispatch = useAppDispatch();
  const { boards } = useAppSelector((state) => state.board);
  const [boardModal, setBoardModal] = useState(false);

  useEffect(() => {
    dispatch(boardAction.getAllBoards());
  }, [dispatch]);

  return (
    <ProgressBar>
      <div className={s.home}>
        <h1>Мої дошки</h1>
        <div className={s.container}>
          {boards?.map((board) => (
            <Link key={board.id} to={`/board/${board.id}`}>
              <Board board={board} />
            </Link>
          ))}
          <button className={s.board_add} onClick={(): void => setBoardModal(true)}>
            + Додати дошку
          </button>
        </div>
        {boardModal && <BoardCreate onClose={(): void => setBoardModal(false)} />}
      </div>
      <ToastContainer />
    </ProgressBar>
  );
};

export default Home;

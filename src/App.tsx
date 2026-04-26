import React, { JSX } from 'react';
import { Route, Routes } from 'react-router-dom';
import Home from './pages/Home/Home';
import Board from './pages/Board/Board';
import { CardModal } from './pages/Board/components';
import './App.css';

function App(): JSX.Element {
  return (
    <Routes>
      <Route index element={<Home />} />
      <Route path="board/:boardId" element={<Board />}>
        <Route path="card/:cardId" element={<CardModal />} />
      </Route>
    </Routes>
  );
}

export default App;

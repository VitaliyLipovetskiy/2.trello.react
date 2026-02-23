import React from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import Home from './pages/Home/Home';
import Board from './pages/Board/Board';
import { CardModal } from './pages/Board/components';
import './App.css';

function App() {
  const location = useLocation();
  const background = location.state?.background;

  return (
    <>
      <Routes location={background || location}>
        <Route index element={<Home />} />
        <Route path={''} element={<Home />} />
        <Route path={'board/:boardId'} element={<Board />}>
          <Route path={'card/:cardId'} element={<CardModal />} />
        </Route>
      </Routes>
      {/*{background && (*/}
      {/*  <Routes>*/}
      {/*    <Route path={'board/:boardId'} element={<Board />}>*/}
      {/*      <Route path={'card/:cardId'} element={<CardModal />} />*/}
      {/*    </Route>*/}
      {/*  </Routes>*/}
      {/*)}*/}
    </>
  );
}

export default App;

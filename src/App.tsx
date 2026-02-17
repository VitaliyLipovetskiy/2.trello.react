import React from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import Home from './pages/Home/Home';
import Board from './pages/Board/Board';
import { CardModal } from './pages/Board/components';
import './App.css';

function App() {
  const location = useLocation();

  return (
    // <Routes>
    <Routes location={location.state?.background || location}>
      <Route index element={<Home />} />
      <Route path={'/'} element={<Home />} />
      <Route path={'/board/:id'} element={<Board />} />
      <Route path={'/board/:id/cards/:cardId'} element={<CardModal />} />
    </Routes>
  );
}

export default App;

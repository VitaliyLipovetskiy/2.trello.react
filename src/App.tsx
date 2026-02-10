import React, { StrictMode } from 'react';
import { HashRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home/Home';
import Board from './pages/Board/Board';
import './App.css';

function App() {
  return (
    <StrictMode>
      <Router>
        <Routes>
          <Route index element={<Home />} />
          <Route path={'/'} element={<Home />} />
          <Route path={'/board/:id'} element={<Board />} />
        </Routes>
      </Router>
    </StrictMode>
  );
}

export default App;

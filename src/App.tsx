import React, { StrictMode } from 'react';
import { HashRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import { Board, Home } from './pages/pages';
import './App.css';

function App() {
  return (
    <StrictMode>
      <Router>
        <Routes>
          <Route path={'/'} element={<Home />} />
          <Route path={'/board/:id'} element={<Board />} />
          <Route path={'*'} element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </StrictMode>
  );
}

export default App;

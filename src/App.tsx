import React, { StrictMode } from 'react';
import { HashRouter as Router, Route, Routes } from 'react-router-dom';
import { Board, Home } from './pages/pages';
import './App.css';

function App() {
  return (
    <StrictMode>
      <Router>
        <Routes>
          <Route path={'/'} element={<Home />} />
          <Route path={'/board/:id'} element={<Board />} />
        </Routes>
      </Router>
    </StrictMode>
  );
}

export default App;

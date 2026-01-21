import React, { StrictMode } from 'react';
import { HashRouter as Router, Route, Routes } from 'react-router-dom';
import { Board, Home } from './pages/pages';
import './App.css';

function App() {
  return (
    <StrictMode>
      <Router
      // basename='/2.trello.react'
      >
        <Routes>
          <Route index element={<Home />} />
          <Route path={'board'}>
            <Route path=":id" element={<Board />} />
          </Route>
        </Routes>
      </Router>
    </StrictMode>
  );
}

export default App;

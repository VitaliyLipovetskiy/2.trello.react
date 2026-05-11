import React, { JSX } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Home from './pages/Home/Home';
import Board from './pages/Board/Board';
import { CardModal } from './pages/Board/components';
import SignUp from './pages/Auth/SignUp';
import SignIn from './pages/Auth/SignIn';
import { useAppSelector } from './store/hooks';
import './App.css';

const ProtectedRoute = ({ children }: { children: JSX.Element }): JSX.Element => {
  const token = useAppSelector((state) => state.auth.token);
  return token ? children : <Navigate to="/login" replace />;
};

function App(): JSX.Element {
  return (
    <Routes>
      <Route path="login" element={<SignIn />} />
      <Route path="register" element={<SignUp />} />
      <Route
        index
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />
      <Route
        path="board/:boardId"
        element={
          <ProtectedRoute>
            <Board />
          </ProtectedRoute>
        }
      >
        <Route path="card/:cardId" element={<CardModal />} />
      </Route>
    </Routes>
  );
}

export default App;

import React from 'react';
import './App.css';
import { Route, Routes } from 'react-router-dom';
import { Board, Home } from './pages';

function App() {
    return (
        <Routes>
            <Route path='/' element={<Home/>}/>
            <Route path='/board/:id' element={<Board />}/>
        </Routes>
    );
}

export default App;

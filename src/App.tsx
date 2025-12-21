import React from 'react';
import './App.css';
import { Route, Routes } from 'react-router-dom';
import { Board } from './pages/Board/components';

function App() {
    return (
        <Routes>
            <Route path='/' element={<div>Hello</div>}/>
            <Route path='/board' element={<Board/>}/>
        </Routes>
    );
}

export default App;

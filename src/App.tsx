import React, {StrictMode} from 'react';
import './App.css';
import { Route, Routes } from 'react-router-dom';
import { Board, Home } from './pages';

function App() {
    return (
        <StrictMode>
            <Routes>
                <Route path='/' element={<Home/>}/>
                <Route path='/board/:id' element={<Board />}/>
            </Routes>
        </StrictMode>
    );
}

export default App;

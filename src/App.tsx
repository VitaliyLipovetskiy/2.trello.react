import React, {StrictMode} from 'react';
import {BrowserRouter, Route, Routes} from 'react-router-dom';
import {Board, Home} from './pages/pages';
import './App.css';

function App() {
    return (
        <StrictMode>
            <BrowserRouter basename='/2.trello.react'>
                <Routes>
                    <Route path='/' element={<Home/>}/>
                    <Route path='/board/:id' element={<Board/>}/>
                    <Route path='*' element={<Home/>}/>
                </Routes>
            </BrowserRouter>
        </StrictMode>
    );
}

export default App;

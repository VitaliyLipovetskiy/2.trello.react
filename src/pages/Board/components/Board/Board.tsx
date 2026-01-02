import React, {useEffect, useRef, useState} from 'react';
import {Link, useParams} from 'react-router-dom';
import api from '../../../../api/request';
import {BoardTitle, List} from '../index';
import {IBoardDetail, IResult} from '../../../../common/interfaces';
import './board.scss'

export const Board = () => {
    const {id} = useParams();
    const [board, setBoard] = useState<IBoardDetail>();
    const [title, setTitle] = useState('');
    const [titleValid, setTitleValid] = useState(true);
    const [titleReadOnly, setTitleReadOnly] = useState(true);
    const titleTemp = useRef('');

    useEffect(() => {
        const fetchData = async () => {
            const board = await api.get<any, IBoardDetail, any>(`board/${id}`)
            setBoard(board)
            setTitle(board.title);
            titleTemp.current = board.title;
        };
        fetchData();
    }, []);

    const handleClickTitle = () => {
        setTitleReadOnly(false);
    }

    const handleOnBlurTitle = () => {
        setTitleReadOnly(true);
        if (!titleValid) {
            setTitle(titleTemp.current);
        } else if (titleTemp.current !== title.trim()){
            const fetchData = async () => {
                const {result} = await api.put<any, IResult, any>(`board/${id}`, {title});
                if (result === 'Updated') {
                    const board = await api.get<any, IBoardDetail, any>(`board/${id}`);
                    setBoard(board);
                    setTitle(board.title);
                    titleTemp.current = board.title;
                }
            };
            fetchData();
        }
    }

    return (
        <div className={'board'}>
            <header>
                <div className={'board-header'}>
                    <div className={'board-home'}>
                        <Link to={'/'}>{'<-Додому'}</Link>
                    </div>
                    <div className={'board-content'}>
                        <BoardTitle
                            title={title}
                            setTitle={setTitle}
                            setTitleValid={setTitleValid}
                            readonly={titleReadOnly}
                            className={titleReadOnly ? 'board-title-readonly' : 'board-title-edit'}
                            onClick={handleClickTitle}
                            onBlur={handleOnBlurTitle}
                        />
                    </div>
                </div>
            </header>
            <div className={'container'}>
                {board?.lists.map((list) =>
                    <List
                        key={list.id}
                        title={list.title}
                        cards={list.cards}
                    />
                )}
                <div className={'board-list'}>
                    <div className={'board-list-add'}>
                        <button>+ Добавити список</button>
                    </div>
                </div>
            </div>
        </div>
    )
}
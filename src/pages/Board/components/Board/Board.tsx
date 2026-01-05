import React, {useEffect, useRef, useState} from 'react';
import {Link, useParams} from 'react-router-dom';
import {BoardTitle, CreateList, List} from '../components';
import {IBoard} from '../../../../common/interfaces';
import {
    createList,
    getBoardById,
    updateBoard
} from '../../../../services/services';
import './board.scss';

export const Board = () => {
    const {id} = useParams();
    const [board, setBoard] = useState<IBoard>();
    const [title, setTitle] = useState('');
    const [titleValid, setTitleValid] = useState(true);
    const [titleReadOnly, setTitleReadOnly] = useState(true);
    const titleTemp = useRef('');
    const [isListNew, setIsListNew] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            const board = await getBoardById(+(id || 0));
            setBoard(board)
            setTitle(board.title);
            titleTemp.current = board.title;
        };
        fetchData();
    }, []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setIsListNew(false);
            }
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    const handleClickTitle = () => {
        setTitleReadOnly(false);
    }

    const handleOnBlurTitle = () => {
        setTitleReadOnly(true);
        if (!titleValid) {
            setTitle(titleTemp.current);
        } else if (titleTemp.current !== title.trim()) {
            const fetchData = async () => {
                const {result} = await updateBoard(+(id || 0), title);
                if (result === 'Updated') {
                    const board = await getBoardById(+(id || 0));
                    setBoard(board);
                    setTitle(board.title);
                    titleTemp.current = board.title;
                }
            };
            fetchData();
        }
    }

    const handleCreateList = async (title: string) => {
        const {result} = await createList(+(id || 0),title, (board?.lists.length || 0) + 1);
        if (result === 'Created') {
            const board = await getBoardById(+(id || 0));
            setBoard(board);
        } else {
            // toast
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
                            handleClickTitle={handleClickTitle}
                            onBlur={handleOnBlurTitle}
                        />
                    </div>
                </div>
            </header>
            <div
                className={'board-container'}
                aria-hidden={true}
            >
                {board?.lists.map((list) =>
                    <List
                        key={list.id}
                        id={+(id || 0)}
                        list={list}
                    />
                )}
                <CreateList
                    isListNew={isListNew}
                    setIsListNew={setIsListNew}
                    handleCreateList={handleCreateList}
                />
            </div>
        </div>
    )
}
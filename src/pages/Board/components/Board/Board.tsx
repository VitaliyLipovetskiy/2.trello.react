import React, {useEffect, useState} from 'react';
import {Link, useParams} from 'react-router-dom';
import {BoardTitle, CreateList, List} from '../components';
import {IBoard, ICreateList} from '../../../../common/interfaces';
import {
    createList,
    getBoardById,
    updateBoardById
} from '../../../../services/services';
import './board.scss';

export const Board = () => {
    const {id} = useParams();
    const [board, setBoard] = useState<IBoard>();
    const [title, setTitle] = useState('');
    const [titleValid, setTitleValid] = useState(true);
    const [titleReadOnly, setTitleReadOnly] = useState(true);
    const [isListNew, setIsListNew] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            const iBoard = await getBoardById(+(id || 0));
            setBoard(iBoard)
            setTitle(iBoard.title);
        };
        fetchData().catch(error => {
            console.log(error);
            // toast
        });
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

    const handleOnBlurTitle = () => {
        setTitleReadOnly(true);
        if (!titleValid) {
            setTitle(board?.title || '');
        } else if (board?.title !== title.trim()) {
            const fetchData = async () => {
                const {result} = await updateBoardById(+(id || 0), title);
                if (result === 'Updated') {
                    const board = await getBoardById(+(id || 0));
                    setBoard(board);
                    setTitle(board.title);
                }
            };
            fetchData().catch(error => {
                console.log(error);
                // toast
            });
        }
    }

    const handleCreateList = async (title: string) => {
        const listData: ICreateList = {
            title,
            position: (board?.lists.length || 0) + 1,
        }
        const {result} = await createList(+(id || 0),listData);
        if (result === 'Created') {
            const board = await getBoardById(+(id || 0));
            setBoard(board);
        } else {
            // toast
        }
    }

    const updateBoard = async () => {
        return await getBoardById(+(id || 0));
    }

    const handleUpdateBoard = () => {
        updateBoard()
            .then(board => setBoard(board))
            .catch(error => {
                console.log(error);
                // toast
            });
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
                            handleClickTitle={() => setTitleReadOnly(false)}
                            onBlur={handleOnBlurTitle}
                        />
                    </div>
                </div>
            </header>
            <div
                className={'board-container'}
                // tabIndex={-1}
                // aria-hidden={true}
            >
                {board?.lists.map((list) =>
                    <List
                        key={list.id}
                        boarId={+(id || 0)}
                        list={list}
                        handleUpdateBoard={handleUpdateBoard}
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
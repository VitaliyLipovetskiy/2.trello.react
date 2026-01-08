import React, {useEffect, useRef, useState} from 'react';
import {Link, useParams} from 'react-router-dom';
import {
    BoardTitle,
    CreateList,
    List,
    ProgressBar,
} from '../components';
import {IBoard, ICreateList} from '../../../../common/interfaces';
import {
    createList,
    getBoardById,
    updateBoardById
} from '../../../../services/services';
import {toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './board.scss';

export const Board = () => {
    const {id} = useParams();
    const [board, setBoard] = useState<IBoard>();
    const [title, setTitle] = useState('');
    const [titleValid, setTitleValid] = useState(true);
    const [titleReadOnly, setTitleReadOnly] = useState(true);
    const [isListNew, setIsListNew] = useState(false);
    const [backgroundColor, setBackgroundColor] = useState(board?.custom?.background);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const fetchData = async () => {
            const iBoard = await getBoardById(+(id || 0));
            setBoard(iBoard);
            setTitle(iBoard.title);
            setBackgroundColor(iBoard.custom?.background);
        };
        fetchData().catch(error => {
            console.log(error);
            toast.error(error);
        });
    }, [id]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setIsListNew(false);
                toast.warning('List creation cancelled');
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
            toast.warning('Title is not updated');
        } else if (board?.title !== title.trim()) {
            const fetchData = async () => {
                const {result} = await updateBoardById(+(id || 0), {title});
                if (result === 'Updated') {
                    const board = await getBoardById(+(id || 0));
                    setBoard(board);
                    setTitle(board.title);
                    toast.success('Board updated');
                }
            };
            fetchData().catch(error => {
                console.log(error);
                toast.error(error);
            });
        }
    }

    const handleCreateList = async (title: string) => {
        const listData: ICreateList = {
            title,
            position: (board?.lists.length || 0) + 1,
        }
        const {result} = await createList(+(id || 0), listData);
        if (result === 'Created') {
            const board = await getBoardById(+(id || 0));
            setBoard(board);
            toast.success('New list created');
        } else {
            console.log('List is not created');
            toast.error('List not created');
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
                toast.error(error);
            });
    }

    const handleColorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setBackgroundColor(event.target.value);
        if (event.target.value !== board?.custom?.background) {
            const fetchData = async () => {
                const {result} = await updateBoardById(+(id || 0), {title, custom: {background: event.target.value}});
                if (result === 'Updated') {
                    const board = await getBoardById(+(id || 0));
                    setBoard(board);
                    setBackgroundColor(board.custom?.background);
                    toast.success('Board updated');
                    console.log('Board updated')
                }
            };
            fetchData().catch(error => {
                console.log(error);
                toast.error(error);
            });
        }
    };

    return (
        <ProgressBar>
            <div className={'board'}>
                <header>
                    <div className={'board-header'}>
                        <div className={'board-content'}>
                            <BoardTitle
                                title={title}
                                setTitle={setTitle}
                                setTitleValid={setTitleValid}
                                readonly={titleReadOnly}
                                className={titleReadOnly ? 'board-title-readonly' : 'board-title-edit'}
                                handleClickTitle={() => setTitleReadOnly(false)}
                                handleOnBlurTitle={handleOnBlurTitle}
                            />
                        </div>
                        <div className={'board-home'}>
                            <Link to={'/'}>{'<-Додому'}</Link>
                        </div>
                        <div className={'color-picker-wrapper'}>
                            <input
                                type='color'
                                className='board-color-input'
                                ref={inputRef}
                                value={backgroundColor}
                                onChange={handleColorChange}
                            ></input>
                            <button
                                className='color-swatch'
                                style={{ backgroundColor: backgroundColor }}
                                onClick={() => inputRef.current?.click()}
                            />
                        </div>
                    </div>
                </header>
                <div className={'board-container'}>
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
        </ProgressBar>
    )
}
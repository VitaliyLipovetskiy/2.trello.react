import {useEffect, useState} from 'react';
import {Board} from '../index';
import {CreateBoard} from '../../../Board/components';
import {Link} from 'react-router-dom';
import api from '../../../../api/request';
import './home.scss';
import {IResultCreated} from "../../../../common/interfaces";

type BoardType = {
    id: number,
    title: string,
    custom: {
        background: string
    },
}

export const Home = () => {
    const [boards, setBoards] = useState<BoardType[]>([]);
    const [boardModal, setBoardModal] = useState(false)

    useEffect(() => {
        const fetchData = async () => {
            const { boards } = await api.get<any, { boards: BoardType[] }, any>('board');
            setBoards(boards);
        };
        fetchData();
    }, []);

    const handleCreateBoard = async (title: string) => {
        const {result, id} = await api.post<any, IResultCreated, any>('board', {title});
        if (result === 'Created') {
            const board = await api.get<any, BoardType, any>(`board/${id}`);
            board.id = id;
            setBoards([...boards, board]);
        } else {
            // toast
        }
    }

    return (
        <div className={'home'}>
            <h1>Мої дошки</h1>
            <div className={'container'}>
                {boards?.map(board =>
                    <Link key={board.id} to={'/board/' + board.id}>
                        <Board title={board.title} background={board.custom?.background}/>
                    </Link>
                )}
                <button
                    className={'board-add'}
                    onClick={() => setBoardModal(true)}
                >
                    + Додати дошку
                </button>
            </div>
            {boardModal && <CreateBoard
                onClose={() => setBoardModal(false)}
                handleCreateBoard={handleCreateBoard}
            />}
        </div>
    )
}
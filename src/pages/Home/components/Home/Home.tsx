import {useEffect, useState} from 'react';
import {Board} from '../index';
import {Link} from 'react-router-dom';
import api from '../../../../api/request';
import './home.scss';

type BoardType = {
    id: number,
    title: string,
    custom: {
        background: string
    },
}

export const Home = () => {
    const [boards, setBoards] = useState<BoardType[]>([]);

    const fetchData = async () => {
        const { boards } = await api.get<any, { boards: BoardType[] }, any>('board')
        setBoards(boards)
    };

    useEffect(() => {
        fetchData();
    }, [])


    return (
        <div className={'home'}>
            <h1>Мої дошки</h1>
            <div className={'container'}>
                {boards.map(board =>
                    <Link
                        key={board.id}
                        to={'/board/' + board.id}
                    >
                        <Board
                            id={board.id}
                        />
                    </Link>
                )}
                <div className={'board-add'}>
                    <h4>+ Додати дошку</h4>
                </div>
            </div>
        </div>
    )
}
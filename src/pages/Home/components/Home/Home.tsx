import {useEffect, useState} from 'react';
import {Board} from '../components';
import {CreateBoard} from '../../../Board/components/components';
import {Link} from 'react-router-dom';
import {IBoard} from "../../../../common/interfaces";
import {
    createBoard,
    getAllBoards,
    getBoardById,
} from "../../../../services/services";
import './home.scss';

export const Home = () => {
    const [boards, setBoards] = useState<IBoard[]>([]);
    const [boardModal, setBoardModal] = useState(false)

    useEffect(() => {
        const fetchData = async () => {
            const { boards } = await getAllBoards();
            setBoards(boards);
        };
        fetchData();
    }, []);

    const handleCreateBoard = async (title: string) => {
        const {result, id} = await createBoard(title);
        if (result === 'Created') {
            const board = await getBoardById(id);
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
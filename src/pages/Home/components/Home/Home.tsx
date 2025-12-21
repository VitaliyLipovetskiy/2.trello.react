import {useState} from 'react';
import {Board} from '../index';
import './home.scss';
import {Link} from "react-router-dom";

type BoardType = {
    id: number,
    title: string,
    custom: {
        background: string
    },
}

export const Home = () => {
    const [boards, setBoards] = useState<BoardType[]>(listsDefault)

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
                            title={board.title}
                            background={board.custom.background}
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

const listsDefault: BoardType[] = [
    {id: 1, title: "покупки", custom: {background: "red"}},
    {id: 2, title: "підготовка до весілля", custom: {background: "green"}},
    {id: 3, title: "розробка інтернет-магазину", custom: {background: "blue"}},
    {id: 4, title: "курс по просуванню у соцмережах", custom: {background: "grey"}}
]
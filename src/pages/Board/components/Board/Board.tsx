import { useState } from 'react';
import { List } from '../List/List';
import { ICard } from '../../../../common/interfaces';
import './board.scss'

type ListBoardType = {
    id: number,
    title: string,
    cards: ICard[],
}

export const Board = () => {
    const [title, setTitle] = useState('Моя тестова дошка');
    const [lists, setLists] = useState<ListBoardType[]>(listsDefault)

    return (
        <>
            <header>
                <div className={'board-header'}>
                    <button>{'<-Додому'}</button>
                    <h1>{title}</h1>
                </div>
            </header>
            <div className={'board-lists container'}>
                {lists.map((list) =>
                    <List key={list.id} title={list.title} cards={list.cards}/>
                )}
                <div className={'board-list'}>
                    <div className={'board-list-add'}>
                    <button>+ Добавити список</button>
                    </div>
                </div>
            </div>
        </>
    )
}

const listsDefault: ListBoardType[] = [
    {
        id: 1,
        title: "Плани",
        cards: [
            {id: 1, title: "помити кота"},
            {id: 2, title: "приготувати суп"},
            {id: 3, title: "сходити в магазин"}
        ]
    },
    {
        id: 2,
        title: "В процесі",
        cards: [
            {id: 4, title: "подивитися серіал"}
        ]
    },
    {
        id: 3,
        title: "Зроблено",
        cards: [
            {id: 5, title: "зробити домашку"},
            {id: 6, title: "погуляти з собакой"}
        ]
    }
]
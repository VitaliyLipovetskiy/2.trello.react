import {ICard} from '../../../../common/interfaces';
import {Card} from '../Card/Card';
import './list.scss';

export const List = ({title, cards}: { title: string, cards: ICard[] }) => {
    return (
        <div className={'board-list'}>
            <div className={'board-list-title'}>{title}</div>
            {cards.map(card =>
                <Card
                    key={card.id}
                    title={card.title}
                />
            )}
            <div className={'board-list-add-card'}>
                <button>+ Добавити карточку</button>
            </div>
        </div>
    )
}
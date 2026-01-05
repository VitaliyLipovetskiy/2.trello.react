import './card.scss';

export const Card = ({title}: {title: string}) => {
    return (
        <div
            className={'board-card'}
        >
            {title}
        </div>
    )
}
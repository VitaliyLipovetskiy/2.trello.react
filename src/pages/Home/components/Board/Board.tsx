import './board.scss';

export const Board = ({ title, background }: { title: string, background?: string }) => {
    return (
        <div className={'home-board'} style={{background}}>
            <h4>{title}</h4>
        </div>
    )
}
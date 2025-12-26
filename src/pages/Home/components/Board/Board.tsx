import {useEffect, useState} from "react";
import api from "../../../../api/request";
import './board.scss';

type BoardDetailType = {
    title: string,
    custom: {
        background: string
    },
}

export const Board = ({ id }: { id: number }) => {
    const [board, setBoard] = useState<BoardDetailType>();

    const fetchData = async () => {
        console.log(id)
        const board  = await api.get<any, BoardDetailType, any>(`board/${id}`)
        setBoard(board)
    };

    useEffect(() => {
        fetchData();
        console.log(board)
    }, [])

    return (
        <div className={'home-board'} style={{background: board?.custom?.background}}>
            <h4>{board?.title}</h4>
        </div>
    )
}
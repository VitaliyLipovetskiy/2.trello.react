import React, {useEffect, useState} from "react";
import { BoardTitle } from "../BoardTitle/BoardTitle";
import './create-board.scss';

type CreateBoardProp = {
    onClose: () => void,
    handleCreateBoard: (title: string) => void,
}

export const CreateBoard = ({onClose, handleCreateBoard}: CreateBoardProp) => {
    const [title, setTitle] = useState('');
    const [titleValid, setTitleValid] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose();
            }
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    const handleAcceptCreateBoard = (e: React.MouseEvent) => {
        e.preventDefault();
        handleCreateBoard(title);
        onClose();
    }

    return (
        <div className={'modal-crete-board'}>
            <div className={'modal-content'}>
                <i
                    className={'btn-close'}
                    onClick={onClose}
                    onKeyDown={onClose}
                    tabIndex={-1}
                    aria-hidden={true}
                >
                    X
                </i>
                <h1>Створити дошку</h1>
                <label htmlFor={'title'}>
                    Назва дошки*
                </label>
                <BoardTitle
                    setTitle={setTitle}
                    setTitleValid={setTitleValid}
                />
                <button
                    className={'btn-accept' + (titleValid ? '' : ' disabled')}
                    disabled={!titleValid}
                    onMouseDown={handleAcceptCreateBoard}
                >
                    Створити
                </button>
            </div>
        </div>
    )
}
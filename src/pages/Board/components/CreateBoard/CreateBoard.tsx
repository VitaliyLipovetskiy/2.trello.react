import React, {useEffect, useState} from "react";
import { BoardTitle } from "../index";
import './create-board.scss';

type CreateBoardProp = {
    onClose: () => void,
    handleCreateBoard: (title: string) => void,
}

export const CreateBoard = ({onClose, handleCreateBoard}: CreateBoardProp) => {
    const [title, setTitle] = useState('');
    const [titleValid, setTitleValid] = useState(false);

    // const closeModalWindow = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    //     if ((e.target as Element).className === 'modal-crete-board') {
    //         onClose();
    //     }
    // }

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

    const handleClickAccept = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        handleCreateBoard(title);
        onClose();
    }

    return (
        <div
            className={'modal-crete-board'}
            // onClick={closeModalWindow}
            aria-hidden={true}
        >
            <form className={'modal-content'} onSubmit={handleClickAccept}>
                <i
                    className={'btn-close'}
                    onClick={onClose}
                    onKeyDown={onClose}
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
                    type={'submit'}
                    className={'btn-accept' + (titleValid ? '' : ' disabled')}
                    disabled={!titleValid}
                >
                    Створити
                </button>
            </form>
        </div>
    )
}
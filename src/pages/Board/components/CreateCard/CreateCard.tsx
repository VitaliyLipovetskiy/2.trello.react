import React, {useEffect, useRef, useState} from "react";
import {validateTitle} from '../../../../utils/validates';
import './create-card.scss';

export const CreateCard = (
    {isCardNew, setIsCardNew, handleCreateCard}: {
        isCardNew: boolean,
        setIsCardNew: (value: boolean) => void,
        handleCreateCard: (name: string) => void,
    }) => {
    const [title, setTitle] = useState('');
    const [titleTouched, setTitleTouched] = useState(false);
    const [errors, setErrors] = useState<string[]>([]);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (!isCardNew) {
            setTitle('');
            setTitleTouched(false);
            setErrors([]);
        }
    }, [isCardNew]);

    const handleChangeTitle = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setTitle(e.target.value);
        setTitleTouched(true);
        const titleErrors = validateTitle(e.target.value);
        setErrors(titleErrors);
    }

    const handleKeyUpEnter = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter") {
            if (inputRef.current) {
                inputRef.current.blur();
            }
            handleCreateCard(title);
        }
    }

    const handleClickAcceptNewCard = (e: React.FormEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setTitle('');
        setErrors([]);
        setTitleTouched(false);
        setIsCardNew(false);
        handleCreateCard(title);
    }

    const handleCancelCreateNewCard = (e: React.FormEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setTitle('');
        setErrors([]);
        setTitleTouched(false);
        setIsCardNew(false);
    }

    const handleBlurInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
        e.preventDefault();
        setIsCardNew(false);
    }

    return (
        <div className={'board-add-card'}>
            {isCardNew ?
                <div className={'board-card-new'}>
                    <textarea
                        className={'board-card-new-input'}
                        name={'cardTitle'}
                        value={title}
                        ref={inputRef}
                        required
                        autoFocus
                        onChange={handleChangeTitle}
                        onBlur={handleBlurInput}
                        onKeyUp={handleKeyUpEnter}
                    />
                    <div
                        className={'error'}
                        hidden={errors.length === 0}
                    >
                        {errors.map(e => <p key={e}>{e}</p>)}
                    </div>
                    <div className={'board-card-btn'}>
                        <button
                            className={'btn-accept' + (titleTouched && errors.length === 0 ? '' : ' disabled')}
                            disabled={!(titleTouched && errors.length === 0)}
                            onMouseDown={handleClickAcceptNewCard}
                        >
                            Додати картку
                        </button>
                        <button
                            className={'btn-close'}
                            onMouseDown={handleCancelCreateNewCard}
                        >
                            X
                        </button>
                    </div>
                </div>
                :
                <button
                    className={'board-card-add-btn'}
                    onClick={() => setIsCardNew(true)}
                >
                    + Додати картку
                </button>
            }
        </div>
    )
}
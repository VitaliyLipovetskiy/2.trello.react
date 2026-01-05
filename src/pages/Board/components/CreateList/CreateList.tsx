import React, {useEffect, useRef, useState} from "react";
import './create-list.scss';

export const CreateList = (
    {isListNew, setIsListNew, handleCreateList }: {
        isListNew: boolean,
        setIsListNew: (value: boolean) => void,
        handleCreateList: (name: string) => void,
    }) => {
    const [title, setTitle] = useState('');
    const [titleTouched, setTitleTouched] = useState(false);
    const titleValid = useRef(true);
    const [errors, setErrors] = useState<string[]>([]);

    useEffect(() => {
        if (!isListNew) {
            setTitle('');
            setTitleTouched(false);
            titleValid.current = true;
            setErrors([]);
        }
    }, [isListNew]);

    const handleValidation = (titleName: string) => {
        const pattern = /^[a-zа-ь0-9-._\s]+[a-zа-ь0-9-._\s]*$/ig;
        let errorsTitle: string[] = [];
        titleValid.current = true;
        if (titleTouched && titleName.trim().length === 0) {
            titleValid.current = false;
            errorsTitle.push('- не може бути порожньою');
        } else if (!pattern.test(titleName)) {
            titleValid.current = false;
            errorsTitle.push('- може містити лише літери, 0-9,', 'пробіли, крапки, "-" і "_"');
        }
        setErrors(errorsTitle);
    }

    const handleChangeTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(e.target.value);
        setTitleTouched(true);
        handleValidation(e.target.value);
    }

    const handleClickAddNewList = () => {
        setIsListNew(true);
    }

    const handleClickAcceptNewList = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setTitle('');
        setErrors([]);
        setTitleTouched(false);
        setIsListNew(false);
        titleValid.current = true;
        handleCreateList(title);
    }

    const handleClickCancelNewList = (e: React.FormEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setTitle('');
        setErrors([]);
        setTitleTouched(false);
        setIsListNew(false);
        titleValid.current = true;
    }

    return (
        <div className={'board-list-add'}>
            {isListNew ?
                <form
                    className={'board-list-new'}
                    onSubmit={handleClickAcceptNewList}
                >
                    <input
                        className={'board-list-new-input'}
                        name={'listTitle'}
                        type={'text'}
                        value={title}
                        autoFocus
                        onChange={handleChangeTitle}
                    />
                    <div className={'error'} hidden={titleValid.current}>
                        {errors.map(e => <p key={e}>{e}</p>)}
                    </div>
                    <div className={'board-list-btn'}>
                        <button
                            type={'submit'}
                            className={'btn-accept' + (titleTouched && titleValid.current ? '' : ' disabled')}
                            disabled={!(titleTouched && titleValid.current)}
                        >
                            Додати список
                        </button>
                        <button
                            className={'btn-close'}
                            type={'button'}
                            onClick={handleClickCancelNewList}
                        >
                            X
                        </button>
                    </div>

                </form>
                :
                <button
                    className={'board-list-add-btn'}
                    onClick={handleClickAddNewList}
                >
                    + Додайте ще один список
                </button>}
        </div>
    )
}
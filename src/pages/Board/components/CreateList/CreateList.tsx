import React, {useEffect, useState} from 'react';
import {validateTitle} from '../../../../utils/validates';
import './create-list.scss';

type CreateListProps = {
    isListNew: boolean;
    setIsListNew: (value: boolean) => void;
    handleCreateList: (name: string) => void;
}

export const CreateList = ({isListNew, setIsListNew, handleCreateList }: CreateListProps) => {
    const [title, setTitle] = useState('');
    const [titleTouched, setTitleTouched] = useState(false);
    const [errors, setErrors] = useState<string[]>([]);

    useEffect(() => {
        if (!isListNew) {
            setTitle('');
            setTitleTouched(false);
            setErrors([]);
        }
    }, [isListNew]);

    const handleChangeTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(e.target.value);
        setTitleTouched(true);
        const titleErrors = validateTitle(e.target.value);
        setErrors(titleErrors);
    }

    const handleAcceptNewList = (e: React.MouseEvent) => {
        e.preventDefault();
        setTitle('');
        setErrors([]);
        setTitleTouched(false);
        setIsListNew(false);
        handleCreateList(title);
    }

    const handleCancelNewList = (e: React.MouseEvent) => {
        e.preventDefault();
        setTitle('');
        setErrors([]);
        setTitleTouched(false);
        setIsListNew(false);
    }

    const handleBlurInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        setIsListNew(false);
    }

    return (
        <div className={'board-list-add'}>
            {isListNew ?
                <div className={'board-list-new'}>
                    <input
                        id={'listTitle'}
                        className={'board-list-new-input'}
                        name={'listTitle'}
                        type={'text'}
                        value={title}
                        required
                        autoFocus
                        onChange={handleChangeTitle}
                        onBlur={handleBlurInput}
                    />
                    <div className={'error'} hidden={errors.length === 0}>
                        {errors.map(e => <p key={e}>{e}</p>)}
                    </div>
                    <div className={'board-list-btn'}>
                        <button
                            className={'btn-accept' + (titleTouched && errors.length === 0 ? '' : ' disabled')}
                            disabled={!(titleTouched && errors.length === 0)}
                            onMouseDown={handleAcceptNewList}
                        >
                            Додати список
                        </button>
                        <button
                            className={'btn-close'}
                            onMouseDown={handleCancelNewList}
                        >
                            X
                        </button>
                    </div>
                </div>
                :
                <button
                    className={'board-list-add-btn'}
                    onClick={() => setIsListNew(true)}
                >
                    + Додайте ще один список
                </button>}
        </div>
    )
}
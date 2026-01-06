import React, {useRef, useState} from 'react';
import {updateCardById} from '../../../../services/services';
import {IUpdateCard} from '../../../../common/interfaces';
import {validateTitle} from '../../../../utils/validates';
import './card.scss';

type CardTitleProps = {
    boardId: number,
    listId: number,
    cardId: number,
    title: string,
    handleUpdateCard: () => void,
}

export const Card = (props: CardTitleProps) => {
    const [readOnly, setReadOnly] = useState(true);
    const [title, setTitle] = useState(props.title);
    const [errors, setErrors] = useState<string[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleChangeTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(e.target.value);
        const titleErrors = validateTitle(e.target.value);
        setErrors(titleErrors);
    }

    const updateCard = async () => {
        const cardData: IUpdateCard = {
            title: title.trim(),
            list_id: props.listId,
        }
        let {result} = await updateCardById(props.boardId, props.cardId, cardData);
        return result;
    }

    const handleOnBlurTitle = () => {
        if (errors.length !== 0 || title.trim() === props.title) {
            return;
        }
        updateCard()
            .then(result => {
                if (result === 'Updated') {
                    props.handleUpdateCard();
                }
            })
            .catch(error => {
                console.log(error);
                // toast
            });
    }

    const handleKeyUpEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            if (inputRef.current) {
                inputRef.current.blur();
            }
            handleOnBlurTitle();
        }
    }

    return (
        <div className={`${readOnly ? 'board-card-readonly' : 'board-card-edit'} board-card`}>
            <input
                type={'text'}
                value={title}
                required
                readOnly={readOnly}
                autoFocus={!readOnly}
                ref={inputRef}
                onClick={() => setReadOnly(false)}
                onChange={handleChangeTitle}
                onBlur={handleOnBlurTitle}
                onKeyUp={handleKeyUpEnter}
            />
            <div className={'error'} hidden={errors.length === 0}>
                {errors.map(e => <p key={e}>{e}</p>)}
            </div>
        </div>
    )
}
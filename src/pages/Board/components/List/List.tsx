import React, {useRef, useState} from 'react';
import {IBoardList, ICreateCard} from '../../../../common/interfaces';
import {Card} from '../Card/Card';
import {CreateCard} from '../CreateCard/CreateCard';
import {createCard, updateListById} from '../../../../services/board/board.service';
import {validateTitle} from '../../../../utils/validates';
import './list.scss';

type ListProps = {
    boarId: number,
    list: IBoardList,
    handleUpdateBoard: () => void,
}

export const List = ({boarId, list, handleUpdateBoard}: ListProps) => {
    const [titleReadOnly, setTitleReadOnly] = useState(true);
    const [title, setTitle] = useState(list.title);
    const [errors, setErrors] = useState<string[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);
    const [isCardNew, setIsCardNew] = useState(false);

    const handleChangeTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(e.target.value);
        const titleErrors = validateTitle(e.target.value);
        setErrors(titleErrors);
    }

    const handleOnBlurTitle = () => {
        setErrors([]);
        setTitleReadOnly(true);
        if (errors.length !== 0) {
            setTitle(list.title);
        } else if (list.title !== title.trim()) {
            const fetchData = async () => {
                const {result} = await updateListById(boarId, list.id, {title: title.trim()});
                if (result === 'Updated') {
                    handleUpdateBoard();
                } else {
                    // toast
                }
            };
            fetchData().catch(error => {
                console.log(error);
                // toast
            });
        }
    }

    const handleKeyUpEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            if (inputRef.current) {
                inputRef.current.blur();
            }
            handleOnBlurTitle();
        }
    }

    const handleCreateCard = async (title: string) => {
        const newCard: ICreateCard = {
            title,
            list_id: list.id,
            position: list.cards
                .map(c => c.position)
                .reduce((a, b) => Math.max(a, b), 0) + 1,
        }
        const {result} = await createCard(boarId,newCard);
        if (result === 'Created') {
            handleUpdateBoard();
        } else {
            // toast
        }
    }

    return (
        <div className={'board-list'}>
            <div className={`${titleReadOnly ? 'board-list-title-readonly' : 'board-list-title-write'} board-list-title`}>
                <input
                    name={'title'}
                    type={'text'}
                    value={title}
                    ref={inputRef}
                    required
                    readOnly={titleReadOnly}
                    autoFocus={!titleReadOnly}
                    onClick={() => setTitleReadOnly(false)}
                    onChange={handleChangeTitle}
                    onBlur={handleOnBlurTitle}
                    onKeyUp={handleKeyUpEnter}
                />
                <div className={'error'} hidden={errors.length === 0}>
                    {errors.map(e => <p key={e}>{e}</p>)}
                </div>
            </div>
            {list.cards.map(card =>
                <Card
                    key={card.id}
                    boardId={boarId}
                    listId={list.id}
                    cardId={card.id}
                    title={card.title}
                    handleUpdateCard={handleUpdateBoard}
                />
            )}
            <CreateCard
                isCardNew={isCardNew}
                setIsCardNew={setIsCardNew}
                handleCreateCard={handleCreateCard}
            />
        </div>
    )
}
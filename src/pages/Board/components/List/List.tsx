import React, {useRef, useState} from "react";
import {IBoardList} from '../../../../common/interfaces';
import {Card} from '../Card/Card';
import './list.scss';
import {getBoardById, updateListById} from "../../../../services/board/board.service";

export const List = ({id, list}: { id: number, list: IBoardList }) => {
    const [titleReadOnly, setTitleReadOnly] = useState(true);
    const [title, setTitle] = useState(list.title);
    const [titleValid, setTitleValid] = useState(true);
    const [titleTouched, setTitleTouched] = useState(false);
    const [errors, setErrors] = useState<string[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);
    const titleTemp = useRef(list.title);

    const handleValidation = (titleName: string) => {
        const pattern = /^[a-zа-ь0-9-._\s]+[a-zа-ь0-9-._\s]*$/ig;
        let errorsTitle: string[] = [];
        if (titleTouched && titleName.trim().length === 0) {
            errorsTitle.push('- не може бути порожньою');
        } else if (!pattern.test(titleName)) {
            errorsTitle.push('- може містити лише літери, цифри, пробіли, крапки "-" і "_"');
        }
        setTitleValid(errorsTitle.length === 0);
        setErrors(errorsTitle);
    }

    const handleChangeTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(e.target.value);
        setTitleTouched(true);
        handleValidation(e.target.value);
    }

    const handleOnBlurTitle = () => {
        setErrors([]);
        setTitleReadOnly(true);
        if (!titleValid) {
            setTitle(titleTemp.current);
        } else if (titleTemp.current !== title.trim()) {
            const fetchData = async () => {
                list.title = title.trim();
                const {result} = await updateListById(id, list.id, {title: title.trim()});
                if (result === 'Updated') {
                    const board = await getBoardById(+(id || 0));
                    titleTemp.current = board.lists.find((l) => l.id === list.id)?.title || '';
                    setTitle(titleTemp.current)
                }
            };
            fetchData();
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
                <div className={'error'} hidden={titleValid}>
                    {errors.map(e => <p key={e}>{e}</p>)}
                </div>
            </div>
            {list.cards.map(card =>
                <Card
                    key={card.id}
                    title={card.title}
                />
            )}
            <div className={'board-list-add-card'}>
                <button>+ Добавити карточку</button>
            </div>
        </div>
    )
}
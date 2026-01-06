import React, {useRef, useState} from 'react';
import {validateTitle} from '../../../../utils/validates';
import './board-title.scss';

type BoardTitleProps = {
    title?: string,
    readonly?: boolean,
    className?: string,
    setTitle: (title: string) => void,
    setTitleValid: (isValid: boolean) => void,
    handleClickTitle?: () => void,
    onBlur?: () => void
}

export const BoardTitle = (
    {
        title,
        setTitle,
        setTitleValid,
        readonly,
        className,
        handleClickTitle,
        onBlur,
    }: BoardTitleProps) => {
    const [errors, setErrors] = useState<string[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleChangeTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(e.target.value);
        const titleErrors = validateTitle(e.target.value);
        setErrors(titleErrors);
        setTitleValid(titleErrors.length === 0);
    }

    const handleOnBlurTitle = () => {
        setErrors([]);
        if (onBlur) {
            onBlur();
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
        <div className={`${className || ''} board-title`}>
            <input
                id={'title'}
                name={'title'}
                type={'text'}
                value={title}
                ref={inputRef}
                required
                readOnly={readonly}
                autoFocus={!readonly}
                onClick={handleClickTitle}
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
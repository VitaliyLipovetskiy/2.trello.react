import React, {useRef, useState} from "react";
import './board-title.scss';

type BoardTitleProps = {
    title?: string,
    readonly?: boolean,
    className?: string,
    setTitle: (title: string) => void,
    setTitleValid: (isValid: boolean) => void,
    onClick?: () => void,
    onBlur?: () => void
}

export const BoardTitle = ({ title, setTitle, setTitleValid, readonly, className, onClick, onBlur }: BoardTitleProps) => {
    const [titleTouched, setTitleTouched] = useState(false);
    const titleValid = useRef(true);
    const [errors, setErrors] = useState<string[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleValidation = (titleName: string) => {
        const pattern = /^[a-zа-ь0-9-._\s]+[a-zа-ь0-9-._\s]*$/ig;
        let errorsTitle: string[] = [];
        titleValid.current = true;
        if (titleTouched && titleName.trim().length === 0) {
            titleValid.current = false;
            errorsTitle.push('- не може бути порожньою');
        } else if (!pattern.test(titleName)) {
            titleValid.current = false;
            errorsTitle.push('- може містити лише літери, цифри, пробіли, крапки "-" і "_"');
        }
        setTitleValid(titleValid.current);
        setErrors(errorsTitle);
    }

    const handleChangeTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(e.target.value);
        setTitleTouched(true);
        handleValidation(e.target.value);
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
                onClick={onClick}
                onChange={handleChangeTitle}
                onBlur={handleOnBlurTitle}
                onKeyUp={handleKeyUpEnter}
            />
            <div className={'error'} hidden={titleValid.current}>
                {errors.map(e => <p key={e}>{e}</p>)}
            </div>
        </div>
    )
}
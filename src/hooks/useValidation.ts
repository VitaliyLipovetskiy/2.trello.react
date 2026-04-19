import { useMemo, useState } from 'react';

const VALIDATION_PATTERN = /^[a-zа-яіїєґ0-9\-._\s]+$/i;

const ALLOWED_CHARS = /[a-zа-яіїєґ0-9\-._\s]/gi;

const validate = (message: string): string[] => {
  if (message.trim().length === 0) {
    return ['- не може бути порожньою'];
  }
  if (!VALIDATION_PATTERN.test(message)) {
    const invalidChars = [...new Set(message.replaceAll(ALLOWED_CHARS, ''))].join(' ');
    return [`- містить недопустимі символи: ${invalidChars}`];
  }
  return [];
};

const useValidation = (message: string) => {
  const [touched, setTouched] = useState(false);
  const errors = useMemo(() => validate(message), [message]);

  return { errors, touched, setTouched };
};

export default useValidation;

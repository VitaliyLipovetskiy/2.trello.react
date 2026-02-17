import { useEffect, useState } from 'react';

const validate = (message: string): string[] => {
  const pattern = /^[a-zа-яіїєґ0-9-._\s]+[a-zа-ьіїєґ0-9-._\s]*$/gi;
  let errors: string[] = [];
  if (message.trim().length === 0) {
    errors.push('- не може бути порожньою');
  } else if (!pattern.test(message)) {
    errors.push('- може містити лише літери, 0-9, пробіли, крапки, "-" і "_"');
  }
  return errors;
};

const useValidation = (message: string) => {
  const [touched, setTouched] = useState(false);
  const [errors, setErrors] = useState<string[]>(() => validate(message));

  useEffect(() => {
    setErrors(touched ? validate(message) : []);
  }, [message, touched]);

  return { errors, touched, setTouched };
};

export default useValidation;

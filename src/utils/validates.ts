const validateTitle = (title: string): string[] => {
  const pattern = /^[a-zа-яіїєґ0-9-._\s]+[a-zа-ьіїєґ0-9-._\s]*$/gi;
  let errors: string[] = [];
  if (title.trim().length === 0) {
    errors.push('- не може бути порожньою');
  } else if (!pattern.test(title)) {
    errors.push('- може містити лише літери, 0-9,', 'пробіли, крапки, "-" і "_"');
  }
  return errors;
};

export { validateTitle };

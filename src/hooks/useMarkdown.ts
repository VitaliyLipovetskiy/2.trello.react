const transformMarkdown = (value: string | null | undefined): string => {
  if (!value) return '';

  const urlPattern = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#/%?=~_|!:,.;]*[-A-Z0-9+&@#/%=~_|])/gi;

  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll(/^# (.*?)$/gm, '<h1>$1</h1>')
    .replaceAll(/^## (.*?)$/gm, '<h2>$1</h2>')
    .replaceAll(/^### (.*?)$/gm, '<h3>$1</h3>')
    .replaceAll(/(\*\*|__)(.*?)(\*\*|__)/g, '<strong>$2</strong>')
    .replaceAll(/([*_])(.*?)([*_])/g, '<em>$2</em>')
    .replaceAll(/~~(.*?)~~/g, '<del>$1</del>')
    .replaceAll(/`(.*?)`/g, '<code>$1</code>')
    .replaceAll(/\[(.*?)]\((.*?)\)/g, (_, text, url) => {
      if (!/^https?:\/\//i.test(url)) return text;
      const safeUrl = url.replaceAll('"', '%22');
      return `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer">${text}</a>`;
    })
    .replaceAll(urlPattern, (_, url) => {
      const safeUrl = url.replaceAll('"', '%22');
      return `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer">${safeUrl}</a>`;
    })
    .replaceAll('\n', '<br>');
};

export default transformMarkdown;

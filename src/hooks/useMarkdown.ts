const transform = (value: string | null | undefined) => {
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
    .replaceAll(/(\*|_)(.*?)(\*|_)/g, '<em>$2</em>')
    .replaceAll(/~~(.*?)~~/g, '<del>$1</del>')
    .replaceAll(/`(.*?)`/g, '<code>$1</code>')
    .replaceAll(/\[(.*?)]\((.*?)\)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>')
    .replaceAll(urlPattern, (match, url) => {
      return `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
    })
    .replaceAll('\n', '<br>');
};

const useMarkdown = (value: string | null | undefined) => {
  const innerHTML = transform(value);
  return { innerHTML };
};

export default useMarkdown;

export function extractCity(address: string): string {
  const match = address.match(
    /(?:北京市|天津市|上海市|重庆市|.*?[省|自治区])(.*?[市|区|县|州])/
  );
  if (match) {
    return match[1] || match[0];
  }
  const cityMatch = address.match(/^(.[^省市]{2,4}?)[市区县]/);
  return cityMatch ? cityMatch[1] : '';
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

export function truncateText(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen) + '...';
}

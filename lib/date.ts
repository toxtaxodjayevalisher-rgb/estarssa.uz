export function formatUzDate(date: Date | string = new Date()): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';

  const weekdays = ["yakshanba", "dushanba", "seshanba", "chorshanba", "payshanba", "juma", "shanba"];
  const months = ["yanvar", "fevral", "mart", "aprel", "may", "iyun", "iyul", "avgust", "sentabr", "oktabr", "noyabr", "dekabr"];
  
  const weekday = weekdays[d.getDay()] || '';
  const day = d.getDate();
  const month = months[d.getMonth()] || '';
  const year = d.getFullYear();
  
  return `${weekday}, ${day}-${month}, ${year}`;
}

export function formatUzDateShort(date: Date | string = new Date()): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
}

export const formatNotificationTime = (date: Date) => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const oneDay = 1000 * 60 * 60 * 24;

  if (diff < oneDay) {
    // Today → show "3:15 PM"
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (diff < 2 * oneDay) {
    // Yesterday → "Yesterday, 4:20 PM"
    return `Yesterday, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  } else {
    // Older → "26-10-2025, 4:00 PM"
    return `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }
};
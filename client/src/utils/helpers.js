export function formatTimestamp(date) {
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).format(date);
}

export function generateInviteUrl(roomId, roomCode = null) {
  const baseUrl = window.location.origin;
  const url = `${baseUrl}/room/${roomId}`;
  return roomCode ? `${url}?code=${roomCode}` : url;
}

export function generateInviteMessage(roomName, examTag, inviteUrl, roomCode = null) {
  const codeText = roomCode ? `\nRoom Code: ${roomCode}` : '';
  
  return `Hey! I'm preparing for ${examTag} and I've created a study room on Exam Hub. Join me for combined studies! 🎯
👉 ${inviteUrl}${codeText}`;
}

export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function truncateText(text, maxLength) {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function getTimeAgo(date) {
  const now = new Date();
  const past = new Date(date);
  const diffInMinutes = Math.floor((now - past) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
  return `${Math.floor(diffInMinutes / 1440)}d ago`;
}

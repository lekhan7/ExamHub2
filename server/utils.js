const crypto = require('crypto');

function generateId() {
  return crypto.randomBytes(8).toString('hex');
}

function generateInviteUrl(roomId, roomCode = null) {
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://exam-hub.vercel.app' 
    : 'http://localhost:5173';
  
  const url = `${baseUrl}/room/${roomId}`;
  return roomCode ? `${url}?code=${roomCode}` : url;
}

function generateInviteMessage(roomName, examTag, inviteUrl, roomCode = null) {
  const codeText = roomCode ? `\nRoom Code: ${roomCode}` : '';
  
  return `Hey! I'm preparing for ${examTag} and I've created a study room on Exam Hub. Join me for combined studies! 🎯
👉 ${inviteUrl}${codeText}`;
}

function formatTimestamp(date) {
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).format(date);
}

module.exports = {
  generateId,
  generateInviteUrl,
  generateInviteMessage,
  formatTimestamp
};

import api from '../api';

export const chatService = {
  // Get all active conversations for the user
  getConversations: async () => {
    const res = await api.get('/api/chat');
    return res.data;
  },

  // Search users for creating new group
  searchUsers: async (query = '') => {
    const res = await api.get(`/api/chat/search-users?q=${encodeURIComponent(query)}`);
    return res.data;
  },

  // Get unread message count
  getUnreadCount: async () => {
    const res = await api.get('/api/chat/unread');
    return res.data.unreadCount;
  },

  // Get messages for a specific conversation
  getMessages: async (conversationId) => {
    const res = await api.get(`/api/chat/${conversationId}/messages`);
    return res.data;
  },

  // Get members of a specific conversation
  getConversationMembers: async (conversationId) => {
    const res = await api.get(`/api/chat/${conversationId}/members`);
    return res.data;
  },

  // Start or get a direct chat
  startDirectChat: async (targetUserId) => {
    const res = await api.post('/api/chat/direct', { targetUserId });
    return res.data;
  },

  // Create a custom group chat
  createGroupChat: async (name, memberIds) => {
    const res = await api.post('/api/chat/group', { name, memberIds });
    return res.data;
  },

  // Add members to custom group
  addGroupMembers: async (conversationId, memberIds, emails) => {
    const res = await api.post(`/api/chat/${conversationId}/members`, { memberIds, emails });
    return res.data;
  },

  // Leave a group
  leaveGroup: async (conversationId) => {
    const res = await api.delete(`/api/chat/${conversationId}/leave`);
    return res.data;
  },

  // Upload an attachment
  uploadAttachment: async (conversationId, file) => {
    const formData = new FormData();
    formData.append('attachment', file);
    const res = await api.post(`/api/chat/${conversationId}/attachments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  // Edit message
  editMessage: async (messageId, text) => {
    const res = await api.put(`/api/chat/messages/${messageId}`, { text });
    return res.data;
  },

  // React to message
  reactToMessage: async (messageId, emoji) => {
    const res = await api.post(`/api/chat/messages/${messageId}/react`, { emoji });
    return res.data;
  },

  // Delete message for everyone
  deleteForEveryone: async (messageId) => {
    const res = await api.delete(`/api/chat/messages/${messageId}/everyone`);
    return res.data;
  },

  // Delete message for me
  deleteForMe: async (messageId) => {
    const res = await api.delete(`/api/chat/messages/${messageId}/me`);
    return res.data;
  },

  // Archive chat
  toggleArchive: async (conversationId) => {
    const res = await api.put(`/api/chat/${conversationId}/archive`);
    return res.data;
  },

  // Lock chat
  toggleLock: async (conversationId) => {
    const res = await api.put(`/api/chat/${conversationId}/lock`);
    return res.data;
  },

  // Clear chat history
  clearHistory: async (conversationId) => {
    const res = await api.post(`/api/chat/${conversationId}/clear`);
    return res.data;
  },

  // Search messages in chat
  searchMessages: async (conversationId, query) => {
    const res = await api.get(`/api/chat/${conversationId}/search?q=${encodeURIComponent(query)}`);
    return res.data;
  },

  // Set PIN
  setPin: async (pin) => {
    const res = await api.post('/api/chat/pin', { pin });
    return res.data;
  },

  // Verify PIN
  verifyPin: async (pin) => {
    const res = await api.post('/api/chat/verify-pin', { pin });
    return res.data;
  }
};

import api from './api';

// Get all members
export const getAllMembers = async () => {
  const response = await api.get('/members');
  return response.data;
};

// Get a single member by ID
export const getMemberById = async (id) => {
  const response = await api.get(`/members/${id}`);
  return response.data;
};

// Create a new member
export const createMember = async (memberData) => {
  const response = await api.post('/members', memberData);
  return response.data;
};

// Update a member
export const updateMember = async (id, memberData) => {
  const response = await api.put(`/members/${id}`, memberData);
  return response.data;
};

// Delete a member
export const deleteMember = async (id) => {
  const response = await api.delete(`/members/${id}`);
  return response.data;
};

// Get members with overdue books
export const getMembersWithOverdueBooks = async () => {
  const response = await api.get('/members/overdue');
  return response.data;
};

// Get inactive members
export const getInactiveMembers = async () => {
  const response = await api.get('/members/inactive');
  return response.data;
};

// Search members
export const searchMembers = async (query) => {
  const response = await api.get(`/members/search?query=${encodeURIComponent(query)}`);
  return response.data;
};
import api from './api';

// Get all authors
export const getAllAuthors = async () => {
  const response = await api.get('/authors');
  return response.data;
};

// Get a single author by ID
export const getAuthorById = async (id) => {
  const response = await api.get(`/authors/${id}`);
  return response.data;
};

// Create a new author
export const createAuthor = async (authorData) => {
  const response = await api.post('/authors', authorData);
  return response.data;
};

// Update an author
export const updateAuthor = async (id, authorData) => {
  const response = await api.put(`/authors/${id}`, authorData);
  return response.data;
};

// Delete an author
export const deleteAuthor = async (id) => {
  const response = await api.delete(`/authors/${id}`);
  return response.data;
};

// Get popular authors
export const getPopularAuthors = async () => {
  const response = await api.get('/authors/popular');
  return response.data;
};

// Search authors
export const searchAuthors = async (query) => {
  const response = await api.get(`/authors/search?query=${encodeURIComponent(query)}`);
  return response.data;
};

// Get authors by nationality
export const getAuthorsByNationality = async (nationality) => {
  const response = await api.get(`/authors/nationality/${nationality}`);
  return response.data;
};
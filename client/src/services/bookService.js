import api from './api';

// Get all books
export const getAllBooks = async () => {
  const response = await api.get('/books');
  return response.data;
};

// Get a single book by ID
export const getBookById = async (id) => {
  const response = await api.get(`/books/${id}`);
  return response.data;
};

// Create a new book
export const createBook = async (bookData) => {
  const response = await api.post('/books', bookData);
  return response.data;
};

// Update a book
export const updateBook = async (id, bookData) => {
  const response = await api.put(`/books/${id}`, bookData);
  return response.data;
};

// Delete a book
export const deleteBook = async (id) => {
  const response = await api.delete(`/books/${id}`);
  return response.data;
};

// Get popular books
export const getPopularBooks = async () => {
  const response = await api.get('/books/popular');
  return response.data;
};

// Search books
export const searchBooks = async (query) => {
  const response = await api.get(`/books/search?query=${encodeURIComponent(query)}`);
  return response.data;
};

// Get books by category
export const getBooksByCategory = async (categoryId) => {
  const response = await api.get(`/books/category/${categoryId}`);
  return response.data;
};

// Get books by author
export const getBooksByAuthor = async (authorId) => {
  const response = await api.get(`/books/author/${authorId}`);
  return response.data;
};
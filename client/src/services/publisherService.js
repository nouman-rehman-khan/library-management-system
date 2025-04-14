import api from './api';

// Get all publishers
export const getAllPublishers = async () => {
  const response = await api.get('/publishers');
  return response.data;
};

// Get a single publisher by ID
export const getPublisherById = async (id) => {
  const response = await api.get(`/publishers/${id}`);
  return response.data;
};

// Create a new publisher
export const createPublisher = async (publisherData) => {
  const response = await api.post('/publishers', publisherData);
  return response.data;
};

// Update a publisher
export const updatePublisher = async (id, publisherData) => {
  const response = await api.put(`/publishers/${id}`, publisherData);
  return response.data;
};

// Delete a publisher
export const deletePublisher = async (id) => {
  const response = await api.delete(`/publishers/${id}`);
  return response.data;
};

// Get publishers with book counts
export const getPublishersWithBookCounts = async () => {
  const response = await api.get('/publishers/book-counts');
  return response.data;
};

// Search publishers
export const searchPublishers = async (query) => {
  const response = await api.get(`/publishers/search?query=${encodeURIComponent(query)}`);
  return response.data;
};
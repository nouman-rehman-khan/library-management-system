import api from './api';

// Get all categories
export const getAllCategories = async () => {
  const response = await api.get('/categories');
  return response.data;
};

// Get a single category by ID
export const getCategoryById = async (id) => {
  const response = await api.get(`/categories/${id}`);
  return response.data;
};

// Create a new category
export const createCategory = async (categoryData) => {
  const response = await api.post('/categories', categoryData);
  return response.data;
};

// Update a category
export const updateCategory = async (id, categoryData) => {
  const response = await api.put(`/categories/${id}`, categoryData);
  return response.data;
};

// Delete a category
export const deleteCategory = async (id) => {
  const response = await api.delete(`/categories/${id}`);
  return response.data;
};

// Get top-level categories
export const getTopLevelCategories = async () => {
  const response = await api.get('/categories/top-level');
  return response.data;
};

// Get categories with book counts
export const getCategoriesWithBookCounts = async () => {
  const response = await api.get('/categories/book-counts');
  return response.data;
};

// Get subcategories of a category
export const getSubcategories = async (categoryId) => {
  const response = await api.get(`/categories/${categoryId}/subcategories`);
  return response.data;
};
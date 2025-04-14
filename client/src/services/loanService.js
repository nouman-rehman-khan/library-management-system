import api from './api';

// Get all loans
export const getAllLoans = async () => {
  const response = await api.get('/loans');
  return response.data;
};

// Get a single loan by ID
export const getLoanById = async (id) => {
  const response = await api.get(`/loans/${id}`);
  return response.data;
};

// Create a new loan
export const createLoan = async (loanData) => {
  const response = await api.post('/loans', loanData);
  return response.data;
};

// Return a book
export const returnBook = async (id, returnDate) => {
  const response = await api.put(`/loans/${id}/return`, { returnDate });
  return response.data;
};

// Get overdue loans
export const getOverdueLoans = async () => {
  const response = await api.get('/loans/overdue');
  return response.data;
};

// Get current loans
export const getCurrentLoans = async () => {
  const response = await api.get('/loans/current');
  return response.data;
};

// Get loans for a specific book
export const getLoansByBook = async (bookId) => {
  const response = await api.get(`/loans/book/${bookId}`);
  return response.data;
};

// Get loans for a specific member
export const getLoansByMember = async (memberId) => {
  const response = await api.get(`/loans/member/${memberId}`);
  return response.data;
};
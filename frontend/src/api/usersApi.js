import axiosClient from './axiosClient';

export const getProfile = () => {
  return axiosClient.get('/users/me');
};

export const updateProfile = (data) => {
  return axiosClient.put('/users/me', data);
};

export const updateAvatar = (formData) => {
  return axiosClient.put('/users/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

// Customers
export const getAllCustomers = () => {
  return axiosClient.get('/admin/customers');
};

export const getCustomerHistory = (customerId) => {
  return axiosClient.get(`/admin/customers/${customerId}/history`);
};

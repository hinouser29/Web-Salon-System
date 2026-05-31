import axiosClient from './axiosClient';

export const getActiveServices = () => {
  return axiosClient.get('/services');
};

export const getServiceById = (id) => {
  return axiosClient.get(`/services/${id}`);
};

export const getServiceReviews = (id) => {
  return axiosClient.get(`/reviews/service/${id}`);
};

export const getServiceReviewSummary = (id) => {
  return axiosClient.get(`/reviews/service/${id}/summary`);
};

// Admin Endpoints
export const getAllAdminServices = () => {
  return axiosClient.get('/admin/services');
};

export const createService = (formData) => {
  return axiosClient.post('/admin/services', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const updateService = (id, formData) => {
  return axiosClient.put(`/admin/services/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const deleteService = (id) => {
  return axiosClient.delete(`/admin/services/${id}`);
};

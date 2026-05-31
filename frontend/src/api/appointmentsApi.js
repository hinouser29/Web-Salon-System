import axiosClient from './axiosClient';

// Customer Endpoints
export const createAppointment = (data) => {
  return axiosClient.post('/appointments', data);
};

export const getMyAppointments = () => {
  return axiosClient.get('/appointments/me');
};

export const cancelAppointment = (id) => {
  return axiosClient.post(`/appointments/${id}/cancel`);
};

// Admin / Staff Endpoints
export const getAllAppointments = () => {
  return axiosClient.get('/appointments');
};

export const getTodayAppointments = () => {
  return axiosClient.get('/appointments/today');
};

export const getMySchedule = () => {
  return axiosClient.get('/appointments/my-schedule');
};

export const confirmAppointment = (id) => {
  return axiosClient.post(`/appointments/${id}/confirm`);
};

export const completeAppointment = (id) => {
  return axiosClient.post(`/appointments/${id}/complete`);
};

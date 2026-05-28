import axiosClient from './axiosClient';

export const getServices = () => axiosClient.get('/services');
export const getServiceById = (id) => axiosClient.get(`/services/${id}`);
export const getBranches = () => axiosClient.get('/branches');
export const getTechnicians = (branchId) =>
  axiosClient.get('/technicians', { params: branchId ? { branchId } : {} });

export const createAppointment = (payload) => axiosClient.post('/appointments', payload);
export const getMyAppointments = () => axiosClient.get('/appointments/me');
export const cancelAppointment = (id) => axiosClient.post(`/appointments/${id}/cancel`);

export const getMyInvoices = () => axiosClient.get('/invoices/me');
export const payInvoice = (id, paymentMethod) =>
  axiosClient.post(`/invoices/${id}/pay`, { paymentMethod });

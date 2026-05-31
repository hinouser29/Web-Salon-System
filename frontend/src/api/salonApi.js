import axiosClient from './axiosClient';

export const getServices = () => axiosClient.get('/services');
export const getServiceById = (id) => axiosClient.get(`/services/${id}`);
export const getBranches = () => axiosClient.get('/branches');
export const getTechnicians = (branchId) =>
  axiosClient.get('/technicians', { params: branchId ? { branchId } : {} });

export const createAppointment = (payload) => axiosClient.post('/appointments', payload);
export const getMyAppointments = () => axiosClient.get('/appointments/me');
export const getAllAppointments = () => axiosClient.get('/appointments');
export const getTodayAppointments = () => axiosClient.get('/appointments/today');
export const getMySchedule = () => axiosClient.get('/appointments/my-schedule');
export const cancelAppointment = (id) => axiosClient.post(`/appointments/${id}/cancel`);
export const confirmAppointment = (id) => axiosClient.post(`/appointments/${id}/confirm`);
export const completeAppointment = (id) => axiosClient.post(`/appointments/${id}/complete`);

export const getMyInvoices = () => axiosClient.get('/invoices/me');
export const payInvoice = (id, paymentMethod) =>
  axiosClient.post(`/invoices/${id}/pay`, { paymentMethod });
export const staffPayInvoice = (id, paymentMethod) =>
  axiosClient.post(`/invoices/${id}/staff-pay`, { paymentMethod });
export const getInvoiceByAppointment = (appointmentId) =>
  axiosClient.get(`/invoices/by-appointment/${appointmentId}`);

export const getServiceReviews = (serviceId) => axiosClient.get(`/reviews/services/${serviceId}`);
export const getServiceReviewSummary = (serviceId) => axiosClient.get(`/reviews/services/${serviceId}/summary`);

export const getTechnicianKPI = () => axiosClient.get('/technician/kpi');

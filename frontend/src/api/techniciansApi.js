import axiosClient from './axiosClient';

export const getTechnicians = (branchId = null) => {
  const url = branchId ? `/technicians?branchId=${branchId}` : '/technicians';
  return axiosClient.get(url);
};

export const getTechnicianKPI = () => {
  return axiosClient.get('/technician-kpi/me');
};

// Admin Endpoints
export const getAllEmployees = () => {
  return axiosClient.get('/admin/employees');
};

export const createEmployee = (data) => {
  return axiosClient.post('/admin/employees', data);
};

export const updateEmployee = (id, data) => {
  return axiosClient.put(`/admin/employees/${id}`, data);
};

import axiosClient from './axiosClient';

// ==================== Roles ====================
export const getRoles = () => axiosClient.get('/admin/roles');
export const getRoleById = (id) => axiosClient.get(`/admin/roles/${id}`);
export const createRole = (data) => axiosClient.post('/admin/roles', data);
export const updateRole = (id, data) => axiosClient.put(`/admin/roles/${id}`, data);
export const deleteRole = (id) => axiosClient.delete(`/admin/roles/${id}`);

// ==================== Role-Permission ====================
export const getRolePermissions = (roleId) => axiosClient.get(`/admin/roles/${roleId}/permissions`);
export const assignPermissions = (roleId, permissionIds) =>
  axiosClient.post(`/admin/roles/${roleId}/permissions`, { permissionIds });
export const revokePermission = (roleId, permId) =>
  axiosClient.delete(`/admin/roles/${roleId}/permissions/${permId}`);

// ==================== Permissions ====================
export const getAllPermissions = () => axiosClient.get('/admin/permissions');
export const getGroupedPermissions = () => axiosClient.get('/admin/permissions/grouped');
export const createPermission = (params) => axiosClient.post('/admin/permissions', null, { params });
export const deletePermission = (id) => axiosClient.delete(`/admin/permissions/${id}`);

// ==================== User-Roles ====================
export const getUserRoles = (userId) => axiosClient.get(`/admin/users/${userId}/roles`);
export const assignUserRole = (userId, data) => axiosClient.post(`/admin/users/${userId}/roles`, data);
export const revokeUserRole = (userId, roleId) =>
  axiosClient.delete(`/admin/users/${userId}/roles/${roleId}`);

// ==================== Services ====================
export const getAdminServices = () => axiosClient.get('/admin/services');
export const createAdminService = (data) => axiosClient.post('/admin/services', data);
export const updateAdminService = (id, data) => axiosClient.put(`/admin/services/${id}`, data);
export const deleteAdminService = (id) => axiosClient.delete(`/admin/services/${id}`);

// ==================== Employees ====================
export const getAdminEmployees = () => axiosClient.get('/admin/employees');
export const createAdminEmployee = (data) => axiosClient.post('/admin/employees', data);
export const updateAdminEmployee = (id, data) => axiosClient.put(`/admin/employees/${id}`, data);
export const deleteAdminEmployee = (id) => axiosClient.delete(`/admin/employees/${id}`);

// ==================== Customers ====================
export const getAdminCustomers = () => axiosClient.get('/admin/customers');

// ==================== Dashboard ====================
export const getAdminDashboardStats = () => axiosClient.get('/admin/dashboard/stats');

// ==================== Reports ====================
export const getAdminRevenueReport = (timeframe = 'month') => axiosClient.get('/admin/reports/revenue', { params: { timeframe } });
export const getAdminTopServices = (limit = 5) => axiosClient.get('/admin/reports/top-services', { params: { limit } });

// ==================== Configs ====================
export const getAdminConfigs = () => axiosClient.get('/admin/configs');
export const updateAdminConfigs = (data) => axiosClient.put('/admin/configs', data);

// ==================== System Logs ====================
export const getAdminSystemLogs = (params) => axiosClient.get('/admin/system-logs', { params });

// ==================== Invoices ====================
export const getInvoiceByAppointment = (appointmentId) => axiosClient.get(`/invoices/by-appointment/${appointmentId}`);
export const staffPayInvoice = (invoiceId, data) => axiosClient.post(`/invoices/${invoiceId}/staff-pay`, data);

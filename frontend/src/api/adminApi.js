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

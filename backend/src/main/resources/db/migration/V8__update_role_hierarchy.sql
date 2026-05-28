-- =====================================================
-- V8: Update RBAC Hierarchy - Add SUPER_ADMIN, SUPPORT, USER
-- =====================================================

-- Thêm các role mới
INSERT INTO roles (id, name, display_name, description, is_system) VALUES
    (uuid_generate_v4(), 'SUPER_ADMIN', 'Quản trị viên cấp cao', 'Quản lý toàn bộ hệ thống (Centralized)', true),
    (uuid_generate_v4(), 'SUPPORT', 'Hỗ trợ viên', 'Hỗ trợ khách hàng', true),
    (uuid_generate_v4(), 'USER', 'Người dùng', 'Khách hàng sử dụng dịch vụ', true);

-- SUPER_ADMIN: tất cả quyền (có quyền cao nhất trên mọi tài nguyên)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p WHERE r.name = 'SUPER_ADMIN';

-- SUPPORT: quyền đọc dịch vụ, hỗ trợ đặt lịch/sửa lịch, và xem danh sách user
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r
JOIN permissions p ON p.code IN (
    'SERVICE_READ',
    'APPOINTMENT_READ_ALL', 'APPOINTMENT_UPDATE_ALL',
    'USER_READ_ALL'
) WHERE r.name = 'SUPPORT';

-- USER: quyền giống hệt CUSTOMER (Người dùng cuối đặt lịch)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r
JOIN permissions p ON p.code IN (
    'SERVICE_READ',
    'APPOINTMENT_CREATE','APPOINTMENT_READ_OWN','APPOINTMENT_UPDATE_OWN',
    'INVOICE_READ_OWN'
) WHERE r.name = 'USER';

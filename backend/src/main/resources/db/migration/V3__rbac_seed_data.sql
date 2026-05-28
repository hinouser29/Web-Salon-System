-- =====================================================
-- V3: RBAC Seed Data — Roles, Permissions, Role-Permission mapping
-- =====================================================

-- ==================== ROLES ====================
INSERT INTO roles (id, name, display_name, description, is_system) VALUES
    (uuid_generate_v4(), 'ADMIN',        'Quản trị viên',   'Toàn quyền quản lý hệ thống',               true),
    (uuid_generate_v4(), 'MANAGER',      'Quản lý',         'Quản lý vận hành chi nhánh',                 true),
    (uuid_generate_v4(), 'STAFF',        'Nhân viên',       'Nhân viên tổng hợp',                         true),
    (uuid_generate_v4(), 'RECEPTIONIST', 'Lễ tân',          'Tiếp nhận và quản lý lịch hẹn',             true),
    (uuid_generate_v4(), 'TECHNICIAN',   'Kỹ thuật viên',   'Thực hiện dịch vụ kỹ thuật',                true),
    (uuid_generate_v4(), 'CUSTOMER',     'Khách hàng',      'Khách hàng sử dụng dịch vụ',                true);

-- ==================== PERMISSIONS ====================
INSERT INTO permissions (id, code, resource, action, description) VALUES
    -- SERVICE
    (uuid_generate_v4(), 'SERVICE_CREATE',           'SERVICE',      'CREATE',     'Tạo dịch vụ mới'),
    (uuid_generate_v4(), 'SERVICE_READ',             'SERVICE',      'READ_ALL',   'Xem tất cả dịch vụ'),
    (uuid_generate_v4(), 'SERVICE_UPDATE',           'SERVICE',      'UPDATE_ALL', 'Sửa bất kỳ dịch vụ'),
    (uuid_generate_v4(), 'SERVICE_DELETE',           'SERVICE',      'DELETE',     'Xóa dịch vụ'),
    -- APPOINTMENT
    (uuid_generate_v4(), 'APPOINTMENT_CREATE',       'APPOINTMENT',  'CREATE',     'Đặt lịch hẹn'),
    (uuid_generate_v4(), 'APPOINTMENT_READ_OWN',     'APPOINTMENT',  'READ_OWN',   'Xem lịch hẹn của chính mình'),
    (uuid_generate_v4(), 'APPOINTMENT_READ_ALL',     'APPOINTMENT',  'READ_ALL',   'Xem tất cả lịch hẹn'),
    (uuid_generate_v4(), 'APPOINTMENT_UPDATE_OWN',   'APPOINTMENT',  'UPDATE_OWN', 'Sửa lịch hẹn của chính mình'),
    (uuid_generate_v4(), 'APPOINTMENT_UPDATE_ALL',   'APPOINTMENT',  'UPDATE_ALL', 'Sửa bất kỳ lịch hẹn'),
    (uuid_generate_v4(), 'APPOINTMENT_DELETE',       'APPOINTMENT',  'DELETE',     'Hủy lịch hẹn'),
    -- USER
    (uuid_generate_v4(), 'USER_READ_ALL',            'USER',         'READ_ALL',   'Xem tất cả người dùng'),
    (uuid_generate_v4(), 'USER_MANAGE',              'USER',         'UPDATE_ALL', 'Quản lý thông tin người dùng'),
    -- INVOICE
    (uuid_generate_v4(), 'INVOICE_READ_OWN',         'INVOICE',      'READ_OWN',   'Xem hóa đơn của chính mình'),
    (uuid_generate_v4(), 'INVOICE_READ_ALL',         'INVOICE',      'READ_ALL',   'Xem tất cả hóa đơn'),
    (uuid_generate_v4(), 'INVOICE_CREATE',           'INVOICE',      'CREATE',     'Tạo hóa đơn'),
    -- EMPLOYEE
    (uuid_generate_v4(), 'EMPLOYEE_READ',            'EMPLOYEE',     'READ_ALL',   'Xem thông tin nhân viên'),
    (uuid_generate_v4(), 'EMPLOYEE_MANAGE',          'EMPLOYEE',     'UPDATE_ALL', 'Quản lý nhân viên'),
    -- ROLE
    (uuid_generate_v4(), 'ROLE_MANAGE',              'ROLE',         'UPDATE_ALL', 'Quản lý phân quyền');

-- ==================== ROLE-PERMISSION MAPPING ====================

-- ADMIN: tất cả quyền
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p WHERE r.name = 'ADMIN';

-- MANAGER
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r
JOIN permissions p ON p.code IN (
    'SERVICE_CREATE','SERVICE_READ','SERVICE_UPDATE','SERVICE_DELETE',
    'APPOINTMENT_CREATE','APPOINTMENT_READ_ALL','APPOINTMENT_UPDATE_ALL','APPOINTMENT_DELETE',
    'INVOICE_READ_ALL','INVOICE_CREATE',
    'EMPLOYEE_READ','EMPLOYEE_MANAGE',
    'USER_READ_ALL'
) WHERE r.name = 'MANAGER';

-- STAFF (Nhân viên tổng hợp)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r
JOIN permissions p ON p.code IN (
    'SERVICE_READ',
    'APPOINTMENT_CREATE','APPOINTMENT_READ_ALL','APPOINTMENT_UPDATE_ALL',
    'INVOICE_READ_ALL','INVOICE_CREATE',
    'EMPLOYEE_READ'
) WHERE r.name = 'STAFF';

-- RECEPTIONIST
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r
JOIN permissions p ON p.code IN (
    'SERVICE_READ',
    'APPOINTMENT_CREATE','APPOINTMENT_READ_ALL','APPOINTMENT_UPDATE_ALL',
    'INVOICE_READ_ALL','INVOICE_CREATE'
) WHERE r.name = 'RECEPTIONIST';

-- TECHNICIAN
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r
JOIN permissions p ON p.code IN (
    'SERVICE_READ',
    'APPOINTMENT_READ_ALL'
) WHERE r.name = 'TECHNICIAN';

-- CUSTOMER
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r
JOIN permissions p ON p.code IN (
    'SERVICE_READ',
    'APPOINTMENT_CREATE','APPOINTMENT_READ_OWN','APPOINTMENT_UPDATE_OWN',
    'INVOICE_READ_OWN'
) WHERE r.name = 'CUSTOMER';

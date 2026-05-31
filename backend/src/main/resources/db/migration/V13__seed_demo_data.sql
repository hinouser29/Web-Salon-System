-- =====================================================
-- V13: Demo seed data (Branches, Services, Employees)
-- Password: Test@123 → BCrypt hash
-- =====================================================

-- =====================================================
-- ADDITIONAL BRANCHES
-- =====================================================
INSERT INTO branches (id, name, address, phone, open_time, close_time) VALUES
    ('a0000000-0000-4000-8000-000000000002', 'Beauty Salon Quận 7', '456 Nguyễn Thị Thập, Quận 7, TP.HCM', '0907654321', '09:00', '21:00'),
    ('a0000000-0000-4000-8000-000000000003', 'Beauty Salon Đà Nẵng', '789 Trần Phú, Hải Châu, Đà Nẵng', '0912345678', '08:30', '20:30')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- ADDITIONAL SERVICE CATEGORIES
-- =====================================================
INSERT INTO service_categories (id, name, description) VALUES
    ('b0000000-0000-4000-8000-000000000004', 'Chăm sóc da', 'Dịch vụ chăm sóc da mặt và cơ thể'),
    ('b0000000-0000-4000-8000-000000000005', 'Waxing & Tẩy lông', 'Dịch vụ tẩy lông chuyên nghiệp'),
    ('b0000000-0000-4000-8000-000000000006', 'Nối mi & Lông mày', 'Dịch vụ nối mi và tạo dáng lông mày')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- ADDITIONAL SERVICES
-- =====================================================
INSERT INTO services (id, category_id, name, description, duration_minutes, price, image_url, is_active) VALUES
    ('c0000000-0000-4000-8000-000000000004', 'b0000000-0000-4000-8000-000000000004',
     'Chăm sóc da mặt cơ bản', 'Làm sạch, tẩy tế bào chết, đắp mặt nạ dưỡng ẩm', 60, 400000, NULL, true),
    ('c0000000-0000-4000-8000-000000000005', 'b0000000-0000-4000-8000-000000000004',
     'Trị mụn chuyên sâu', 'Liệu trình trị mụn và phục hồi da chuyên nghiệp', 90, 750000, NULL, true),
    ('c0000000-0000-4000-8000-000000000006', 'b0000000-0000-4000-8000-000000000005',
     'Waxing toàn thân', 'Tẩy lông sáp nóng toàn thân, da mịn màng', 120, 600000, NULL, true),
    ('c0000000-0000-4000-8000-000000000007', 'b0000000-0000-4000-8000-000000000006',
     'Nối mi classic', 'Nối mi sợi tự nhiên, giữ được 3-4 tuần', 90, 350000, NULL, true),
    ('c0000000-0000-4000-8000-000000000008', 'b0000000-0000-4000-8000-000000000001',
     'Massage đá nóng', 'Massage toàn thân bằng đá nóng basalt, giảm stress hiệu quả', 75, 650000, NULL, true),
    ('c0000000-0000-4000-8000-000000000009', 'b0000000-0000-4000-8000-000000000003',
     'Dưỡng tóc Keratin', 'Phục hồi tóc hư tổn bằng Keratin cao cấp', 120, 800000, NULL, true),
    ('c0000000-0000-4000-8000-000000000010', 'b0000000-0000-4000-8000-000000000002',
     'Sơn gel nghệ thuật', 'Sơn gel với thiết kế nghệ thuật theo yêu cầu', 60, 450000, NULL, true)
ON CONFLICT (id) DO NOTHING;

-- Link new services to branches
INSERT INTO branch_services (branch_id, service_id) VALUES
    ('a0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000004'),
    ('a0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000005'),
    ('a0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000006'),
    ('a0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000007'),
    ('a0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000008'),
    ('a0000000-0000-4000-8000-000000000002', 'c0000000-0000-4000-8000-000000000001'),
    ('a0000000-0000-4000-8000-000000000002', 'c0000000-0000-4000-8000-000000000002'),
    ('a0000000-0000-4000-8000-000000000002', 'c0000000-0000-4000-8000-000000000004'),
    ('a0000000-0000-4000-8000-000000000002', 'c0000000-0000-4000-8000-000000000008'),
    ('a0000000-0000-4000-8000-000000000002', 'c0000000-0000-4000-8000-000000000009'),
    ('a0000000-0000-4000-8000-000000000002', 'c0000000-0000-4000-8000-000000000010'),
    ('a0000000-0000-4000-8000-000000000003', 'c0000000-0000-4000-8000-000000000001'),
    ('a0000000-0000-4000-8000-000000000003', 'c0000000-0000-4000-8000-000000000003'),
    ('a0000000-0000-4000-8000-000000000003', 'c0000000-0000-4000-8000-000000000005'),
    ('a0000000-0000-4000-8000-000000000003', 'c0000000-0000-4000-8000-000000000006'),
    ('a0000000-0000-4000-8000-000000000003', 'c0000000-0000-4000-8000-000000000009')
ON CONFLICT (branch_id, service_id) DO NOTHING;

-- =====================================================
-- EMPLOYEE USERS & EMPLOYEE RECORDS
-- BCrypt hash for 'Test@123': $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
-- =====================================================
DO $$
DECLARE
    v_pwd TEXT := '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';
    v_role_tech UUID;
    v_role_recep UUID;
    v_role_mgr UUID;
    v_role_staff UUID;
    -- User IDs
    u1 UUID := 'e0000000-0000-4000-8000-000000000001';
    u2 UUID := 'e0000000-0000-4000-8000-000000000002';
    u3 UUID := 'e0000000-0000-4000-8000-000000000003';
    u4 UUID := 'e0000000-0000-4000-8000-000000000004';
    u5 UUID := 'e0000000-0000-4000-8000-000000000005';
    u6 UUID := 'e0000000-0000-4000-8000-000000000006';
    u7 UUID := 'e0000000-0000-4000-8000-000000000007';
    u8 UUID := 'e0000000-0000-4000-8000-000000000008';
    u9 UUID := 'e0000000-0000-4000-8000-000000000009';
    u10 UUID := 'e0000000-0000-4000-8000-000000000010';
BEGIN
    -- Look up role IDs
    SELECT id INTO v_role_tech FROM roles WHERE name = 'TECHNICIAN';
    SELECT id INTO v_role_recep FROM roles WHERE name = 'RECEPTIONIST';
    SELECT id INTO v_role_mgr FROM roles WHERE name = 'MANAGER';
    SELECT id INTO v_role_staff FROM roles WHERE name = 'STAFF';

    -- =====================================================
    -- TECHNICIANS (Kỹ thuật viên)
    -- =====================================================

    -- 1. Nguyễn Thị Lan — KTV Spa & Massage, Q1
    INSERT INTO users (id, email, password, full_name, phone, provider, is_verified, status)
    VALUES (u1, 'lan.nguyen@beautysalon.vn', v_pwd, 'Nguyễn Thị Lan', '0901000001', 'LOCAL', TRUE, 'ACTIVE')
    ON CONFLICT (id) DO NOTHING;
    INSERT INTO user_roles (user_id, role_id) VALUES (u1, v_role_tech) ON CONFLICT DO NOTHING;
    INSERT INTO employees (id, user_id, branch_id, position, specialization, salary, commission_rate, hire_date)
    VALUES (gen_random_uuid(), u1, 'a0000000-0000-4000-8000-000000000001', 'Kỹ thuật viên Spa', 'Massage, Chăm sóc da', 12000000, 10.00, '2021-03-15')
    ON CONFLICT DO NOTHING;

    -- 2. Trần Văn Minh — KTV Nail, Q7
    INSERT INTO users (id, email, password, full_name, phone, provider, is_verified, status)
    VALUES (u2, 'minh.tran@beautysalon.vn', v_pwd, 'Trần Văn Minh', '0901000002', 'LOCAL', TRUE, 'ACTIVE')
    ON CONFLICT (id) DO NOTHING;
    INSERT INTO user_roles (user_id, role_id) VALUES (u2, v_role_tech) ON CONFLICT DO NOTHING;
    INSERT INTO employees (id, user_id, branch_id, position, specialization, salary, commission_rate, hire_date)
    VALUES (gen_random_uuid(), u2, 'a0000000-0000-4000-8000-000000000002', 'Kỹ thuật viên Nail', 'Sơn gel, Nail nghệ thuật', 11000000, 12.00, '2022-06-01')
    ON CONFLICT DO NOTHING;

    -- 3. Phạm Thị Hoa — KTV Chăm sóc da, Q1
    INSERT INTO users (id, email, password, full_name, phone, provider, is_verified, status)
    VALUES (u3, 'hoa.pham@beautysalon.vn', v_pwd, 'Phạm Thị Hoa', '0901000003', 'LOCAL', TRUE, 'ACTIVE')
    ON CONFLICT (id) DO NOTHING;
    INSERT INTO user_roles (user_id, role_id) VALUES (u3, v_role_tech) ON CONFLICT DO NOTHING;
    INSERT INTO employees (id, user_id, branch_id, position, specialization, salary, commission_rate, hire_date)
    VALUES (gen_random_uuid(), u3, 'a0000000-0000-4000-8000-000000000001', 'Kỹ thuật viên Da liễu', 'Trị mụn, Chăm sóc da chuyên sâu', 13000000, 10.00, '2020-09-01')
    ON CONFLICT DO NOTHING;

    -- 4. Võ Minh Tuấn — KTV Tóc, Đà Nẵng
    INSERT INTO users (id, email, password, full_name, phone, provider, is_verified, status)
    VALUES (u4, 'tuan.vo@beautysalon.vn', v_pwd, 'Võ Minh Tuấn', '0901000004', 'LOCAL', TRUE, 'ACTIVE')
    ON CONFLICT (id) DO NOTHING;
    INSERT INTO user_roles (user_id, role_id) VALUES (u4, v_role_tech) ON CONFLICT DO NOTHING;
    INSERT INTO employees (id, user_id, branch_id, position, specialization, salary, commission_rate, hire_date)
    VALUES (gen_random_uuid(), u4, 'a0000000-0000-4000-8000-000000000003', 'Kỹ thuật viên Tóc', 'Cắt, uốn, nhuộm, Keratin', 11500000, 12.00, '2023-01-10')
    ON CONFLICT DO NOTHING;

    -- 5. Đỗ Thị Mai — KTV Nối mi, Q7
    INSERT INTO users (id, email, password, full_name, phone, provider, is_verified, status)
    VALUES (u5, 'mai.do@beautysalon.vn', v_pwd, 'Đỗ Thị Mai', '0901000005', 'LOCAL', TRUE, 'ACTIVE')
    ON CONFLICT (id) DO NOTHING;
    INSERT INTO user_roles (user_id, role_id) VALUES (u5, v_role_tech) ON CONFLICT DO NOTHING;
    INSERT INTO employees (id, user_id, branch_id, position, specialization, salary, commission_rate, hire_date)
    VALUES (gen_random_uuid(), u5, 'a0000000-0000-4000-8000-000000000002', 'Kỹ thuật viên Mi', 'Nối mi classic, volume, mega', 10500000, 15.00, '2023-06-20')
    ON CONFLICT DO NOTHING;

    -- 6. Huỳnh Thị Ngọc — KTV Waxing, Đà Nẵng
    INSERT INTO users (id, email, password, full_name, phone, provider, is_verified, status)
    VALUES (u6, 'ngoc.huynh@beautysalon.vn', v_pwd, 'Huỳnh Thị Ngọc', '0901000006', 'LOCAL', TRUE, 'ACTIVE')
    ON CONFLICT (id) DO NOTHING;
    INSERT INTO user_roles (user_id, role_id) VALUES (u6, v_role_tech) ON CONFLICT DO NOTHING;
    INSERT INTO employees (id, user_id, branch_id, position, specialization, salary, commission_rate, hire_date)
    VALUES (gen_random_uuid(), u6, 'a0000000-0000-4000-8000-000000000003', 'Kỹ thuật viên Waxing', 'Waxing, Tẩy lông laser', 10000000, 10.00, '2024-02-01')
    ON CONFLICT DO NOTHING;

    -- =====================================================
    -- RECEPTIONISTS (Lễ tân)
    -- =====================================================

    -- 7. Lê Thị Hồng — Lễ tân Q1
    INSERT INTO users (id, email, password, full_name, phone, provider, is_verified, status)
    VALUES (u7, 'hong.le@beautysalon.vn', v_pwd, 'Lê Thị Hồng', '0901000007', 'LOCAL', TRUE, 'ACTIVE')
    ON CONFLICT (id) DO NOTHING;
    INSERT INTO user_roles (user_id, role_id) VALUES (u7, v_role_recep) ON CONFLICT DO NOTHING;
    INSERT INTO employees (id, user_id, branch_id, position, specialization, salary, commission_rate, hire_date)
    VALUES (gen_random_uuid(), u7, 'a0000000-0000-4000-8000-000000000001', 'Lễ tân', 'Tư vấn khách hàng, Đặt lịch', 9000000, 0.00, '2022-01-15')
    ON CONFLICT DO NOTHING;

    -- 8. Bùi Văn Khoa — Lễ tân Q7
    INSERT INTO users (id, email, password, full_name, phone, provider, is_verified, status)
    VALUES (u8, 'khoa.bui@beautysalon.vn', v_pwd, 'Bùi Văn Khoa', '0901000008', 'LOCAL', TRUE, 'ACTIVE')
    ON CONFLICT (id) DO NOTHING;
    INSERT INTO user_roles (user_id, role_id) VALUES (u8, v_role_recep) ON CONFLICT DO NOTHING;
    INSERT INTO employees (id, user_id, branch_id, position, specialization, salary, commission_rate, hire_date)
    VALUES (gen_random_uuid(), u8, 'a0000000-0000-4000-8000-000000000002', 'Lễ tân', 'Tư vấn, Thu ngân', 9000000, 0.00, '2023-04-01')
    ON CONFLICT DO NOTHING;

    -- =====================================================
    -- MANAGERS (Quản lý)
    -- =====================================================

    -- 9. Phạm Đức Anh — Quản lý Đà Nẵng
    INSERT INTO users (id, email, password, full_name, phone, provider, is_verified, status)
    VALUES (u9, 'anh.pham@beautysalon.vn', v_pwd, 'Phạm Đức Anh', '0901000009', 'LOCAL', TRUE, 'ACTIVE')
    ON CONFLICT (id) DO NOTHING;
    INSERT INTO user_roles (user_id, role_id) VALUES (u9, v_role_mgr) ON CONFLICT DO NOTHING;
    INSERT INTO employees (id, user_id, branch_id, position, specialization, salary, commission_rate, hire_date)
    VALUES (gen_random_uuid(), u9, 'a0000000-0000-4000-8000-000000000003', 'Quản lý chi nhánh', 'Quản lý vận hành, Nhân sự', 18000000, 5.00, '2019-08-01')
    ON CONFLICT DO NOTHING;

    -- 10. Ngô Thị Thanh — Quản lý Q1
    INSERT INTO users (id, email, password, full_name, phone, provider, is_verified, status)
    VALUES (u10, 'thanh.ngo@beautysalon.vn', v_pwd, 'Ngô Thị Thanh', '0901000010', 'LOCAL', TRUE, 'ACTIVE')
    ON CONFLICT (id) DO NOTHING;
    INSERT INTO user_roles (user_id, role_id) VALUES (u10, v_role_mgr) ON CONFLICT DO NOTHING;
    INSERT INTO employees (id, user_id, branch_id, position, specialization, salary, commission_rate, hire_date)
    VALUES (gen_random_uuid(), u10, 'a0000000-0000-4000-8000-000000000001', 'Quản lý chi nhánh', 'Quản lý tài chính, Marketing', 18000000, 5.00, '2020-01-10')
    ON CONFLICT DO NOTHING;

END $$;

-- =====================================================
-- ADD INVOICE_PAY PERMISSION FOR RECEPTIONIST & MANAGER
-- =====================================================
INSERT INTO permissions (id, code, resource, action, description)
VALUES (gen_random_uuid(), 'INVOICE_PAY', 'INVOICE', 'PAY', 'Thanh toán hóa đơn cho khách hàng')
ON CONFLICT (code) DO NOTHING;

-- Grant INVOICE_PAY to RECEPTIONIST and MANAGER roles
DO $$
DECLARE
    v_perm_id UUID;
    v_role_id UUID;
BEGIN
    SELECT id INTO v_perm_id FROM permissions WHERE code = 'INVOICE_PAY';
    IF v_perm_id IS NOT NULL THEN
        FOR v_role_id IN (SELECT id FROM roles WHERE name IN ('RECEPTIONIST', 'MANAGER'))
        LOOP
            INSERT INTO role_permissions (id, role_id, permission_id)
            VALUES (gen_random_uuid(), v_role_id, v_perm_id)
            ON CONFLICT DO NOTHING;
        END LOOP;
    END IF;
END $$;

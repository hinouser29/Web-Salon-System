-- Demo catalog data for local/dev environments

INSERT INTO branches (id, name, address, phone, open_time, close_time)
VALUES (
    'a0000000-0000-4000-8000-000000000001',
    'Beauty Salon Quận 1',
    '123 Nguyễn Huệ, Quận 1, TP.HCM',
    '0901234567',
    '08:00',
    '21:00'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO service_categories (id, name, description) VALUES
    ('b0000000-0000-4000-8000-000000000001', 'Spa & Massage', 'Dịch vụ thư giãn'),
    ('b0000000-0000-4000-8000-000000000002', 'Nail', 'Làm móng'),
    ('b0000000-0000-4000-8000-000000000003', 'Hair', 'Tóc')
ON CONFLICT (id) DO NOTHING;

INSERT INTO services (id, category_id, name, description, duration_minutes, price, image_url, is_active) VALUES
    ('c0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001',
     'Massage thư giãn', 'Massage toàn thân 60 phút', 60, 500000, NULL, true),
    ('c0000000-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000002',
     'Nail cao cấp', 'Sơn gel + chăm sóc móng', 90, 300000, NULL, true),
    ('c0000000-0000-4000-8000-000000000003', 'b0000000-0000-4000-8000-000000000003',
     'Cắt tóc tạo kiểu', 'Tư vấn và cắt tóc nam/nữ', 45, 250000, NULL, true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO branch_services (branch_id, service_id) VALUES
    ('a0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000001'),
    ('a0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000002'),
    ('a0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000003')
ON CONFLICT (branch_id, service_id) DO NOTHING;

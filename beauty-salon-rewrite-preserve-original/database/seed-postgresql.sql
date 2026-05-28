INSERT INTO roles (role_id, role_name) VALUES
    (1, 'Admin'),
    (2, 'Customer'),
    (3, 'Receptionist'),
    (4, 'Technician'),
    (5, 'Manager')
ON CONFLICT (role_id) DO UPDATE SET role_name = EXCLUDED.role_name;

INSERT INTO users (user_id, full_name, email, phone, password_hash, role_id, status, is_verified, avatar_url) VALUES
    (1, 'System Admin', 'admin@gmail.com', '0900000001', '123456', 1, 'ACTIVE', true, null),
    (2, 'Nguyen Minh Anh', 'customer1@gmail.com', '0900000002', '123456', 2, 'ACTIVE', true, '/uploads/avatars/avatar-1-1779549913137.jpg'),
    (3, 'Tran Ha Linh', 'customer2@gmail.com', '0900000003', '123456', 2, 'ACTIVE', true, null),
    (4, 'Le Thu Le', 'reception@gmail.com', '0900000004', '123456', 3, 'ACTIVE', true, null),
    (5, 'Pham Hair Artist', 'hair@gmail.com', '0900000005', '123456', 4, 'ACTIVE', true, '/images/technicians/1.png'),
    (6, 'Do Nail Master', 'nail@gmail.com', '0900000006', '123456', 4, 'ACTIVE', true, '/images/technicians/2.png'),
    (7, 'Salon Manager', 'manager@gmail.com', '0900000007', '123456', 5, 'ACTIVE', true, null)
ON CONFLICT (user_id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    role_id = EXCLUDED.role_id,
    status = EXCLUDED.status,
    is_verified = EXCLUDED.is_verified,
    avatar_url = EXCLUDED.avatar_url;

INSERT INTO customers (customer_id, user_id, gender, date_of_birth, address, loyalty_points, membership_level) VALUES
    (1, 2, 'Female', '2000-02-10', 'Ho Chi Minh City', 120, 'Silver'),
    (2, 3, 'Female', '1998-08-22', 'Ha Noi', 40, 'Normal')
ON CONFLICT (customer_id) DO UPDATE SET
    user_id = EXCLUDED.user_id,
    gender = EXCLUDED.gender,
    date_of_birth = EXCLUDED.date_of_birth,
    address = EXCLUDED.address,
    loyalty_points = EXCLUDED.loyalty_points,
    membership_level = EXCLUDED.membership_level;

INSERT INTO employees (employee_id, user_id, position, specialization, salary, hire_date, image_url, status) VALUES
    (1, 5, 'Hair Stylist', 'Cat, tao kieu va nhuom toc', 12000000, '2024-01-10', '/images/technicians/1.png', 'ACTIVE'),
    (2, 6, 'Nail Technician', 'Nail gel va cham soc mong', 11000000, '2024-03-20', '/images/technicians/2.png', 'ACTIVE')
ON CONFLICT (employee_id) DO UPDATE SET
    user_id = EXCLUDED.user_id,
    position = EXCLUDED.position,
    specialization = EXCLUDED.specialization,
    salary = EXCLUDED.salary,
    hire_date = EXCLUDED.hire_date,
    image_url = EXCLUDED.image_url,
    status = EXCLUDED.status;

INSERT INTO service_categories (category_id, category_name, description) VALUES
    (1, 'Massage', 'Thu gian co the'),
    (2, 'Nail', 'Cham soc mong'),
    (3, 'Hair', 'Cat va tao kieu toc'),
    (4, 'Skincare', 'Cham soc da mat')
ON CONFLICT (category_id) DO UPDATE SET
    category_name = EXCLUDED.category_name,
    description = EXCLUDED.description;

INSERT INTO services (service_id, category_id, service_name, description, duration_minutes, price, image_url, status) VALUES
    (1, 1, 'Massage thu gian', 'Lieu trinh massage giup thu gian va phuc hoi nang luong.', 60, 350000, '/images/services/massage.png', 'AVAILABLE'),
    (2, 2, 'Nail cao cap', 'Son gel, ve mong va cham soc mong chuyen nghiep.', 45, 250000, '/images/services/nail.png', 'AVAILABLE'),
    (3, 3, 'Cat & Tao kieu toc', 'Tu van tao kieu phu hop khuon mat va phong cach.', 40, 180000, '/images/services/hair.png', 'AVAILABLE'),
    (4, 4, 'Cham soc da mat', 'Lam sach sau, massage va dap mat na duong da.', 70, 420000, '/images/services/skincare.png', 'AVAILABLE'),
    (5, 3, 'Nhuom toc thoi trang', 'Nhuom mau theo xu huong voi san pham bao ve toc.', 120, 850000, '/images/services/hair-color.png', 'AVAILABLE')
ON CONFLICT (service_id) DO UPDATE SET
    category_id = EXCLUDED.category_id,
    service_name = EXCLUDED.service_name,
    description = EXCLUDED.description,
    duration_minutes = EXCLUDED.duration_minutes,
    price = EXCLUDED.price,
    image_url = EXCLUDED.image_url,
    status = EXCLUDED.status;

SELECT setval(pg_get_serial_sequence('roles', 'role_id'), COALESCE((SELECT MAX(role_id) FROM roles), 1), true);
SELECT setval(pg_get_serial_sequence('users', 'user_id'), COALESCE((SELECT MAX(user_id) FROM users), 1), true);
SELECT setval(pg_get_serial_sequence('customers', 'customer_id'), COALESCE((SELECT MAX(customer_id) FROM customers), 1), true);
SELECT setval(pg_get_serial_sequence('employees', 'employee_id'), COALESCE((SELECT MAX(employee_id) FROM employees), 1), true);
SELECT setval(pg_get_serial_sequence('service_categories', 'category_id'), COALESCE((SELECT MAX(category_id) FROM service_categories), 1), true);
SELECT setval(pg_get_serial_sequence('services', 'service_id'), COALESCE((SELECT MAX(service_id) FROM services), 1), true);

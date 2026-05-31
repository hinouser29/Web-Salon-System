CREATE TABLE system_configs (
    config_key VARCHAR(100) PRIMARY KEY,
    config_value TEXT,
    description VARCHAR(255)
);

INSERT INTO system_configs (config_key, config_value, description) VALUES 
('spa_name', 'Glamour Spa', 'Tên thương hiệu Spa'),
('spa_phone', '0901234567', 'Số điện thoại liên hệ'),
('spa_email', 'contact@glamourspa.com', 'Email liên hệ'),
('loyalty_point_rate', '10000', 'Tỷ lệ quy đổi điểm thưởng (VND = 1 điểm)'),
('open_time', '08:00', 'Giờ mở cửa'),
('close_time', '20:00', 'Giờ đóng cửa');

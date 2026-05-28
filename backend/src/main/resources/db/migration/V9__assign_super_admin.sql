-- =====================================================
-- V9: Assign SUPER_ADMIN to an existing user
-- =====================================================

DO $$
DECLARE
    target_user_id UUID;
    super_admin_role_id UUID;
BEGIN
    -- Lấy ID của tài khoản hothangtung1401@gmail.com
    SELECT id INTO target_user_id FROM users WHERE email = 'hothangtung1401@gmail.com';

    -- Lấy ID của role SUPER_ADMIN
    SELECT id INTO super_admin_role_id FROM roles WHERE name = 'SUPER_ADMIN';

    IF target_user_id IS NOT NULL AND super_admin_role_id IS NOT NULL THEN
        -- Cập nhật trực tiếp trên bảng users: Active tài khoản và đổi role
        UPDATE users 
        SET role = 'SUPER_ADMIN', 
            status = 'ACTIVE', 
            is_verified = true 
        WHERE id = target_user_id;

        -- Xóa các role cũ của user này để tránh xung đột
        DELETE FROM user_roles WHERE user_id = target_user_id;

        -- Cấp quyền SUPER_ADMIN vào bảng liên kết user_roles
        INSERT INTO user_roles (user_id, role_id) 
        VALUES (target_user_id, super_admin_role_id);
    END IF;
END $$;

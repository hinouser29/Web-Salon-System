-- Thêm cột failed_attempts cho verification_tokens
ALTER TABLE verification_tokens
ADD COLUMN failed_attempts INT DEFAULT 0 NOT NULL;

-- Thêm cột failed_attempts cho password_reset_tokens
ALTER TABLE password_reset_tokens
ADD COLUMN failed_attempts INT DEFAULT 0 NOT NULL;

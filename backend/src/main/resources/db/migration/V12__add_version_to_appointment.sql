-- Add optimistic locking version column to appointments
ALTER TABLE appointments ADD COLUMN version INTEGER DEFAULT 0 NOT NULL;

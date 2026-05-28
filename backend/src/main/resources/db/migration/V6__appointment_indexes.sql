CREATE INDEX IF NOT EXISTS idx_appointments_branch_date
    ON appointments(branch_id, appointment_date, start_time);

CREATE INDEX IF NOT EXISTS idx_appointments_customer_date
    ON appointments(customer_id, appointment_date DESC);

CREATE INDEX IF NOT EXISTS idx_appointment_services_technician
    ON appointment_services(technician_id);

CREATE INDEX IF NOT EXISTS idx_invoices_customer_created
    ON invoices(customer_id, created_at DESC);

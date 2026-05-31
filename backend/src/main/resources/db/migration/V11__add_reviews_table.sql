-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID NOT NULL REFERENCES appointments(id),
    customer_id UUID NOT NULL REFERENCES customers(id),
    employee_id UUID REFERENCES employees(id),
    service_id UUID NOT NULL REFERENCES services(id),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    status VARCHAR(20) DEFAULT 'APPROVED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ensure a customer can only review an appointment once
CREATE UNIQUE INDEX uk_reviews_appointment ON reviews(appointment_id);

-- Index for querying reviews by service or employee
CREATE INDEX idx_reviews_service ON reviews(service_id);
CREATE INDEX idx_reviews_employee ON reviews(employee_id);

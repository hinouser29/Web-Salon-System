// ===== Appointment Status =====
export const STATUS_LABELS = {
  PENDING: 'Chờ xác nhận',
  CONFIRMED: 'Đã xác nhận',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã hủy',
  IN_PROGRESS: 'Đang phục vụ',
  NO_SHOW: 'Vắng mặt',
};

export const STATUS_COLORS = {
  PENDING: { bg: '#fff3cd', color: '#856404' },
  CONFIRMED: { bg: '#cce5ff', color: '#004085' },
  COMPLETED: { bg: '#d4edda', color: '#155724' },
  CANCELLED: { bg: '#f8d7da', color: '#721c24' },
  IN_PROGRESS: { bg: '#d1ecf1', color: '#0c5460' },
  NO_SHOW: { bg: '#e2e3e5', color: '#383d41' },
};

// ===== Payment Status =====
export const PAYMENT_STATUS = {
  PENDING: { label: 'Chờ thanh toán', bg: '#fff4e5', color: '#ed6c02' },
  PAID: { label: 'Đã thanh toán', bg: '#edf7ed', color: '#2e7d32' },
  FAILED: { label: 'Thất bại', bg: '#fdeded', color: '#d32f2f' },
  REFUNDED: { label: 'Đã hoàn tiền', bg: '#e3f2fd', color: '#0288d1' },
};

// ===== Payment Methods =====
export const PAYMENT_METHODS = [
  { code: 'VNPAY', label: 'VNPay', description: 'Thanh toán qua ví VNPAY hoặc thẻ ATM', color: '#005baa', icon: 'VN' },
  { code: 'MOMO', label: 'MoMo', description: 'Thanh toán qua ví điện tử MoMo', color: '#a50064', icon: 'phone' },
  { code: 'CASH', label: 'Tiền mặt tại quầy', description: 'Thanh toán trực tiếp sau khi hoàn thành dịch vụ', color: '#4caf50', icon: 'wallet' },
];

// ===== Role Labels =====
export const ROLE_LABELS = {
  SUPER_ADMIN: 'Quản trị cấp cao',
  ADMIN: 'Quản trị viên',
  MANAGER: 'Quản lý',
  RECEPTIONIST: 'Lễ tân',
  STAFF: 'Nhân viên',
  TECHNICIAN: 'Kỹ thuật viên',
  SUPPORT: 'Hỗ trợ',
  CUSTOMER: 'Khách hàng',
  USER: 'Người dùng',
};

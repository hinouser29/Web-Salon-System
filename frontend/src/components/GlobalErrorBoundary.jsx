import React from 'react';

class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("GlobalErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#fef6f8',
          color: '#333',
          fontFamily: 'system-ui, sans-serif'
        }}>
          <h1 style={{ color: '#ef4f83', marginBottom: 16 }}>Ôi hỏng! Có lỗi xảy ra.</h1>
          <p style={{ marginBottom: 24 }}>Ứng dụng gặp sự cố không mong muốn. Vui lòng thử lại.</p>
          <button 
            onClick={() => window.location.href = '/'}
            style={{
              padding: '12px 24px',
              backgroundColor: '#ef4f83',
              color: 'white',
              border: 'none',
              borderRadius: '24px',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            Quay về trang chủ
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default GlobalErrorBoundary;

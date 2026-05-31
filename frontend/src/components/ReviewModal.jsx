import { useState } from 'react';
import { X } from 'lucide-react';
import StarRating from './StarRating';
import axiosClient from '../api/axiosClient';

export default function ReviewModal({ appointmentId, isOpen, onClose, onSuccess }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      setError('Vui long chon so sao danh gia.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await axiosClient.post('/reviews', {
        appointmentId,
        rating,
        comment
      });
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Co loi xay ra khi gui danh gia.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999
    }}>
      <div style={{
        background: '#fff',
        width: 400,
        maxWidth: '90%',
        borderRadius: 12,
        padding: 24,
        position: 'relative'
      }}>
        <button 
          onClick={onClose}
          style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <X size={20} color="#666" />
        </button>

        <h3 style={{ margin: '0 0 16px' }}>Danh gia dich vu</h3>
        
        {error && <div style={{ color: 'red', marginBottom: 16, fontSize: 14 }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 20, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <p style={{ margin: '0 0 12px', fontWeight: 500 }}>Chất lượng dịch vụ như thế nào?</p>
            <StarRating rating={rating} onRatingChange={setRating} size={32} />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500 }}>Nhan xet cua ban (Tuy chon)</label>
            <textarea 
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Chia se trai nghiem cua ban..."
              style={{
                width: '100%',
                padding: 12,
                borderRadius: 8,
                border: '1px solid var(--border)',
                minHeight: 100,
                resize: 'vertical',
                fontFamily: 'inherit'
              }}
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%' }}
            disabled={submitting}
          >
            {submitting ? 'Dang gui...' : 'Gui danh gia'}
          </button>
        </form>
      </div>
    </div>
  );
}

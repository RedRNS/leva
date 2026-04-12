import { useEffect, useState } from 'react';

export default function Toast({ toast, onClose }) {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    setIsClosing(false);

    const dismissTimer = setTimeout(() => {
      setIsClosing(true);
      setTimeout(onClose, 180);
    }, 3000);

    return () => clearTimeout(dismissTimer);
  }, [toast?.id, onClose]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key !== 'Escape') return;

      setIsClosing(true);
      setTimeout(onClose, 180);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleManualClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 180);
  };

  if (!toast) return null;

  return (
    <div className={`toast toast-${toast.type || 'info'} ${isClosing ? 'closing' : ''}`} role="status" aria-live="polite">
      <span style={{ flex: 1 }}>{toast.message}</span>
      <button className="toast-close" onClick={handleManualClose} aria-label="Tutup notifikasi">
        x
      </button>
    </div>
  );
}

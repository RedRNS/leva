export default function Modal({ title, onClose, children }) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{ width: 460, maxWidth: '90vw', padding: 28, position: 'relative' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--color-text-primary)' }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'var(--color-bg)', border: 'none', borderRadius: 8,
              padding: '6px 10px', cursor: 'pointer', fontSize: 16,
              color: 'var(--color-text-secondary)',
            }}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        {children}
      </div>
    </div>
  );
}

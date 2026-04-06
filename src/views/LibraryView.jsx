import { useState } from 'react';
import { useApp } from '../context/AppContext';
import Modal from '../components/Modal';
import AppIcon from '../components/AppIcon';

const PRIORITY_FILTERS = ['Semua', 'Prioritas Tinggi', 'Sangat Bagus', 'Coba Nanti'];
const CATEGORY_FILTERS = ['Semua', 'Research', 'Writing', 'Coding', 'Data', 'Academic', 'Productivity'];

// Badge component for priority
function PriorityBadge({ priorityKey, label }) {
  const styles = {
    high:  { background: '#FEE2E2', color: '#DC2626' },
    good:  { background: '#D1FAE5', color: '#059669' },
    later: { background: '#DBEAFE', color: '#2563EB' },
  };
  const s = styles[priorityKey] || styles.later;
  return (
    <span style={{ ...s, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999, whiteSpace: 'nowrap' }}>
      {label}
    </span>
  );
}

// Saved Tool Card
function SavedToolCard({ tool, onDelete }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="card"
      style={{ padding: '18px 20px', transition: 'transform 0.2s, box-shadow 0.2s' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)'; }}
    >
      {/* Top row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div>
          <h3 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 700 }}>{tool.name}</h3>
          <p style={{ margin: 0, fontSize: 12, color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <AppIcon name="link" size={12} /> {tool.url}
          </p>
        </div>
        <PriorityBadge priorityKey={tool.priorityKey} label={tool.priority} />
      </div>

      {/* Category + date */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 10, alignItems: 'center' }}>
        <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 6, background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
          {tool.category}
        </span>
        <span style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
          Disimpan {tool.savedAt}
        </span>
      </div>

      {/* Note */}
      {tool.note && (
        <p style={{ margin: '0 0 10px', fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
          {tool.note}
        </p>
      )}

      {/* Keywords */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
        {tool.keywords.map(kw => (
          <span
            key={kw}
            style={{ fontSize: 11, padding: '2px 8px', background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 6, color: 'var(--color-text-secondary)' }}
          >
            #{kw}
          </span>
        ))}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8 }}>
        <a
          href={`https://${tool.url}`} target="_blank" rel="noreferrer"
          style={{
            flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--color-primary)', color: '#fff',
            borderRadius: 9, padding: '8px', fontSize: 13, fontWeight: 600,
            textDecoration: 'none', transition: 'background 0.2s',
          }}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            Buka Tool <AppIcon name="external-link" size={14} color="#fff" />
          </span>
        </a>
        <button
          onClick={() => onDelete(tool.id)}
          style={{
            flex: 1, padding: '8px', borderRadius: 9, border: '1px solid #FEE2E2',
            background: '#FFF5F5', color: '#DC2626', cursor: 'pointer',
            fontSize: 13, fontWeight: 500, transition: 'all 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#FEE2E2'}
          onMouseLeave={e => e.currentTarget.style.background = '#FFF5F5'}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <AppIcon name="trash" size={14} /> Hapus
          </span>
        </button>
      </div>
    </div>
  );
}

// Main Library View
export default function LibraryView() {
  const { savedTools, setSavedTools, setActiveView } = useApp();
  const [priorityFilter, setPriorityFilter] = useState('Semua');
  const [categoryFilter, setCategoryFilter] = useState('Semua');
  const [searchVal, setSearchVal] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTool, setNewTool] = useState({ name: '', url: '', note: '', category: 'Research' });

  const filtered = savedTools.filter(t => {
    const matchPriority = priorityFilter === 'Semua' || t.priority === priorityFilter;
    const matchCategory = categoryFilter === 'Semua' || t.category === categoryFilter;
    const matchSearch = !searchVal || t.name.toLowerCase().includes(searchVal.toLowerCase())
      || t.keywords.some(k => k.includes(searchVal.toLowerCase()));
    return matchPriority && matchCategory && matchSearch;
  });

  const handleDelete = (id) => {
    setSavedTools(prev => prev.filter(t => t.id !== id));
  };

  const handleAddTool = () => {
    if (!newTool.name.trim() || !newTool.url.trim()) return;
    const entry = {
      id: Date.now(),
      name: newTool.name,
      url: newTool.url.replace(/^https?:\/\//, ''),
      priority: 'Sangat Bagus',
      priorityKey: 'good',
      category: newTool.category,
      keywords: [newTool.category.toLowerCase(), 'ai tools', 'manual'],
      savedAt: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
      note: newTool.note,
    };
    setSavedTools(prev => [entry, ...prev]);
    setNewTool({ name: '', url: '', note: '', category: 'Research' });
    setShowAddModal(false);
  };

  const inputStyle = {
    width: '100%', padding: '10px 12px',
    border: '1px solid var(--color-border)',
    borderRadius: 9, fontSize: 13, outline: 'none',
    boxSizing: 'border-box', marginBottom: 12,
  };

  return (
    <div className="main-content view-enter" style={{ padding: '32px 36px', maxWidth: 1100, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
            <AppIcon name="library" size={22} /> Library Tools Saya
          </h1>
          <p style={{ margin: '6px 0 0', fontSize: 14, color: 'var(--color-text-secondary)' }}>
            Koleksi alat AI yang sudah kamu simpan, dilengkapi label prioritas otomatis.
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowAddModal(true)} style={{ whiteSpace: 'nowrap' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <AppIcon name="plus" size={14} color="#fff" /> Tambah Manual
          </span>
        </button>
      </div>

      {/* Stats row */}
      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Total Tools', val: savedTools.length, icon: 'folder' },
          { label: 'Prioritas Tinggi', val: savedTools.filter(t => t.priorityKey === 'high').length, icon: 'flame' },
          { label: 'Sangat Bagus', val: savedTools.filter(t => t.priorityKey === 'good').length, icon: 'check' },
        ].map(stat => (
          <div key={stat.label} className="card" style={{ flex: 1, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ display: 'flex' }}><AppIcon name={stat.icon} size={22} /></span>
            <div>
              <p style={{ margin: 0, fontSize: 22, fontWeight: 800, color: 'var(--color-primary)' }}>{stat.val}</p>
              <p style={{ margin: 0, fontSize: 12, color: 'var(--color-text-secondary)' }}>{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 24 }}>

        {/* Filter Sidebar */}
        <div style={{ width: 200, flexShrink: 0 }}>
          {/* Search */}
          <input
            value={searchVal}
            onChange={e => setSearchVal(e.target.value)}
            placeholder="Cari keyword..."
            style={{ ...inputStyle, marginBottom: 20 }}
            onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
            onBlur={e => e.target.style.borderColor = 'var(--color-border)'}
          />

          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-secondary)', letterSpacing: '0.07em', marginBottom: 8 }}>PRIORITAS</p>
          {PRIORITY_FILTERS.map(f => (
            <div
              key={f}
              onClick={() => setPriorityFilter(f)}
              style={{
                padding: '7px 10px', borderRadius: 8, cursor: 'pointer', fontSize: 13,
                background: priorityFilter === f ? 'var(--color-primary-light)' : 'transparent',
                color: priorityFilter === f ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                fontWeight: priorityFilter === f ? 600 : 400,
                marginBottom: 2, transition: 'all 0.15s',
              }}
            >
              {f}
            </div>
          ))}

          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-secondary)', letterSpacing: '0.07em', margin: '20px 0 8px' }}>KATEGORI</p>
          {CATEGORY_FILTERS.map(f => (
            <div
              key={f}
              onClick={() => setCategoryFilter(f)}
              style={{
                padding: '7px 10px', borderRadius: 8, cursor: 'pointer', fontSize: 13,
                background: categoryFilter === f ? 'var(--color-primary-light)' : 'transparent',
                color: categoryFilter === f ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                fontWeight: categoryFilter === f ? 600 : 400,
                marginBottom: 2, transition: 'all 0.15s',
              }}
            >
              {f}
            </div>
          ))}
        </div>

        {/* Tool Cards Grid */}
        <div style={{ flex: 1 }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <span style={{ display: 'inline-flex' }}><AppIcon name="library" size={44} /></span>
              <h3 style={{ margin: '16px 0 8px' }}>Belum ada tools tersimpan</h3>
              <p style={{ color: 'var(--color-text-secondary)', marginBottom: 20 }}>
                Jelajahi Dashboard dan simpan tools favoritmu!
              </p>
              <button className="btn-primary" onClick={() => setActiveView('dashboard')}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <AppIcon name="arrow-right" size={14} color="#fff" /> Ke Dashboard
                </span>
              </button>
            </div>
          ) : (
            <>
              <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 14 }}>
                Menampilkan <strong>{filtered.length}</strong> dari {savedTools.length} tools
              </p>
              <div className="library-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                {filtered.map(tool => (
                  <SavedToolCard key={tool.id} tool={tool} onDelete={handleDelete} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Add Tool Modal */}
      {showAddModal && (
        <Modal title="Tambah Tool Baru" onClose={() => setShowAddModal(false)}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Nama Tool *</label>
            <input value={newTool.name} onChange={e => setNewTool(p => ({ ...p, name: e.target.value }))} placeholder="Contoh: Perplexity AI" style={inputStyle} />
            <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>URL Tool *</label>
            <input value={newTool.url} onChange={e => setNewTool(p => ({ ...p, url: e.target.value }))} placeholder="https://perplexity.ai" style={inputStyle} />
            <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Kategori</label>
            <select value={newTool.category} onChange={e => setNewTool(p => ({ ...p, category: e.target.value }))} style={{ ...inputStyle }}>
              {CATEGORY_FILTERS.filter(f => f !== 'Semua').map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Catatan (opsional)</label>
            <textarea value={newTool.note} onChange={e => setNewTool(p => ({ ...p, note: e.target.value }))} placeholder="Untuk apa tool ini?" rows={3} style={{ ...inputStyle, resize: 'none' }} />
            <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', margin: '0 0 16px' }}>
              Leva akan otomatis menganalisis dan memberikan label prioritas serta keywords.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn-ghost" onClick={() => setShowAddModal(false)} style={{ flex: 1 }}>Batal</button>
              <button className="btn-primary" onClick={handleAddTool} style={{ flex: 2 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <AppIcon name="plus" size={14} color="#fff" /> Tambah & Generate Label
                </span>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

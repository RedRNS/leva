import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { mockTools } from '../data/mockData';

// --- Category tag color helper
const tagClass = (cat) => {
  const map = {
    Research: 'tag tag-research', Writing: 'tag tag-writing',
    Coding: 'tag tag-coding', Data: 'tag tag-data',
    Academic: 'tag tag-academic', Productivity: 'tag tag-productivity',
  };
  return map[cat] || 'tag tag-research';
};

// --- Star rating display
function StarRating({ rating }) {
  return (
    <span style={{ fontSize: 12, color: '#F59E0B', fontWeight: 600 }}>
      {'★'.repeat(Math.floor(rating))}{'☆'.repeat(5 - Math.floor(rating))}
      <span style={{ color: 'var(--color-text-secondary)', fontWeight: 400, marginLeft: 4 }}>{rating}</span>
    </span>
  );
}

// --- Featured Tool Card (large, horizontal scroll)
function FeaturedToolCard({ tool, onSave, onNavigateChat }) {
  const [saved, setSaved] = useState(false);
  const handleSave = () => { onSave(tool); setSaved(true); };

  return (
    <div
      className="card"
      style={{
        minWidth: 260, width: 260, padding: 22, flexShrink: 0,
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        cursor: 'default',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(108,99,255,0.15)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)';
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <span className={tagClass(tool.category)}>{tool.category}</span>
        <span style={{ fontSize: 28 }}>{tool.emoji}</span>
      </div>
      <h3 style={{ margin: '0 0 6px', fontSize: 17, fontWeight: 700 }}>{tool.name}</h3>
      <p style={{ margin: '0 0 10px', fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.55 }}>
        {tool.desc}
      </p>
      <StarRating rating={tool.rating} />

      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        <button
          className="btn-secondary"
          onClick={handleSave}
          style={{ flex: 1, padding: '8px', fontSize: 12 }}
        >
          {saved ? '✅ Tersimpan' : '🔖 Simpan'}
        </button>
        <a
          href={`https://${tool.url}`} target="_blank" rel="noreferrer"
          style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--color-primary)', color: '#fff',
            borderRadius: 10, fontSize: 12, fontWeight: 600, textDecoration: 'none',
            padding: '8px', transition: 'background 0.2s',
          }}
        >
          Buka ↗
        </a>
      </div>
    </div>
  );
}

// --- Small Tool Card (grid)
function SmallToolCard({ tool, onSave }) {
  const [saved, setSaved] = useState(false);
  const handleSave = () => { onSave(tool); setSaved(true); };

  return (
    <div
      className="card"
      style={{
        padding: 16, transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.1)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)';
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 22 }}>{tool.emoji}</span>
          <span style={{ fontWeight: 700, fontSize: 14 }}>{tool.name}</span>
        </div>
        <button
          onClick={handleSave}
          title="Simpan ke Library"
          style={{
            background: saved ? 'var(--color-secondary-light)' : 'var(--color-bg)',
            border: '1px solid var(--color-border)',
            borderRadius: 8, padding: '4px 8px', cursor: 'pointer', fontSize: 14,
          }}
        >
          {saved ? '✅' : '🔖'}
        </button>
      </div>
      <p style={{ margin: '0 0 10px', fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
        {tool.desc}
      </p>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className={tagClass(tool.category)}>{tool.category}</span>
        <StarRating rating={tool.rating} />
      </div>
    </div>
  );
}

// --- Main Dashboard View
export default function DashboardView() {
  const { user, saveToolToLibrary, setActiveView } = useApp();
  const [activeFilter, setActiveFilter] = useState('Semua');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 600);
    return () => clearTimeout(timer);
  }, []);

  const firstName = user ? user.name.split(' ')[0] : 'Renisa';
  const jurusan   = user ? user.jurusan : 'Teknik Informatika';

  const hour = new Date().getHours();
  const greeting = hour < 11 ? 'Selamat pagi' : hour < 15 ? 'Selamat siang' : hour < 18 ? 'Selamat sore' : 'Selamat malam';
  const greetEmoji = hour < 11 ? '☀️' : hour < 15 ? '🌤️' : hour < 18 ? '🌅' : '🌙';

  const today = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const FILTERS = ['Semua', 'Research', 'Writing', 'Coding', 'Data', 'Academic', 'Productivity'];

  const featuredTools = mockTools.slice(0, 4);
  const filteredTools = activeFilter === 'Semua'
    ? mockTools
    : mockTools.filter(t => t.category === activeFilter);

  if (!mounted) return (
    <div className="main-content view-enter" style={{ padding: '32px 36px' }}>
      {[200, 300, 100].map((w, i) => (
        <div key={i} style={{ height: 20, width: w, background: 'var(--color-border)', borderRadius: 8, marginBottom: 10, animation: 'pulse 1.5s infinite' }} />
      ))}
      <div style={{ display: 'flex', gap: 16, marginTop: 24 }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{ width: 260, height: 200, background: 'var(--color-border)', borderRadius: 16, animation: 'pulse 1.5s infinite' }} />
        ))}
      </div>
    </div>
  );

  return (
    <div className="main-content view-enter" style={{ padding: '32px 36px', maxWidth: 1100, margin: '0 auto' }}>

      {/* -- Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>
            {greeting}, {firstName}! {greetEmoji}
          </h1>
          <p style={{ margin: '6px 0 0', fontSize: 14, color: 'var(--color-text-secondary)' }}>
            Ini rekomendasi tools AI hari ini yang relevan untuk <strong>{jurusan}</strong> kamu.
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-secondary)' }}>{today}</p>
          <span style={{
            display: 'inline-block', marginTop: 4, fontSize: 11, fontWeight: 600,
            background: 'var(--color-secondary-light)', color: 'var(--color-secondary)',
            padding: '3px 10px', borderRadius: 999,
          }}>
            🔄 Diperbarui otomatis setiap hari
          </span>
        </div>
      </div>

      {/* -- Featured Tools (horizontal scroll) */}
      <section style={{ marginBottom: 36 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <span style={{ fontSize: 18 }}>🔥</span>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Tools Pilihan Hari Ini</h2>
          <span style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginLeft: 4 }}>
            - dipilihkan khusus untuk {jurusan}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 8 }}>
          {featuredTools.map(tool => (
            <FeaturedToolCard
              key={tool.id}
              tool={tool}
              onSave={saveToolToLibrary}
              onNavigateChat={() => setActiveView('chat')}
            />
          ))}
        </div>
      </section>

      {/* -- Filter Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            style={{
              padding: '6px 16px', borderRadius: 999, fontSize: 13, fontWeight: 500,
              cursor: 'pointer', border: 'none', transition: 'all 0.2s',
              background: activeFilter === f ? 'var(--color-primary)' : 'var(--color-surface)',
              color: activeFilter === f ? '#fff' : 'var(--color-text-secondary)',
              boxShadow: activeFilter === f ? '0 2px 8px rgba(108,99,255,0.3)' : '0 1px 4px rgba(0,0,0,0.07)',
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* -- All Tools Grid */}
      <section style={{ marginBottom: 36 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <span style={{ fontSize: 18 }}>📰</span>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Semua Tools Hari Ini</h2>
          <span style={{
            fontSize: 12, fontWeight: 600, background: 'var(--color-primary-light)',
            color: 'var(--color-primary)', padding: '2px 8px', borderRadius: 999,
          }}>
            {filteredTools.length} tools
          </span>
        </div>
        <div className="tool-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {filteredTools.map(tool => (
            <SmallToolCard key={tool.id} tool={tool} onSave={saveToolToLibrary} />
          ))}
        </div>
        {filteredTools.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--color-text-secondary)' }}>
            <span style={{ fontSize: 40 }}>🔍</span>
            <p>Tidak ada tool untuk kategori ini.</p>
          </div>
        )}
      </section>

      {/* -- Productivity Tip Banner */}
      <div style={{
        background: 'var(--color-primary-light)',
        border: '1px solid rgba(108,99,255,0.2)',
        borderRadius: 16, padding: '20px 24px',
        display: 'flex', alignItems: 'center', gap: 16,
      }}>
        <span style={{ fontSize: 32, flexShrink: 0 }}>💡</span>
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>Tips Produktivitas Hari Ini</p>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
            Coba ceritakan tugasmu ke Leva: <em>"Bantu aku buat literature review topik X untuk jurusan {jurusan}"</em> dan Leva akan otomatis memecahnya jadi langkah-langkah kecil plus merekomendasikan tools terbaik!
          </p>
        </div>
        <button
          className="btn-primary"
          onClick={() => setActiveView('chat')}
          style={{ flexShrink: 0, whiteSpace: 'nowrap', padding: '10px 18px', fontSize: 13 }}
        >
          Coba Sekarang →
        </button>
      </div>
    </div>
  );
}

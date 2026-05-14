import { useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { mockTools } from '../data/mockData';
import AppIcon from '../components/AppIcon';

// --- Category tag color helper
const tagClass = (cat) => {
  const map = {
    Research: 'tag tag-research', Writing: 'tag tag-writing',
    Coding: 'tag tag-coding', Data: 'tag tag-data',
    Academic: 'tag tag-academic', Productivity: 'tag tag-productivity',
  };
  return map[cat] || 'tag tag-research';
};

const pricingMeta = (pricingType) => {
  const map = {
    free: { label: 'Gratis', bg: '#065F46', color: '#FFFFFF', icon: 'check' },
    freemium: { label: 'Freemium', bg: '#6C47FF', color: '#FFFFFF', icon: 'sparkles' },
    paid: { label: 'Berbayar', bg: '#991B1B', color: '#FFFFFF', icon: 'warning' },
    opensource: { label: 'Open Source', bg: '#1E40AF', color: '#FFFFFF', icon: 'link' },
  };

  return map[pricingType] || map.free;
};

function PricingBadge({ pricingType }) {
  const price = pricingMeta(pricingType);
  const tooltipByType = {
    free: 'Sepenuhnya gratis untuk digunakan',
    freemium: 'Fitur dasar gratis, fitur premium berbayar',
    paid: 'Memerlukan langganan berbayar untuk akses penuh',
    opensource: 'Kode sumber terbuka dan bebas digunakan',
  };
  const tooltipText = tooltipByType[pricingType] || '';

  return (
    <span className={tooltipText ? 'tooltip-host' : undefined} data-tooltip={tooltipText || undefined} style={{ display: 'inline-flex' }}>
      <span
        style={{
          fontSize: 12,
          fontWeight: 700,
          padding: '0 10px',
          height: 24,
          borderRadius: 12,
          background: price.bg,
          color: price.color,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <span aria-hidden="true" style={{ display: 'flex' }}><AppIcon name={price.icon} size={16} color={price.color} /></span>
        {price.label}
      </span>
    </span>
  );
}

function ToolTooltip({ tool, show }) {
  const price = pricingMeta(tool.pricingType);
  const detailText = tool.detailDesc || tool.desc;

  return (
    <div className={`tool-tooltip ${show ? 'visible' : ''}`}>
      {/* UI/UX Fix: Step 7 — Tooltip/balloon tip sebagai presentation control untuk info harga. Survei: 33,9% user terbentur paywall; Persona Bima butuh filter harga instan. */}
      <p className="tool-tooltip-title">{tool.name}</p>
      <p className="tool-tooltip-line">Status: <strong style={{ color: price.color }}>{price.label}</strong></p>
      <p className="tool-tooltip-line">Website: {tool.url}</p>
      <p className="tool-tooltip-desc">{detailText}</p>
      <span className="tool-tooltip-arrow" />
    </div>
  );
}

// --- Star rating display
function StarRating({ rating }) {
  return (
    <span style={{ fontSize: 14, color: '#F59E0B', fontWeight: 600 }}>
      {'★'.repeat(Math.floor(rating))}{'☆'.repeat(5 - Math.floor(rating))}
      <span style={{ color: 'var(--color-text-secondary)', fontWeight: 400, marginLeft: 6 }}>{rating}</span>
    </span>
  );
}

// --- Featured Tool Card (large, horizontal scroll)
function FeaturedToolCard({ tool, onSave, isSaved }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipTimerRef = useRef(null);
  const handleSave = () => {
    if (isSaved) return;
    onSave(tool);
  };

  useEffect(() => () => {
    if (tooltipTimerRef.current) clearTimeout(tooltipTimerRef.current);
  }, []);

  useEffect(() => {
    const handleEscape = () => setShowTooltip(false);
    window.addEventListener('leva:escape', handleEscape);

    return () => window.removeEventListener('leva:escape', handleEscape);
  }, []);

  const handleMouseEnter = (event) => {
    event.currentTarget.style.transform = 'translateY(-4px)';
    event.currentTarget.style.boxShadow = '0 8px 24px rgba(108,99,255,0.15)';

    if (tooltipTimerRef.current) clearTimeout(tooltipTimerRef.current);
    tooltipTimerRef.current = setTimeout(() => setShowTooltip(true), 300);
  };

  const handleMouseLeave = (event) => {
    event.currentTarget.style.transform = 'translateY(0)';
    event.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)';

    if (tooltipTimerRef.current) clearTimeout(tooltipTimerRef.current);
    setShowTooltip(false);
  };

  return (
    <div
      className="card"
      style={{
        width: '100%', minWidth: 0, padding: 24,
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        cursor: 'default',
        position: 'relative',
        overflow: 'visible',
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <ToolTooltip tool={tool} show={showTooltip} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <span className={tagClass(tool.category)}>{tool.category}</span>
        <PricingBadge pricingType={tool.pricingType} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, gap: 12 }}>
        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--color-text-primary)' }}>{tool.name}</h3>
        <span style={{ display: 'flex', flexShrink: 0 }}><AppIcon name={tool.iconKey} size={24} /></span>
      </div>

      <p
        style={{
          margin: '0 0 8px',
          fontSize: 14,
          color: 'var(--color-text-secondary)',
          lineHeight: 1.6,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {tool.desc}
      </p>
      <div style={{ marginBottom: 16 }}>
        <StarRating rating={tool.rating} />
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button
          disabled={isSaved}
          onClick={handleSave}
          className="btn-secondary"
          style={{
            flex: 1,
            height: 44,
            borderRadius: 8,
            color: isSaved ? '#6B7280' : 'var(--color-primary)',
            borderColor: isSaved ? '#E5E7EB' : 'var(--color-primary)',
            background: '#fff',
            cursor: isSaved ? 'not-allowed' : 'pointer',
          }}
        >
          {/* UI/UX Fix: Step 6 — Output device harus memberi respond jelas ke aksi user. Step 7 — Aksi destruktif (hapus) harus ada safeguard/konfirmasi. Survei: 52,5% user sulit temukan referensi. */}
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <AppIcon name="bookmark" size={16} color="var(--color-primary)" filled={isSaved} aria-hidden="true" />
            {isSaved ? 'Tersimpan ✓' : 'Simpan'}
          </span>
        </button>
        <a
          href={`https://${tool.url}`} target="_blank" rel="noreferrer"
          className="btn-primary"
          style={{
            flex: 1,
            height: 44,
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textDecoration: 'none',
          }}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            Buka ↗ <AppIcon name="external-link" size={14} color="#fff" />
          </span>
        </a>
      </div>
    </div>
  );
}

// --- Small Tool Card (grid)
function SmallToolCard({ tool, onSave, isSaved }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipTimerRef = useRef(null);
  const handleSave = () => {
    if (isSaved) return;
    onSave(tool);
  };

  useEffect(() => () => {
    if (tooltipTimerRef.current) clearTimeout(tooltipTimerRef.current);
  }, []);

  useEffect(() => {
    const handleEscape = () => setShowTooltip(false);
    window.addEventListener('leva:escape', handleEscape);

    return () => window.removeEventListener('leva:escape', handleEscape);
  }, []);

  const handleMouseEnter = (event) => {
    event.currentTarget.style.transform = 'translateY(-2px)';
    event.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.1)';

    if (tooltipTimerRef.current) clearTimeout(tooltipTimerRef.current);
    tooltipTimerRef.current = setTimeout(() => setShowTooltip(true), 300);
  };

  const handleMouseLeave = (event) => {
    event.currentTarget.style.transform = 'translateY(0)';
    event.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)';

    if (tooltipTimerRef.current) clearTimeout(tooltipTimerRef.current);
    setShowTooltip(false);
  };

  return (
    <div
      className="card"
      style={{
        padding: 24, transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        position: 'relative',
        overflow: 'visible',
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <ToolTooltip tool={tool} show={showTooltip} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <span className={tagClass(tool.category)}>{tool.category}</span>
        <PricingBadge pricingType={tool.pricingType} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, gap: 12 }}>
        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--color-text-primary)' }}>{tool.name}</h3>
        <span style={{ display: 'flex', flexShrink: 0 }}><AppIcon name={tool.iconKey} size={20} /></span>
      </div>
      <p
        style={{
          margin: '0 0 8px',
          fontSize: 14,
          color: 'var(--color-text-secondary)',
          lineHeight: 1.6,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {tool.desc}
      </p>
      <div style={{ marginBottom: 16 }}>
        <StarRating rating={tool.rating} />
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          disabled={isSaved}
          onClick={handleSave}
          title="Simpan ke Library"
          className="btn-secondary"
          style={{
            flex: 1,
            height: 44,
            borderRadius: 8,
            color: isSaved ? '#6B7280' : 'var(--color-primary)',
            borderColor: isSaved ? '#E5E7EB' : 'var(--color-primary)',
            background: '#fff',
            cursor: isSaved ? 'not-allowed' : 'pointer',
          }}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <AppIcon name="bookmark" size={16} color="var(--color-primary)" filled={isSaved} aria-hidden="true" />
            {isSaved ? 'Tersimpan ✓' : 'Simpan'}
          </span>
        </button>
        <a
          href={`https://${tool.url}`} target="_blank" rel="noreferrer"
          className="btn-primary"
          style={{
            flex: 1,
            height: 44,
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textDecoration: 'none',
          }}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            Buka ↗ <AppIcon name="external-link" size={14} color="#fff" />
          </span>
        </a>
      </div>
    </div>
  );
}

// --- Main Dashboard View
export default function DashboardView() {
  const { user, saveToolToLibrary, setActiveView, savedTools } = useApp();
  const [activeFilter, setActiveFilter] = useState('Semua');
  const [mounted, setMounted] = useState(false);
  const [showAllFeatured, setShowAllFeatured] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 600);
    return () => clearTimeout(timer);
  }, []);

  const firstName = user ? user.name.split(' ')[0] : 'Renisa';
  const jurusan   = user ? user.jurusan : 'Teknik Informatika';

  const hour = new Date().getHours();
  const greetingMeta = hour >= 5 && hour < 11
    ? { text: 'Selamat pagi', emoji: '☀️' }
    : hour >= 11 && hour < 15
      ? { text: 'Selamat siang', emoji: '🌤️' }
      : hour >= 15 && hour < 18
        ? { text: 'Selamat sore', emoji: '🌅' }
        : { text: 'Selamat malam', emoji: '🌙' };

  const locale = user && user.bahasa === 'English' ? 'en-US' : 'id-ID';
  const today = new Date().toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const FILTERS = ['Semua', 'Research', 'Writing', 'Coding', 'Data', 'Academic', 'Productivity'];

  const jurusanTools = mockTools.filter((tool) => {
    if (!jurusan) return true;
    if (!Array.isArray(tool.jurusan) || tool.jurusan.length === 0) return true;
    return tool.jurusan.includes('Semua') || tool.jurusan.includes(jurusan);
  });
  const baseTools = jurusanTools.length ? jurusanTools : mockTools;

  const featuredTools = baseTools;
  const visibleFeaturedTools = showAllFeatured ? featuredTools : featuredTools.slice(0, 6);
  const filteredTools = activeFilter === 'Semua'
    ? baseTools
    : baseTools.filter(t => t.category === activeFilter);
  const savedToolNames = new Set(savedTools.map((tool) => tool.name.toLowerCase()));

  const handleReplayTour = () => {
    window.dispatchEvent(new CustomEvent('leva:open-dashboard-tour'));
  };

  if (!mounted) return (
    <div className="main-content view-enter" style={{ maxWidth: 1120, margin: '0 auto' }}>
      {[200, 300, 100].map((w, i) => (
        <div key={i} style={{ height: 20, width: w, background: 'var(--color-border)', borderRadius: 8, marginBottom: 8, animation: 'pulse 1.5s infinite' }} />
      ))}
      <div style={{ display: 'flex', gap: 16, marginTop: 24 }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{ width: 256, height: 200, background: 'var(--color-border)', borderRadius: 12, animation: 'pulse 1.5s infinite' }} />
        ))}
      </div>
    </div>
  );

  return (
    <div className="main-content view-enter" style={{ maxWidth: 1120, margin: '0 auto' }}>

      {/* -- Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
            {greetingMeta.text}, <strong>{firstName}</strong>! <span role="img" aria-label="sapaan waktu">{greetingMeta.emoji}</span>
          </h1>
          <p style={{ margin: '8px 0 0', fontSize: 14, color: '#6B7280' }}>
            Dipilihkan khusus untuk <strong>{jurusan}</strong> kamu.
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ margin: 0, fontSize: 14, color: '#6B7280' }}>{today}</p>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 8, fontSize: 12, fontWeight: 600,
            background: 'var(--color-secondary-light)', color: 'var(--color-secondary)',
            padding: '0 10px', height: 24, borderRadius: 12,
          }}>
            <AppIcon name="refresh" size={12} /> Diperbarui otomatis setiap hari
          </span>
        </div>
      </div>

      {/* UI/UX Fix: Step 7 — Display as many choices as possible (grid vs scroll). Drop-down untuk sorting meminimalisir pencarian manual. Survei: 52,5% kesulitan temukan referensi tersimpan. */}
      {/* -- Featured Tools (responsive grid) */}
      <section data-tour="dashboard-featured-tools" style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <AppIcon name="flame" size={18} />
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--color-text-secondary)' }}>Tools Pilihan Hari Ini</h2>
            <span style={{
              fontSize: 12,
              fontWeight: 600,
              background: 'var(--color-primary-light)',
              color: 'var(--color-primary)',
              height: 24,
              borderRadius: 12,
              padding: '0 10px',
              display: 'inline-flex',
              alignItems: 'center',
            }}>
              Untuk {jurusan}
            </span>
          </div>
          <button
            type="button"
            className="btn-ghost"
            onClick={handleReplayTour}
            style={{ padding: '0 12px', height: 44, fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <AppIcon name="sparkles" size={12} /> Mulai Tutorial
          </button>
        </div>
        {visibleFeaturedTools.length > 0 ? (
          <div className="tool-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {visibleFeaturedTools.map(tool => (
              <FeaturedToolCard
                key={tool.id}
                tool={tool}
                onSave={saveToolToLibrary}
                isSaved={savedToolNames.has(tool.name.toLowerCase())}
              />
            ))}
          </div>
        ) : (
          <div className="card" style={{ padding: 24, textAlign: 'center' }}>
            <p style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700, color: 'var(--color-text-primary)' }}>
              Belum ada rekomendasi tools baru hari ini. Cek kembali besok!
            </p>
            <p style={{ margin: '0 0 16px', fontSize: 14, color: 'var(--color-text-secondary)' }}>
              Sementara itu, jelajahi tools yang sudah kamu simpan di Library.
            </p>
            <button
              type="button"
              onClick={() => setActiveView('library')}
              style={{ border: 'none', background: 'transparent', color: 'var(--color-primary)', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
            >
              Buka Library →
            </button>
          </div>
        )}
        {!showAllFeatured && featuredTools.length > 6 && visibleFeaturedTools.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
            <button
              className="btn-ghost"
              onClick={() => setShowAllFeatured(true)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, height: 44 }}
            >
              Lihat Semua <AppIcon name="arrow-right" size={14} />
            </button>
          </div>
        )}
      </section>

      {/* -- Filter Tabs */}
      <div className="dashboard-filter-tabs" style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', position: 'sticky', top: 0, zIndex: 2, background: 'var(--color-bg)', padding: '8px 0 16px' }}>
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            style={{
              padding: '8px 16px', borderRadius: 999, fontSize: 13, fontWeight: 600,
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
      <section style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
          <AppIcon name="news" size={18} />
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--color-text-secondary)' }}>Semua Tools Hari Ini</h2>
          <span style={{
            fontSize: 12, fontWeight: 600, background: 'var(--color-primary-light)',
            color: 'var(--color-primary)', padding: '0 10px', height: 24, borderRadius: 12, display: 'inline-flex', alignItems: 'center',
          }}>
            {filteredTools.length} tools
          </span>
        </div>
        <div className="tool-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {filteredTools.map(tool => (
            <SmallToolCard
              key={tool.id}
              tool={tool}
              onSave={saveToolToLibrary}
              isSaved={savedToolNames.has(tool.name.toLowerCase())}
            />
          ))}
        </div>
        {filteredTools.length === 0 && (
          <div style={{ textAlign: 'center', padding: '32px 24px', color: 'var(--color-text-secondary)' }}>
            <span style={{ display: 'inline-flex' }}><AppIcon name="search" size={36} /></span>
            <p>Tidak ada tool untuk kategori ini.</p>
          </div>
        )}
      </section>

      {/* -- Productivity Tip Banner */}
      <div style={{
        background: 'var(--color-primary-light)',
        border: '1px solid rgba(108,99,255,0.2)',
        borderRadius: 12, padding: '24px',
        display: 'flex', alignItems: 'center', gap: 16,
      }}>
        <span style={{ display: 'flex', flexShrink: 0 }}><AppIcon name="lamp" size={28} /></span>
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: 'var(--color-text-secondary)' }}>Tips Produktivitas Hari Ini</p>
          <p style={{ margin: '8px 0 0', fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
            Coba ceritakan tugasmu ke Leva: <em>"Bantu aku buat literature review topik X untuk jurusan {jurusan}"</em> dan Leva akan otomatis memecahnya jadi langkah-langkah kecil plus merekomendasikan tools terbaik!
          </p>
        </div>
        <button
          className="btn-primary"
          onClick={() => setActiveView('chat')}
          style={{ flexShrink: 0, whiteSpace: 'nowrap', height: 44, fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          Coba Sekarang <AppIcon name="arrow-right" size={14} color="#fff" />
        </button>
      </div>
    </div>
  );
}

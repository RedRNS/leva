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
    free: { label: 'Free', bg: '#065F46', color: '#FFFFFF', icon: 'check' },
    freemium: { label: 'Freemium', bg: '#6C47FF', color: '#FFFFFF', icon: 'sparkles' },
    paid: { label: 'Paid', bg: '#991B1B', color: '#FFFFFF', icon: 'warning' },
    opensource: { label: 'Open Source', bg: '#1E40AF', color: '#FFFFFF', icon: 'link' },
  };

  return map[pricingType] || map.free;
};

function PricingBadge({ pricingType }) {
  const price = pricingMeta(pricingType);
  const tooltipByType = {
    free: 'Completely free to use',
    freemium: 'Basic features free, premium features paid',
    paid: 'Requires a paid subscription for full access',
    opensource: 'Open source code, free to use',
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
      {/* UI/UX Fix: Step 7 — Tooltip/balloon tip as presentation control for pricing info. Survey: 33.9% users hit paywall; Persona Bima needs instant pricing filter. */}
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
            color: isSaved ? '#6C47FF' : 'var(--color-primary)',
            border: `1px solid ${isSaved ? '#D7D2FF' : 'var(--color-primary)'}`,
            background: isSaved ? '#EDE9FF' : '#fff',
            cursor: isSaved ? 'default' : 'pointer',
            opacity: 1,
          }}
        >
          {/* UI/UX Fix: Step 6 — Output device must give clear response to user actions. Step 7 — Destructive actions (delete) must have safeguard/confirmation. Survey: 52.5% users had difficulty finding saved references. */}
          {isSaved ? 'Saved ✓' : 'Save ☆'}
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
            Open ↗ <AppIcon name="external-link" size={14} color="#fff" />
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
          title="Save to Library"
          className="btn-secondary"
          style={{
            flex: 1,
            height: 44,
            borderRadius: 8,
            color: isSaved ? '#6C47FF' : 'var(--color-primary)',
            border: `1px solid ${isSaved ? '#D7D2FF' : 'var(--color-primary)'}`,
            background: isSaved ? '#EDE9FF' : '#fff',
            cursor: isSaved ? 'default' : 'pointer',
            opacity: 1,
          }}
        >
          {isSaved ? 'Saved ✓' : 'Save ☆'}
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
            Open ↗ <AppIcon name="external-link" size={14} color="#fff" />
          </span>
        </a>
      </div>
    </div>
  );
}

// --- Main Dashboard View
export default function DashboardView() {
  const { user, saveToolToLibrary, setActiveView, savedTools } = useApp();
  const [activeFilter, setActiveFilter] = useState('All');
  const [activePricingFilter, setActivePricingFilter] = useState('All');
  const [mounted, setMounted] = useState(false);
  const [showAllFeatured, setShowAllFeatured] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 600);
    return () => clearTimeout(timer);
  }, []);

  const firstName = user ? user.name.split(' ')[0] : 'Renisa';
  const jurusan   = user ? user.jurusan : 'Computer Science';

  const hour = new Date().getHours();
  const greetingMeta = hour >= 5 && hour < 11
    ? { text: 'Good morning', emoji: '☀️' }
    : hour >= 11 && hour < 15
      ? { text: 'Good afternoon', emoji: '🌤️' }
      : hour >= 15 && hour < 18
        ? { text: 'Good evening', emoji: '🌅' }
        : { text: 'Good night', emoji: '🌙' };

  const locale = user && user.bahasa === 'English' ? 'en-US' : 'id-ID';
  const today = new Date().toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const FILTERS = ['All', 'Research', 'Writing', 'Coding', 'Data', 'Academic', 'Productivity'];

  const jurusanTools = mockTools.filter((tool) => {
    if (!jurusan) return true;
    if (!Array.isArray(tool.major) || tool.major.length === 0) return true;
    return tool.major.includes('All') || tool.major.includes(jurusan);
  });
  const baseTools = jurusanTools.length ? jurusanTools : mockTools;

  const pricingCounts = {
    All: baseTools.length,
    free: baseTools.filter(t => t.pricingType === 'free').length,
    freemium: baseTools.filter(t => t.pricingType === 'freemium').length,
    paid: baseTools.filter(t => t.pricingType === 'paid').length,
  };

  const PRICING_FILTERS = [
    { key: 'All', label: 'All Pricing', count: pricingCounts.All, activeBg: 'var(--color-primary)', color: '#6C47FF' },
    { key: 'free', label: 'Free', count: pricingCounts.free, activeBg: '#047857', color: '#047857', icon: 'check' },
    { key: 'freemium', label: 'Freemium', count: pricingCounts.freemium, activeBg: '#6C47FF', color: '#6C47FF', icon: 'sparkles' },
    { key: 'paid', label: 'Paid', count: pricingCounts.paid, activeBg: '#DC2626', color: '#DC2626', icon: 'warning' },
  ];

  const featuredTools = activePricingFilter === 'All'
    ? baseTools
    : baseTools.filter(t => t.pricingType === activePricingFilter);
  const visibleFeaturedTools = showAllFeatured ? featuredTools : featuredTools.slice(0, 6);
  
  const filteredTools = baseTools.filter(t => {
    const matchCategory = activeFilter === 'All' || t.category === activeFilter;
    const matchPricing = activePricingFilter === 'All' || t.pricingType === activePricingFilter;
    return matchCategory && matchPricing;
  });
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
            {greetingMeta.text}, <strong>{firstName}</strong>! <span role="img" aria-label="time greeting">{greetingMeta.emoji}</span>
          </h1>
          <p style={{ margin: '8px 0 0', fontSize: 14, color: '#6B7280' }}>
            Handpicked for your <strong>{jurusan}</strong> major.
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ margin: 0, fontSize: 14, color: '#6B7280' }}>{today}</p>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 8, fontSize: 12, fontWeight: 600,
            background: 'var(--color-secondary-light)', color: 'var(--color-secondary)',
            padding: '0 10px', height: 24, borderRadius: 12,
          }}>
            <AppIcon name="refresh" size={12} /> Auto-updated daily
          </span>
        </div>
      </div>

      {/* UI/UX Fix: Step 7 — Display as many choices as possible (grid vs scroll). Drop-down for sorting minimizes manual search. Survey: 52.5% difficulty finding saved references. */}
      {/* -- Featured Tools (responsive grid) */}
      <section data-tour="dashboard-featured-tools" style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <AppIcon name="flame" size={18} />
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--color-text-secondary)' }}>Today's Featured Tools</h2>
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
              For {jurusan}
            </span>
          </div>
          <button
            type="button"
            className="btn-ghost"
            onClick={handleReplayTour}
            style={{ padding: '0 12px', height: 44, fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <AppIcon name="sparkles" size={12} /> Start Tutorial
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
              No new tool recommendations today. Check back tomorrow!
            </p>
            <p style={{ margin: '0 0 16px', fontSize: 14, color: 'var(--color-text-secondary)' }}>
              In the meantime, explore tools you've already saved to your Library.
            </p>
            <button
              type="button"
              onClick={() => setActiveView('library')}
              style={{ border: 'none', background: 'transparent', color: 'var(--color-primary)', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
            >
              Open Library →
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
              View All <AppIcon name="arrow-right" size={14} />
            </button>
          </div>
        )}
      </section>

      {/* -- Filter Control Area: Category & Pricing */}
      <div style={{ position: 'sticky', top: 0, zIndex: 2, background: 'var(--color-bg)', padding: '8px 0 16px', marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Category Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-secondary)', minWidth: 70 }}>Category:</span>
          <div className="dashboard-filter-tabs" style={{ display: 'flex', gap: 6, flexWrap: 'wrap', flex: 1 }}>
            {FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                style={{
                  padding: '6px 14px', borderRadius: 999, fontSize: 13, fontWeight: 600,
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
        </div>

        {/* Pricing Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-secondary)', minWidth: 70 }}>Pricing:</span>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', flex: 1 }}>
            {PRICING_FILTERS.map(p => {
              const isSelected = activePricingFilter === p.key;
              return (
                <button
                  key={p.key}
                  onClick={() => setActivePricingFilter(p.key)}
                  style={{
                    padding: '6px 14px', borderRadius: 999, fontSize: 13, fontWeight: 600,
                    cursor: 'pointer', transition: 'all 0.2s',
                    border: isSelected ? 'none' : `1px solid ${p.color}40`,
                    background: isSelected ? p.activeBg : 'var(--color-surface)',
                    color: isSelected ? '#fff' : 'var(--color-text-primary)',
                    boxShadow: isSelected ? '0 2px 8px rgba(0,0,0,0.15)' : '0 1px 4px rgba(0,0,0,0.05)',
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                  }}
                >
                  {p.icon && (
                    <span aria-hidden="true" style={{ display: 'flex' }}>
                      <AppIcon name={p.icon} size={14} color={isSelected ? '#fff' : p.color} />
                    </span>
                  )}
                  {p.label}
                  <span style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '1px 6px',
                    borderRadius: 999,
                    background: isSelected ? 'rgba(255,255,255,0.25)' : `${p.color}18`,
                    color: isSelected ? '#fff' : p.color,
                  }}>
                    {p.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* -- All Tools Grid */}
      <section style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
          <AppIcon name="news" size={18} />
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--color-text-secondary)' }}>All Tools Today</h2>
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
            <p>No tools found for the selected category and pricing filter.</p>
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
          <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: 'var(--color-text-secondary)' }}>Today's Productivity Tip</p>
          <p style={{ margin: '8px 0 0', fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
            Try telling Leva about your task: <em>"Help me write a literature review on topic X for my {jurusan} major"</em> and Leva will automatically break it into small steps plus recommend the best tools!
          </p>
        </div>
        <button
          className="btn-primary"
          onClick={() => setActiveView('chat')}
          style={{ flexShrink: 0, whiteSpace: 'nowrap', height: 44, fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          Try Now <AppIcon name="arrow-right" size={14} color="#fff" />
        </button>
      </div>
    </div>
  );
}

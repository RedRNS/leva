import { useEffect, useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { mockTools } from '../data/mockData';
import Modal from '../components/Modal';
import AppIcon from '../components/AppIcon';

const PRIORITY_FILTERS = ['All', 'High Priority', 'Great Tool', 'Try Later'];
const CATEGORY_FILTERS = ['All', 'Research', 'Writing', 'Coding', 'Data', 'Academic', 'Productivity'];
const PRIORITY_OPTIONS = PRIORITY_FILTERS.filter((item) => item !== 'All');
const SORT_OPTIONS = [
  { value: 'latest', label: 'Newest saved' },
  { value: 'oldest', label: 'Oldest saved' },
  { value: 'rating', label: 'Highest rating' },
  { value: 'az', label: 'A-Z' },
  { value: 'za', label: 'Z-A' },
];

const PRIORITY_META = {
  'High Priority': { key: 'high' },
  'Great Tool': { key: 'good' },
  'Try Later': { key: 'later' },
};

const INDONESIAN_MONTH_MAP = {
  jan: 0,
  feb: 1,
  mar: 2,
  apr: 3,
  mei: 4,
  jun: 5,
  jul: 6,
  agu: 7,
  sep: 8,
  okt: 9,
  nov: 10,
  des: 11,
};

const pricingMeta = (pricingType) => {
  const map = {
    free: { label: 'Free', bg: '#047857', color: '#FFFFFF', icon: 'check' },
    freemium: { label: 'Freemium', bg: '#7C3AED', color: '#FFFFFF', icon: 'sparkles' },
    paid: { label: 'Paid', bg: '#DC2626', color: '#FFFFFF', icon: 'warning' },
    opensource: { label: 'Open Source', bg: '#1E40AF', color: '#FFFFFF', icon: 'link' },
  };

  return map[pricingType] || map.freemium;
};

const parseSavedAtToTimestamp = (savedAt, fallback = 0) => {
  if (!savedAt || typeof savedAt !== 'string') return fallback;

  const parts = savedAt.trim().split(' ');
  if (parts.length < 3) return fallback;

  const day = Number(parts[0]);
  const month = INDONESIAN_MONTH_MAP[parts[1].slice(0, 3).toLowerCase()];
  const year = Number(parts[2]);

  if (!Number.isFinite(day) || month === undefined || !Number.isFinite(year)) return fallback;

  return new Date(year, month, day).getTime();
};

// Badge component for priority
function PriorityBadge({ priorityKey, label }) {
  const styles = {
    high:  { background: '#B45309', color: '#FFFFFF', icon: 'flame' },
    good:  { background: '#0078D4', color: '#FFFFFF', icon: 'star' },
    later: { background: '#6B7280', color: '#FFFFFF', icon: 'clock' },
  };
  const s = styles[priorityKey] || styles.later;
  return (
    <span style={{ ...s, fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 999, whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <span aria-hidden="true" style={{ display: 'flex' }}><AppIcon name={s.icon} size={16} color="#FFFFFF" /></span>
      <span>{label}</span>
    </span>
  );
}

function PricingBadge({ pricingType }) {
  const pricing = pricingMeta(pricingType);

  return (
    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999, background: pricing.bg, color: pricing.color, whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <span aria-hidden="true" style={{ display: 'flex' }}><AppIcon name={pricing.icon} size={16} color={pricing.color} /></span>
      {pricing.label}
    </span>
  );
}

// Saved Tool Card
function SavedToolCard({ tool, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const priorityBarColor = tool.priorityKey === 'high'
    ? '#B45309'
    : tool.priorityKey === 'good'
      ? '#0078D4'
      : '#6B7280';

  return (
    <div
      className="card"
      style={{ padding: '18px 20px', transition: 'transform 0.2s, box-shadow 0.2s', position: 'relative', overflow: 'hidden' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'; e.currentTarget.style.background = '#F5F3FF'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)'; e.currentTarget.style.background = 'var(--color-surface)'; }}
    >
      <span aria-hidden="true" style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: priorityBarColor }} />
      {/* Top row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div>
          <h3 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 700 }}>{tool.name}</h3>
          <p style={{ margin: 0, fontSize: 12, color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <AppIcon name="link" size={12} /> {tool.url}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <PricingBadge pricingType={tool.pricingType} />
          <PriorityBadge priorityKey={tool.priorityKey} label={tool.priority} />
        </div>
      </div>

      {/* Category + date */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 10, alignItems: 'center' }}>
        <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 6, background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
          {tool.category}
        </span>
        <span style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
          Saved {tool.savedAt}
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
            style={{ fontSize: 11, padding: '2px 8px', background: '#EDE9FF', border: '1px solid #D7D2FF', borderRadius: 6, color: '#6C47FF' }}
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
            Open Tool <AppIcon name="external-link" size={14} color="#fff" />
          </span>
        </a>
        <button
          onClick={() => onDelete(tool)}
          style={{
            flex: 1, padding: '8px', borderRadius: 9, border: '1px solid #FEE2E2',
            background: '#FFF5F5', color: '#DC2626', cursor: 'pointer',
            fontSize: 13, fontWeight: 500, transition: 'all 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#FEE2E2'}
          onMouseLeave={e => e.currentTarget.style.background = '#FFF5F5'}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <AppIcon name="trash" size={14} /> Delete
          </span>
        </button>
      </div>
    </div>
  );
}

// Main Library View
export default function LibraryView() {
  const { savedTools, setSavedTools, setActiveView, removeToolFromLibrary } = useApp();
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchVal, setSearchVal] = useState('');
  const [debouncedSearchVal, setDebouncedSearchVal] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  const [showAddModal, setShowAddModal] = useState(false);
  const [toolToDelete, setToolToDelete] = useState(null);
  const [newTool, setNewTool] = useState({ name: '', url: '', note: '', category: 'Research', priority: 'Great Tool' });

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearchVal(searchVal.trim().toLowerCase());
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchVal]);

  const ratingByName = useMemo(() => {
    const map = new Map();
    mockTools.forEach((tool) => {
      map.set(tool.name.toLowerCase(), tool.rating ?? 0);
    });
    return map;
  }, []);

  const pricingByName = useMemo(() => {
    const map = new Map();
    mockTools.forEach((tool) => {
      map.set(tool.name.toLowerCase(), tool.pricingType ?? 'freemium');
    });
    return map;
  }, []);

  const filtered = useMemo(() => {
    const base = savedTools.filter((tool) => {
      const matchPriority = priorityFilter === 'All' || tool.priority === priorityFilter;
      const matchCategory = categoryFilter === 'All' || tool.category === categoryFilter;

      const searchableText = [
        tool.name,
        tool.description,
        tool.note,
        tool.tags,
        tool.keywords?.join(' '),
      ].filter(Boolean).join(' ').toLowerCase();

      const matchSearch = !debouncedSearchVal || searchableText.includes(debouncedSearchVal);
      return matchPriority && matchCategory && matchSearch;
    });

    /* UI/UX Fix: Step 7 — Display as many choices as possible (grid vs scroll). Drop-down for sorting minimizes manual search. Survey: 52.5% difficulty finding saved references. */
    const withMeta = base.map((tool, index) => ({
      ...tool,
      _timestamp: tool.savedTimestamp ?? parseSavedAtToTimestamp(tool.savedAt, 0),
      _rating: tool.rating ?? ratingByName.get(tool.name.toLowerCase()) ?? 0,
      pricingType: tool.pricingType ?? pricingByName.get(tool.name.toLowerCase()) ?? 'freemium',
    }));

    withMeta.sort((a, b) => {
      if (sortBy === 'latest') return b._timestamp - a._timestamp;
      if (sortBy === 'oldest') return a._timestamp - b._timestamp;
      if (sortBy === 'rating') return b._rating - a._rating;
      if (sortBy === 'az') return a.name.localeCompare(b.name, 'id-ID');
      if (sortBy === 'za') return b.name.localeCompare(a.name, 'id-ID');
      return 0;
    });

    return withMeta;
  }, [savedTools, priorityFilter, categoryFilter, debouncedSearchVal, sortBy, ratingByName, pricingByName]);

  const handleDeleteRequest = (tool) => {
    /* UI/UX Fix: Step 6 — Output device must give clear response to user action. Step 7 — Destructive actions (delete) must have safeguard/confirmation. Survey: 52.5% users difficulty finding references. */
    setToolToDelete(tool);
  };

  const handleConfirmDelete = () => {
    if (!toolToDelete) return;
    removeToolFromLibrary(toolToDelete.id);
    setToolToDelete(null);
  };

  const handleAddTool = () => {
    if (!newTool.name.trim() || !newTool.url.trim()) return;
    const priorityConfig = PRIORITY_META[newTool.priority] || PRIORITY_META['Great Tool'];
    const entry = {
      id: Date.now(),
      name: newTool.name,
      url: newTool.url.replace(/^https?:\/\//, ''),
      priority: newTool.priority,
      priorityKey: priorityConfig.key,
      pricingType: 'freemium',
      category: newTool.category,
      keywords: [newTool.category.toLowerCase(), 'ai tools', 'manual'],
      savedAt: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
      savedTimestamp: Date.now(),
      description: '',
      rating: 0,
      note: newTool.note,
    };
    setSavedTools(prev => [entry, ...prev]);
    setNewTool({ name: '', url: '', note: '', category: 'Research', priority: 'Great Tool' });
    setShowAddModal(false);
  };

  const inputStyle = {
    width: '100%', padding: '10px 12px',
    border: '1px solid var(--color-border)',
    borderRadius: 9, fontSize: 13, outline: 'none',
    boxSizing: 'border-box', marginBottom: 12,
  };

  const isLibraryEmpty = savedTools.length === 0;

  const handleResetFilters = () => {
    setPriorityFilter('All');
    setCategoryFilter('All');
    setSearchVal('');
    setDebouncedSearchVal('');
    setSortBy('latest');
  };

  return (
    <div className="main-content view-enter" style={{ padding: '32px 36px', maxWidth: 1100, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
            <AppIcon name="library" size={22} /> My Tool Library
          </h1>
          <p style={{ margin: '6px 0 0', fontSize: 14, color: 'var(--color-text-secondary)' }}>
            Collection of AI tools you've saved, complete with automatic priority tags.
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowAddModal(true)} style={{ whiteSpace: 'nowrap' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <AppIcon name="plus" size={14} color="#fff" /> Add Manually
          </span>
        </button>
      </div>

      {isLibraryEmpty ? (
        <div style={{ minHeight: 420, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '24px 12px' }}>
          <div style={{ width: 120, height: 90, borderRadius: 18, background: '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, border: '1px solid var(--color-border)' }}>
            <svg width="90" height="60" viewBox="0 0 90 60" role="img" aria-label="Illustration of an empty bookshelf">
              <rect x="6" y="10" width="78" height="40" rx="8" fill="#FFFFFF" stroke="#6C47FF" strokeWidth="1.5" />
              <rect x="14" y="18" width="16" height="24" rx="3" fill="#F5F5F5" stroke="#6C47FF" strokeWidth="1.5" />
              <rect x="34" y="18" width="16" height="24" rx="3" fill="#F5F5F5" stroke="#6C47FF" strokeWidth="1.5" />
              <rect x="54" y="18" width="16" height="24" rx="3" fill="#F5F5F5" stroke="#6C47FF" strokeWidth="1.5" />
              <circle cx="76" cy="32" r="9" fill="#6C47FF" />
              <line x1="76" y1="27" x2="76" y2="37" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="71" y1="32" x2="81" y2="32" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <h3 style={{ margin: '0 0 10px', fontSize: 24, fontWeight: 800, color: 'var(--color-text-primary)' }}>
            Your Library is empty
          </h3>
          <p style={{ margin: '0 0 22px', maxWidth: 520, fontSize: 14, lineHeight: 1.7, color: 'var(--color-text-secondary)' }}>
            Start saving tools from Dashboard or Chat &amp; Task to build your collection!
          </p>
          <button className="btn-primary" onClick={() => setActiveView('dashboard')} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 16px' }}>
            Go to Dashboard <AppIcon name="arrow-right" size={14} color="#fff" />
          </button>
        </div>
      ) : (
        <>
          {/* Stats row */}
          <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
            {[
              { label: 'Total Tools', val: savedTools.length, icon: 'folder' },
              { label: 'High Priority', val: savedTools.filter(t => t.priorityKey === 'high').length, icon: 'flame' },
              { label: 'Great Tools', val: savedTools.filter(t => t.priorityKey === 'good').length, icon: 'check' },
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
                placeholder="Search tool name, tag, or category..."
                style={{ ...inputStyle, marginBottom: 20 }}
                onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
                onBlur={e => e.target.style.borderColor = 'var(--color-border)'}
              />

              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-secondary)', letterSpacing: '0.07em', margin: 0 }}>PRIORITY</p>
                <span
                  className="tooltip-host tooltip-help-icon"
                  data-tooltip="Priority is automatically assigned based on usage frequency and tool rating."
                  aria-label="Priority info"
                  tabIndex={0}
                >
                  ?
                </span>
              </div>
              {PRIORITY_FILTERS.map(f => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setPriorityFilter(f)}
                  style={{
                    padding: '7px 10px', borderRadius: 8, cursor: 'pointer', fontSize: 13,
                    background: priorityFilter === f ? 'var(--color-primary-light)' : 'transparent',
                    color: priorityFilter === f ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                    fontWeight: priorityFilter === f ? 600 : 400,
                    marginBottom: 2, transition: 'all 0.15s',
                    border: 'none',
                    width: '100%',
                    textAlign: 'left',
                  }}
                >
                  {f}
                </button>
              ))}

              <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-secondary)', letterSpacing: '0.07em', margin: '20px 0 8px' }}>CATEGORY</p>
              {CATEGORY_FILTERS.map(f => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setCategoryFilter(f)}
                  style={{
                    padding: '7px 10px', borderRadius: 8, cursor: 'pointer', fontSize: 13,
                    background: categoryFilter === f ? 'var(--color-primary-light)' : 'transparent',
                    color: categoryFilter === f ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                    fontWeight: categoryFilter === f ? 600 : 400,
                    marginBottom: 2, transition: 'all 0.15s',
                    border: 'none',
                    width: '100%',
                    textAlign: 'left',
                  }}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Tool Cards Grid */}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
                <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: 0 }}>
                  Showing <strong>{filtered.length}</strong> of {savedTools.length} tools
                </p>

                <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--color-text-secondary)' }}>
                  <span style={{ fontWeight: 600 }}>Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(event) => setSortBy(event.target.value)}
                    style={{
                      border: '1px solid var(--color-border)',
                      borderRadius: 9,
                      fontSize: 13,
                      padding: '7px 10px',
                      color: 'var(--color-text-primary)',
                      background: '#fff',
                      outline: 'none',
                    }}
                  >
                    {SORT_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </label>
              </div>

              {filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '56px 20px' }}>
                  <span style={{ display: 'inline-flex', position: 'relative' }}>
                    <AppIcon name="search" size={48} color="#94A3B8" />
                    <span style={{ position: 'absolute', right: -2, bottom: -1, width: 18, height: 18, borderRadius: '50%', background: '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <AppIcon name="x" size={12} color="#64748B" />
                    </span>
                  </span>
                  <p style={{ margin: '14px 0 14px', color: 'var(--color-text-secondary)', fontSize: 14, lineHeight: 1.7 }}>
                    No tools match this filter. Try changing filters or adding new tools.
                  </p>
                  <button className="btn-secondary" onClick={handleResetFilters}>
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div className="library-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                  {filtered.map(tool => (
                    <SavedToolCard key={tool.id} tool={tool} onDelete={handleDeleteRequest} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Add Tool Modal */}
      {showAddModal && (
        <Modal title="Add Tool Manually" onClose={() => setShowAddModal(false)}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Tool Name *</label>
            <input value={newTool.name} onChange={e => setNewTool(p => ({ ...p, name: e.target.value }))} placeholder="e.g., Perplexity AI" style={inputStyle} />
            <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Tool URL *</label>
            <input value={newTool.url} onChange={e => setNewTool(p => ({ ...p, url: e.target.value }))} placeholder="https://perplexity.ai" style={inputStyle} />
            <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Category</label>
            <select value={newTool.category} onChange={e => setNewTool(p => ({ ...p, category: e.target.value }))} style={{ ...inputStyle }}>
              {CATEGORY_FILTERS.filter(f => f !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Priority</label>
            <div style={{ display: 'grid', gap: 8, marginBottom: 12 }}>
              {PRIORITY_OPTIONS.map((priority) => {
                const isActive = newTool.priority === priority;
                return (
                  <label
                    key={priority}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '8px 10px',
                      borderRadius: 8,
                      border: `1px solid ${isActive ? '#C4B5FD' : 'var(--color-border)'}`,
                      background: isActive ? 'var(--color-primary-light)' : '#fff',
                      cursor: 'pointer',
                      fontSize: 13,
                      fontWeight: isActive ? 600 : 500,
                      color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                    }}
                  >
                    <input
                      type="radio"
                      name="priority"
                      value={priority}
                      checked={isActive}
                      onChange={(event) => setNewTool((prev) => ({ ...prev, priority: event.target.value }))}
                      style={{ accentColor: 'var(--color-primary)' }}
                    />
                    <span>{priority}</span>
                  </label>
                );
              })}
            </div>
            <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Notes (optional)</label>
            <textarea value={newTool.note} onChange={e => setNewTool(p => ({ ...p, note: e.target.value }))} placeholder="What is this tool for?" rows={3} style={{ ...inputStyle, resize: 'none' }} />
            <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', margin: '0 0 16px' }}>
              You can edit these details anytime from the tool card in your Library.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn-ghost" onClick={() => setShowAddModal(false)} style={{ flex: 1 }}>Cancel</button>
              <button className="btn-primary" onClick={handleAddTool} style={{ flex: 2 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <AppIcon name="check" size={14} color="#fff" /> Save Tool
                </span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {toolToDelete && (
        <Modal title="Delete Tool" onClose={() => setToolToDelete(null)}>
          <p style={{ margin: '0 0 16px', fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
            Delete {toolToDelete.name} from your library?
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn-ghost" onClick={() => setToolToDelete(null)} style={{ flex: 1 }}>
              Cancel
            </button>
            <button
              onClick={handleConfirmDelete}
              style={{
                flex: 1,
                background: '#DC2626',
                color: '#fff',
                border: 'none',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                padding: '10px 16px',
              }}
            >
              Delete
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

import { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { mockSubTasks, mockTools } from '../data/mockData';

// --- Tag color helper
const tagStyle = (cat) => {
  const map = {
    Research:     { bg: '#EDE9FE', color: '#7C3AED' },
    Writing:      { bg: '#FEF9C3', color: '#A16207' },
    Coding:       { bg: '#DBEAFE', color: '#1D4ED8' },
    Data:         { bg: '#DCFCE7', color: '#15803D' },
    Academic:     { bg: '#FFE4E6', color: '#BE123C' },
    Productivity: { bg: '#F0FDFA', color: '#0F766E' },
  };
  return map[cat] || { bg: '#F1F5F9', color: '#64748B' };
};

// --- Typing Indicator
function TypingIndicator() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '20px 0' }}>
      <div style={{
        width: 32, height: 32, borderRadius: '50%', background: 'var(--color-primary)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 14, flexShrink: 0,
      }}>✦</div>
      <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 12, padding: '10px 16px', display: 'flex', gap: 4 }}>
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
      </div>
    </div>
  );
}

// --- Subtask Card
function SubTaskCard({ task, index, isExpanded, onToggle, onMarkDone, onSaveTool }) {
  const tools = mockTools.filter(t => task.toolIds.includes(t.id));
  const ts = tagStyle(task.kategori);

  return (
    <div className="card" style={{ marginBottom: 10, overflow: 'hidden', transition: 'box-shadow 0.2s' }}>
      {/* Card Header */}
      <div
        onClick={onToggle}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px', cursor: 'pointer',
          background: isExpanded ? 'var(--color-primary-light)' : '#fff',
          transition: 'background 0.2s',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Step number */}
          <div style={{
            width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
            background: task.status === 'done' ? 'var(--color-secondary)' : 'var(--color-primary-light)',
            color: task.status === 'done' ? '#fff' : 'var(--color-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 700,
          }}>
            {task.status === 'done' ? '✓' : index + 1}
          </div>
          <span style={{ fontWeight: 600, fontSize: 15, color: 'var(--color-text-primary)' }}>
            {task.title}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {task.status === 'done'
            ? <span className="badge-done">Done ✓</span>
            : <span className="badge-next">Next Section ›</span>
          }
          <span style={{
            color: 'var(--color-text-secondary)', fontSize: 18,
            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)',
            transition: 'transform 0.3s',
          }}>⌄</span>
        </div>
      </div>

      {/* Expandable Content */}
      <div className={`subtask-content ${isExpanded ? 'open' : ''}`}>
        <div style={{ padding: '20px 20px 20px', borderTop: '1px solid var(--color-border)' }}>
          {/* Meta row */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
            <span style={{ fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 8, ...ts }}>
              {task.kategori}
            </span>
            <span style={{ fontSize: 12, color: 'var(--color-text-secondary)', padding: '3px 10px', background: 'var(--color-bg)', borderRadius: 8 }}>
              ⏱️ {task.estimasi}
            </span>
          </div>

          {/* Description */}
          <p style={{ margin: '0 0 16px', fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
            {task.deskripsi}
          </p>

          {/* Action button */}
          {task.status !== 'done' ? (
            <button
              className="btn-primary"
              onClick={() => onMarkDone(task.id)}
              style={{ padding: '9px 20px', fontSize: 13 }}
            >
              ✓ Tandai Selesai
            </button>
          ) : (
            <button
              className="btn-ghost"
              onClick={() => onMarkDone(task.id)}
              style={{ padding: '9px 20px', fontSize: 13 }}
            >
              ↩ Tandai Ulang
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Right Panel: Tool Recommendations
function RightPanel({ task, isOpen, onSave }) {
  const tools = task ? mockTools.filter(t => task.toolIds.includes(t.id)) : [];

  return (
    <div
      className={`right-panel ${isOpen ? 'open' : ''}`}
      style={{
        width: isOpen ? 280 : 0,
        minWidth: isOpen ? 280 : 0,
        height: '100%',
        background: 'var(--color-surface)',
        borderLeft: isOpen ? '1px solid var(--color-border)' : 'none',
        overflowY: 'auto',
        overflowX: 'hidden',
        position: 'sticky', top: 0,
        padding: isOpen ? '24px 16px' : 0,
        pointerEvents: isOpen ? 'auto' : 'none',
        transition: 'width 0.3s ease, min-width 0.3s ease',
      }}
    >
      {!isOpen || !task ? null : (
        <>
          {/* Rekomendasi Tools */}
          <div style={{ marginBottom: 20 }}>
            <p style={{ margin: '0 0 12px', fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', letterSpacing: '0.07em' }}>
              🤖 REKOMENDASI TOOLS AI
            </p>
            {tools.map(tool => (
              <div
                key={tool.id}
                className="card"
                style={{ padding: '12px 14px', marginBottom: 10, border: '1px solid var(--color-border)' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 20 }}>{tool.emoji}</span>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{tool.name}</span>
                  </div>
                  <a
                    href={`https://${tool.url}`} target="_blank" rel="noreferrer"
                    style={{ fontSize: 14, color: 'var(--color-primary)', textDecoration: 'none' }}
                  >↗</a>
                </div>
                <p style={{ margin: '6px 0 10px', fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                  {tool.desc.slice(0, 70)}...
                </p>
                <button
                  className="btn-secondary"
                  onClick={() => onSave(tool)}
                  style={{ width: '100%', padding: '7px', fontSize: 12 }}
                >
                  🔖 Simpan ke Library
                </button>
              </div>
            ))}
          </div>

          {/* Tips Penggunaan */}
          <div style={{
            background: 'var(--color-accent-light)',
            border: '1px solid rgba(245,158,11,0.3)',
            borderRadius: 12, padding: '14px 14px', marginBottom: 16,
          }}>
            <p style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 700, color: '#92400E' }}>
              💡 TIPS PENGGUNAAN
            </p>
            <p style={{ margin: 0, fontSize: 12, color: '#78350F', lineHeight: 1.6 }}>
              {task.tips}
            </p>
          </div>

          {/* Quick Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button
              className="btn-ghost"
              style={{ fontSize: 12, padding: '8px' }}
              onClick={() => {
                navigator.clipboard?.writeText(task.tips);
              }}
            >
              📋 Salin Prompt Tips
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// --- Main Chat Workspace View
export default function ChatWorkspaceView() {
  const { user, activeTask, saveToolToLibrary } = useApp();
  const firstName = user ? user.name.split(' ')[0] : 'Renisa';
  const jurusan   = user ? user.jurusan : 'Teknik Informatika';

  const [inputVal, setInputVal]         = useState('');
  const [taskTitle, setTaskTitle]       = useState('');
  const [subTasks, setSubTasks]         = useState([]);
  const [expandedId, setExpandedId]     = useState(null);
  const [isLoading, setIsLoading]       = useState(false);
  const [followUpVal, setFollowUpVal]   = useState('');
  const [followUpReply, setFollowUpReply] = useState('');
  const inputRef = useRef(null);

  // Load from history task if set
  useEffect(() => {
    if (activeTask) {
      setTaskTitle('Menyusun Skripsi ' + jurusan);
      setSubTasks(mockSubTasks.map(t => ({ ...t })));
      setExpandedId(1);
    } else {
      setTaskTitle('');
      setSubTasks([]);
      setExpandedId(null);
      setIsLoading(false);
    }
  }, [activeTask]);

  const handleSubmit = () => {
    if (!inputVal.trim()) return;
    const raw = inputVal.toLowerCase();
    let title = 'Menyelesaikan Tugas Akademik';
    if (raw.includes('skripsi'))     title = `Menyusun Skripsi ${jurusan}`;
    else if (raw.includes('essay'))  title = `Menulis Essay ${jurusan}`;
    else if (raw.includes('koding') || raw.includes('coding')) title = `Belajar Koding dari Nol`;
    else if (raw.includes('resume')) title = `Membuat Resume Magang`;

    setInputVal('');
    setIsLoading(true);
    setTaskTitle('');
    setSubTasks([]);
    setExpandedId(null);

    setTimeout(() => {
      setIsLoading(false);
      setTaskTitle(title);
      setSubTasks(mockSubTasks.map(t => ({ ...t })));
      setExpandedId(1);
    }, 1800);
  };

  const toggleExpand = (id) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  const toggleDone = (id) => {
    setSubTasks(prev =>
      prev.map(t => t.id === id ? { ...t, status: t.status === 'done' ? 'next' : 'done' } : t)
    );
  };

  const handleFollowUp = () => {
    if (!followUpVal.trim()) return;
    setFollowUpReply('');
    setTimeout(() => {
      setFollowUpReply(
        `Untuk subtask "${subTasks.find(t => t.id === expandedId)?.title ?? 'ini'}", aku sarankan mulai dengan Perplexity AI - masukkan kata kunci jurusan kamu dan minta ia menganalisis tren topik 2024-2025. Ini jauh lebih efisien dibandingkan browsing manual di Google Scholar. 🚀`
      );
      setFollowUpVal('');
    }, 1200);
  };

  const expandedTask  = subTasks.find(t => t.id === expandedId) ?? null;
  const hasResults    = subTasks.length > 0;
  const rightPanelOpen = !!expandedTask;

  const completedCount = subTasks.filter(t => t.status === 'done').length;
  const progressPct    = subTasks.length ? Math.round((completedCount / subTasks.length) * 100) : 0;

  return (
    <div className="view-enter main-content" style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>

      {/* -- CENTER PANEL */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, padding: hasResults ? '28px 32px' : '0', display: 'flex', flexDirection: 'column' }}>

          {/* -- EMPTY STATE */}
          {!hasResults && !isLoading && (
            <div style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              padding: '40px 20px', minHeight: 'calc(100vh - 100px)',
            }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>✦</div>
              <h2 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 700, textAlign: 'center' }}>
                Hei, {firstName}! Ceritakan tugasmu hari ini.
              </h2>
              <p style={{ margin: '0 0 32px', fontSize: 14, color: 'var(--color-text-secondary)', textAlign: 'center', maxWidth: 440, lineHeight: 1.65 }}>
                Leva akan memecahnya jadi langkah-langkah kecil + merekomendasikan tools AI terbaik untukmu.
              </p>

              {/* Main Input */}
              <div style={{ width: '100%', maxWidth: 560, position: 'relative' }}>
                <textarea
                  ref={inputRef}
                  value={inputVal}
                  onChange={e => setInputVal(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
                  placeholder="Contoh: aku mau bikin skripsi, atau bantu aku buat essay etika profesi..."
                  rows={3}
                  style={{
                    width: '100%', padding: '16px 56px 16px 18px',
                    border: '2px solid var(--color-border)',
                    borderRadius: 16, fontSize: 14, resize: 'none',
                    outline: 'none', color: 'var(--color-text-primary)',
                    lineHeight: 1.6, boxSizing: 'border-box',
                    transition: 'border 0.2s',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.07)',
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
                  onBlur={e  => e.target.style.borderColor = 'var(--color-border)'}
                />
                <button
                  onClick={handleSubmit}
                  style={{
                    position: 'absolute', right: 12, bottom: 12,
                    background: inputVal.trim() ? 'var(--color-primary)' : 'var(--color-border)',
                    border: 'none', borderRadius: 10, padding: '8px 12px',
                    cursor: inputVal.trim() ? 'pointer' : 'default',
                    color: '#fff', fontSize: 16, transition: 'background 0.2s',
                  }}
                >
                  →
                </button>
              </div>
              <p style={{ marginTop: 12, fontSize: 12, color: 'var(--color-text-secondary)' }}>
                Tekan Enter atau klik → untuk mulai
              </p>

              {/* Quick suggestions */}
              <div style={{ display: 'flex', gap: 8, marginTop: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
                {['Bantu susun skripsi', 'Cara belajar coding dari 0', 'Buat essay etika profesi', 'Analisis jurnal terkait'].map(s => (
                  <button
                    key={s}
                    onClick={() => { setInputVal(s); inputRef.current?.focus(); }}
                    style={{
                      padding: '7px 14px', borderRadius: 999, fontSize: 12, fontWeight: 500,
                      background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                      cursor: 'pointer', color: 'var(--color-text-secondary)',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.color = 'var(--color-primary)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-text-secondary)'; }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* -- LOADING */}
          {isLoading && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 100px)' }}>
              <TypingIndicator />
              <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginTop: 12 }}>
                Leva sedang menganalisis tugasmu...
              </p>
            </div>
          )}

          {/* -- RESULTS */}
          {hasResults && !isLoading && (
            <>
              {/* Task Title Card */}
              <div style={{
                background: 'linear-gradient(135deg, var(--color-primary) 0%, #8B5CF6 100%)',
                borderRadius: 16, padding: '20px 24px', marginBottom: 20, color: '#fff',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <div>
                  <p style={{ margin: '0 0 4px', fontSize: 12, opacity: 0.75, fontWeight: 600, letterSpacing: '0.06em' }}>TASK AKTIF</p>
                  <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>{taskTitle}</h2>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: '0 0 6px', fontSize: 12, opacity: 0.75 }}>{completedCount}/{subTasks.length} selesai</p>
                  <div style={{ width: 100, height: 6, background: 'rgba(255,255,255,0.25)', borderRadius: 3 }}>
                    <div style={{ width: `${progressPct}%`, height: '100%', background: '#fff', borderRadius: 3, transition: 'width 0.4s' }} />
                  </div>
                </div>
              </div>

              {/* Subtask List */}
              {subTasks.map((task, i) => (
                <SubTaskCard
                  key={task.id}
                  task={task}
                  index={i}
                  isExpanded={expandedId === task.id}
                  onToggle={() => toggleExpand(task.id)}
                  onMarkDone={toggleDone}
                  onSaveTool={saveToolToLibrary}
                />
              ))}

              {completedCount === subTasks.length && subTasks.length > 0 && (
                <div style={{
                  background: 'linear-gradient(135deg, var(--color-secondary), #059669)',
                  borderRadius: 16, padding: '24px', textAlign: 'center', marginTop: 16, color: '#fff',
                }}>
                  <div style={{ fontSize: 48, marginBottom: 8 }}>🎉</div>
                  <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700 }}>Semua task selesai!</h3>
                  <p style={{ margin: 0, fontSize: 14, opacity: 0.9 }}>
                    Kerja bagus, {firstName}! Kamu berhasil menyelesaikan semua langkah untuk "{taskTitle}".
                  </p>
                </div>
              )}

              {/* Follow-up Input */}
              <div style={{ marginTop: 20, padding: '16px 20px', background: 'var(--color-surface)', borderRadius: 14, border: '1px solid var(--color-border)' }}>
                {followUpReply && (
                  <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
                    <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, flexShrink: 0 }}>✦</div>
                    <div style={{ background: 'var(--color-primary-light)', borderRadius: 12, padding: '12px 14px', fontSize: 13, lineHeight: 1.65, color: 'var(--color-text-primary)', flex: 1 }}>
                      {followUpReply}
                    </div>
                  </div>
                )}
                <div style={{ display: 'flex', gap: 10 }}>
                  <input
                    value={followUpVal}
                    onChange={e => setFollowUpVal(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleFollowUp()}
                    placeholder="Tanya lebih lanjut tentang task ini..."
                    style={{
                      flex: 1, padding: '10px 14px',
                      border: '1px solid var(--color-border)',
                      borderRadius: 10, fontSize: 13, outline: 'none',
                    }}
                    onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
                    onBlur={e  => e.target.style.borderColor = 'var(--color-border)'}
                  />
                  <button className="btn-primary" onClick={handleFollowUp} style={{ padding: '10px 18px', fontSize: 13 }}>
                    Kirim
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* -- RIGHT PANEL */}
      <RightPanel
        task={expandedTask}
        isOpen={rightPanelOpen}
        onSave={saveToolToLibrary}
      />
    </div>
  );
}

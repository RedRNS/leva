import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { historyTasks } from '../data/mockData';
import Modal from './Modal';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard',   icon: '🏠' },
  { id: 'chat',      label: 'Chat & Task', icon: '💬' },
  { id: 'library',   label: 'Library',     icon: '📚' },
  { id: 'profile',   label: 'Profile',     icon: '👤' },
];

export default function Sidebar() {
  const { user, activeView, setActiveView, setActiveTask } = useApp();
  const [showSettings, setShowSettings] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [notif, setNotif]       = useState(true);
  const [searchVal, setSearchVal] = useState('');

  const filteredHistory = historyTasks.filter(t =>
    t.title.toLowerCase().includes(searchVal.toLowerCase())
  );

  const handleHistoryClick = (task) => {
    setActiveTask(task);
    setActiveView('chat');
  };

  return (
    <>
      <aside className="sidebar-desktop" style={{
        width: 240, minWidth: 240, height: '100vh',
        background: 'var(--color-sidebar)',
        display: 'flex', flexDirection: 'column',
        padding: '20px 12px',
        overflowY: 'auto',
        position: 'sticky', top: 0,
      }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, paddingLeft: 4 }}>
          <span style={{ fontSize: 22 }}>✦</span>
          <span style={{ color: '#fff', fontSize: 20, fontWeight: 800, letterSpacing: '-0.5px' }}>Leva</span>
        </div>

        {/* New Chat Button */}
        <button
          onClick={() => { setActiveTask(null); setActiveView('chat'); }}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 10, color: '#fff',
            padding: '9px 12px', fontSize: 13, fontWeight: 600,
            cursor: 'pointer', marginBottom: 12,
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <span style={{ fontSize: 16 }}>✚</span> New Chat
        </button>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: 16 }}>
          <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 13, opacity: 0.5 }}>🔍</span>
          <input
            value={searchVal}
            onChange={e => setSearchVal(e.target.value)}
            placeholder="Cari riwayat..."
            style={{
              width: '100%', background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 9, padding: '8px 10px 8px 30px',
              color: '#fff', fontSize: 13,
              outline: 'none',
            }}
          />
        </div>

        {/* Navigation */}
        <nav style={{ marginBottom: 20 }}>
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              className={`sidebar-item ${activeView === item.id ? 'active' : ''}`}
              onClick={() => setActiveView(item.id)}
              type="button"
              style={{ width: '100%', background: 'transparent', border: 'none', textAlign: 'left' }}
            >
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
          <div
            className="sidebar-item"
            onClick={() => setShowSettings(true)}
          >
            <span style={{ fontSize: 16 }}>⚙️</span> Settings
          </div>
        </nav>

        {/* Divider */}
        <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', marginBottom: 14 }} />

        {/* History */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-sidebar-text-muted)', letterSpacing: '0.08em', marginBottom: 8, paddingLeft: 4 }}>
            RIWAYAT TUGAS
          </p>
          {filteredHistory.map(task => (
            <div
              key={task.id}
              onClick={() => handleHistoryClick(task)}
              style={{
                padding: '8px 10px', borderRadius: 9, cursor: 'pointer',
                background: task.isActive ? 'rgba(108,99,255,0.25)' : 'transparent',
                marginBottom: 2,
                transition: 'background 0.2s ease',
              }}
              onMouseEnter={e => { if (!task.isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
              onMouseLeave={e => { if (!task.isActive) e.currentTarget.style.background = 'transparent'; }}
            >
              <p style={{
                margin: 0, fontSize: 13, fontWeight: task.isActive ? 600 : 400,
                color: task.isActive ? '#fff' : 'var(--color-sidebar-text)',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {task.title}
              </p>
              <p style={{ margin: 0, fontSize: 11, color: 'var(--color-sidebar-text-muted)', marginTop: 2 }}>
                {task.date}
              </p>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '14px 0' }} />

        {/* User Profile Footer */}
        <div
          style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '4px 4px' }}
          onClick={() => setActiveView('profile')}
        >
          <div style={{
            width: 34, height: 34, borderRadius: '50%',
            background: 'var(--color-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, fontSize: 14, flexShrink: 0,
          }}>
            {user ? user.name.charAt(0).toUpperCase() : 'R'}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user ? user.name : 'Renisa Mahardika'}
            </p>
            <p style={{ margin: 0, fontSize: 11, color: 'var(--color-sidebar-text-muted)' }}>
              {user ? `${user.jurusan} · Sem ${user.semester}` : 'Teknik Informatika · Sem 6'}
            </p>
          </div>
        </div>
      </aside>

      {/* Settings Modal */}
      {showSettings && (
        <Modal title="⚙️ Pengaturan" onClose={() => setShowSettings(false)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

            {/* Toggle row helper */}
            {[
              { label: 'Dark Mode', sublabel: 'Ganti tema ke gelap', val: darkMode, set: setDarkMode },
              { label: 'Notifikasi Daily Discovery', sublabel: 'Reminder tools baru setiap hari', val: notif, set: setNotif },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)' }}>{item.label}</p>
                  <p style={{ margin: 0, fontSize: 12, color: 'var(--color-text-secondary)' }}>{item.sublabel}</p>
                </div>
                <div
                  onClick={() => item.set(v => !v)}
                  style={{
                    width: 44, height: 24, borderRadius: 12, cursor: 'pointer',
                    background: item.val ? 'var(--color-primary)' : 'var(--color-border)',
                    position: 'relative', transition: 'background 0.2s',
                  }}
                >
                  <div style={{
                    position: 'absolute', top: 3, left: item.val ? 22 : 3,
                    width: 18, height: 18, borderRadius: '50%', background: '#fff',
                    transition: 'left 0.2s',
                  }} />
                </div>
              </div>
            ))}

            <div style={{ height: 1, background: 'var(--color-border)' }} />

            <p style={{ margin: 0, fontSize: 12, color: 'var(--color-text-secondary)', textAlign: 'center' }}>
              Leva v1.0.0 · Dibuat untuk Hackathon 🚀
            </p>

            <button className="btn-primary" onClick={() => setShowSettings(false)} style={{ width: '100%' }}>
              Tutup
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}

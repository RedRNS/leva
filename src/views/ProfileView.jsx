import { useState } from 'react';
import { useApp } from '../context/AppContext';
import AppIcon from '../components/AppIcon';

const JURUSAN_OPTIONS = ['Teknik Informatika', 'Sistem Informasi', 'Hukum', 'Kedokteran', 'Psikologi', 'Bisnis & Manajemen', 'Desain Komunikasi Visual', 'Akuntansi', 'Ilmu Komunikasi', 'Lainnya'];
const SEMESTER_OPTIONS = Array.from({ length: 8 }, (_, i) => `${i + 1}`);

export default function ProfileView() {
  const { user, setUser, setActiveView, savedTools } = useApp();
  const [editMode, setEditMode] = useState(false);
  const [notif1, setNotif1] = useState(true);
  const [notif2, setNotif2] = useState(true);
  const [notif3, setNotif3] = useState(false);
  const [form, setForm] = useState({
    name: user?.name ?? 'Renisa Mahardika',
    jurusan: user?.jurusan ?? 'Teknik Informatika',
    semester: user?.semester ?? '6',
    bahasa: user?.bahasa ?? 'Indonesia',
  });

  const update = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSave = () => {
    setUser(form);
    setEditMode(false);
  };

  const inputStyle = {
    width: '100%', padding: '10px 13px',
    border: '1px solid var(--color-border)', borderRadius: 9,
    fontSize: 13, outline: 'none', boxSizing: 'border-box',
  };

  const Toggle = ({ val, set }) => (
    <div onClick={() => set(v => !v)} style={{ width: 44, height: 24, borderRadius: 12, cursor: 'pointer', background: val ? 'var(--color-primary)' : 'var(--color-border)', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
      <div style={{ position: 'absolute', top: 3, left: val ? 22 : 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
    </div>
  );

  const initial = (form.name || 'R').charAt(0).toUpperCase();

  return (
    <div className="main-content view-enter" style={{ padding: '32px 36px', maxWidth: 680, margin: '0 auto' }}>

      <h1 style={{ margin: '0 0 24px', fontSize: 24, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
        <AppIcon name="user" size={22} /> Profil & Pengaturan
      </h1>

      {/* -- Profile Card */}
      <div className="card" style={{ padding: '28px 28px', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: editMode ? 24 : 0 }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--color-primary), #8B5CF6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 26, fontWeight: 800, flexShrink: 0,
          }}>
            {initial}
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: '0 0 4px', fontSize: 20, fontWeight: 700 }}>{form.name}</h2>
            <p style={{ margin: 0, fontSize: 14, color: 'var(--color-text-secondary)' }}>
              {form.jurusan} · Semester {form.semester}
            </p>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--color-text-secondary)' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><AppIcon name="book" size={12} /> {form.bahasa}</span>
            </p>
          </div>
          {!editMode && (
            <button className="btn-ghost" onClick={() => setEditMode(true)} style={{ padding: '8px 16px', fontSize: 13 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><AppIcon name="pencil" size={12} /> Edit</span>
            </button>
          )}
        </div>

        {/* Edit Form */}
        {editMode && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 5 }}>Nama</label>
                <input value={form.name} onChange={e => update('name', e.target.value)} style={inputStyle} onFocus={e => e.target.style.borderColor = 'var(--color-primary)'} onBlur={e => e.target.style.borderColor = 'var(--color-border)'} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 5 }}>Semester</label>
                <select value={form.semester} onChange={e => update('semester', e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                  {SEMESTER_OPTIONS.map(s => <option key={s} value={s}>Semester {s}</option>)}
                </select>
              </div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 5 }}>Jurusan</label>
              <select value={form.jurusan} onChange={e => update('jurusan', e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                {JURUSAN_OPTIONS.map(j => <option key={j} value={j}>{j}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 8 }}>Preferensi Bahasa</label>
              <div style={{ display: 'flex', gap: 10 }}>
                {['Indonesia', 'English'].map(lang => (
                  <button key={lang} onClick={() => update('bahasa', lang)} style={{ flex: 1, padding: '9px', borderRadius: 9, fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s', background: form.bahasa === lang ? 'var(--color-primary)' : 'var(--color-bg)', color: form.bahasa === lang ? '#fff' : 'var(--color-text-secondary)', border: `1.5px solid ${form.bahasa === lang ? 'var(--color-primary)' : 'var(--color-border)'}` }}>
                    {lang === 'Indonesia' ? 'ID Indonesia' : 'EN English'}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn-ghost" onClick={() => setEditMode(false)} style={{ flex: 1 }}>Batal</button>
              <button className="btn-primary" onClick={handleSave} style={{ flex: 2, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><AppIcon name="check" size={14} color="#fff" /> Simpan Perubahan</button>
            </div>
          </div>
        )}
      </div>

      {/* -- Stats Card */}
      <div className="card" style={{ padding: '20px 24px', marginBottom: 20 }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}><AppIcon name="dashboard" size={16} /> Statistik Penggunaan</h3>
        <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          {[
            { icon: 'clipboard', val: 12, label: 'Tasks Selesai' },
            { icon: 'book', val: savedTools.length, label: 'Tools Tersimpan' },
            { icon: 'calendar-clock', val: 8, label: 'Hari Berturut-turut' },
          ].map(stat => (
            <div key={stat.label} style={{ textAlign: 'center', padding: '16px 10px', background: 'var(--color-bg)', borderRadius: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6 }}><AppIcon name={stat.icon} size={22} /></div>
              <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-primary)' }}>{stat.val}</div>
              <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* -- Notification Preferences */}
      <div className="card" style={{ padding: '20px 24px', marginBottom: 20 }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}><AppIcon name="bell" size={16} /> Preferensi Notifikasi</h3>
        {[
          { label: 'Daily Discovery Reminder', sub: 'Ingatkan tools AI baru setiap hari', val: notif1, set: setNotif1 },
          { label: 'Tips Penggunaan Mingguan', sub: 'Tips produktivitas setiap minggu', val: notif2, set: setNotif2 },
          { label: 'Update Tool Baru', sub: 'Tools baru sesuai jurusanmu', val: notif3, set: setNotif3 },
        ].map((item, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: i < 2 ? '1px solid var(--color-border)' : 'none' }}>
            <div>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>{item.label}</p>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--color-text-secondary)' }}>{item.sub}</p>
            </div>
            <Toggle val={item.val} set={item.set} />
          </div>
        ))}
      </div>

      {/* -- Logout */}
      <button
        onClick={() => { setUser(null); setActiveView('onboarding'); }}
        style={{
          width: '100%', padding: '13px', borderRadius: 12, border: '1.5px solid #FEE2E2',
          background: '#FFF5F5', color: '#DC2626', fontSize: 14, fontWeight: 600,
          cursor: 'pointer', transition: 'all 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = '#FEE2E2'; }}
        onMouseLeave={e => { e.currentTarget.style.background = '#FFF5F5'; }}
      >
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><AppIcon name="logout" size={14} /> Keluar & Reset Demo</span>
      </button>
    </div>
  );
}

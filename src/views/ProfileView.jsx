import { useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import AppIcon from '../components/AppIcon';
import Modal from '../components/Modal';

const JURUSAN_OPTIONS = ['Computer Science', 'Information Systems', 'Law', 'Medicine', 'Psychology', 'Business & Management', 'Visual Communication Design', 'Accounting', 'Communication Studies', 'Other'];
const SEMESTER_OPTIONS = Array.from({ length: 8 }, (_, i) => `${i + 1}`);

export default function ProfileView() {
  const {
    user,
    setUser,
    setActiveView,
    savedTools,
    setSavedTools,
    setActiveTask,
    setHistoryTasks,
    soundEnabled,
    setSoundEnabled,
    highContrast,
    setHighContrast,
    setProfileHasUnsavedChanges,
    showToast,
  } = useApp();
  const [editMode, setEditMode] = useState(false);
  const [notif1, setNotif1] = useState(true);
  const [notif2, setNotif2] = useState(true);
  const [notif3, setNotif3] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showJurusanChangeModal, setShowJurusanChangeModal] = useState(false);
  const [pendingSaveMode, setPendingSaveMode] = useState(null);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [pendingLeaveTarget, setPendingLeaveTarget] = useState(null);
  const [hoveredStat, setHoveredStat] = useState('');
  const [form, setForm] = useState({
    name: user?.name ?? 'Renisa Mahardika',
    jurusan: user?.jurusan ?? 'Computer Science',
    semester: user?.semester ?? '6',
    bahasa: user?.bahasa ?? 'English',
  });
  const [errors, setErrors] = useState({});
  const initialProfileRef = useRef({
    form: {
      name: user?.name ?? 'Renisa Mahardika',
      jurusan: user?.jurusan ?? 'Computer Science',
      semester: user?.semester ?? '6',
      bahasa: user?.bahasa ?? 'English',
    },
    notifications: {
      soundEnabled,
      notif1: true,
      notif2: true,
      notif3: false,
    },
  });
  const hasUnsavedProfileRef = useRef(false);
  const hasPushedBackGuardRef = useRef(false);
  const allowExternalLeaveRef = useRef(false);

  const update = (key, val) => {
    setForm(f => ({ ...f, [key]: val }));
    setErrors(e => ({ ...e, [key]: '' }));
  };

  const validateProfileForm = () => {
    const nextErrors = {};
    const trimmedName = form.name.trim();

    if (!trimmedName) {
      nextErrors.name = 'Name cannot be empty.';
    } else if (trimmedName.length < 2) {
      nextErrors.name = 'Name must be at least 2 characters.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const commitProfileChanges = () => {
    if (!validateProfileForm()) return;

    try {
      if (typeof navigator !== 'undefined' && navigator.onLine === false) {
        throw new Error('Connection not available');
      }

      const sanitizedForm = { ...form, name: form.name.trim() };

      setUser(sanitizedForm);
      setForm(sanitizedForm);
      initialProfileRef.current = {
        form: sanitizedForm,
        notifications: {
          soundEnabled,
          notif1,
          notif2,
          notif3,
        },
      };

      setErrors({});
      setEditMode(false);
      showToast('Profile changes saved successfully!', 'success');
      return true;
    } catch {
      showToast('Failed to save changes. Check your connection and try again.', 'error');
      return false;
    }
  };

  const requestProfileSave = (mode = 'save') => {
    const previousJurusan = initialProfileRef.current.form.jurusan;
    const hasJurusanChanged = form.jurusan !== previousJurusan;

    if (hasJurusanChanged) {
      setPendingSaveMode(mode);
      setShowJurusanChangeModal(true);
      return false;
    }

    const saveSuccess = commitProfileChanges();
    if (!saveSuccess) return false;

    if (mode === 'save-and-leave') {
      setProfileHasUnsavedChanges(false);
      continueLeaveAfterDecision();
      setPendingLeaveTarget(null);
    }

    return true;
  };

  const handleSave = () => {
    requestProfileSave('save');
  };

  const resetProfileDraft = () => {
    const baseline = initialProfileRef.current;

    setForm(baseline.form);
    setSoundEnabled(baseline.notifications.soundEnabled);
    setNotif1(baseline.notifications.notif1);
    setNotif2(baseline.notifications.notif2);
    setNotif3(baseline.notifications.notif3);
    setErrors({});
    setEditMode(false);
  };

  const handleLogoutOnly = () => {
    setProfileHasUnsavedChanges(false);
    setUser(null);
    setActiveView('onboarding', { force: true });
  };

  const handleResetDemo = () => {
    setProfileHasUnsavedChanges(false);
    setSavedTools([]);
    setHistoryTasks([]);
    setActiveTask(null);
    setUser(null);
    setShowResetModal(false);
    setActiveView('onboarding', { force: true });
  };

  const handleStatCardClick = (label) => {
    if (label === 'Tasks Completed') {
      setActiveTask(null);
      setActiveView('chat');
      return;
    }

    if (label === 'Saved Tools') {
      setActiveView('library');
    }
  };

  const hasUnsavedProfileChanges =
    form.name !== initialProfileRef.current.form.name
    || form.jurusan !== initialProfileRef.current.form.jurusan
    || form.semester !== initialProfileRef.current.form.semester
    || form.bahasa !== initialProfileRef.current.form.bahasa
    || soundEnabled !== initialProfileRef.current.notifications.soundEnabled
    || notif1 !== initialProfileRef.current.notifications.notif1
    || notif2 !== initialProfileRef.current.notifications.notif2
    || notif3 !== initialProfileRef.current.notifications.notif3;

  useEffect(() => {
    hasUnsavedProfileRef.current = hasUnsavedProfileChanges;
    setProfileHasUnsavedChanges(hasUnsavedProfileChanges);
  }, [hasUnsavedProfileChanges, setProfileHasUnsavedChanges]);

  useEffect(() => () => {
    setProfileHasUnsavedChanges(false);
  }, [setProfileHasUnsavedChanges]);

  useEffect(() => {
    if (!hasUnsavedProfileChanges || hasPushedBackGuardRef.current) return;

    window.history.pushState({ levaProfileUnsavedGuard: true }, '', window.location.href);
    hasPushedBackGuardRef.current = true;
  }, [hasUnsavedProfileChanges]);

  useEffect(() => {
    if (hasUnsavedProfileChanges) return;
    hasPushedBackGuardRef.current = false;
  }, [hasUnsavedProfileChanges]);

  useEffect(() => {
    const handleBackNavigation = () => {
      if (!hasUnsavedProfileRef.current || allowExternalLeaveRef.current) return;

      window.history.pushState({ levaProfileUnsavedGuard: true }, '', window.location.href);
      setPendingLeaveTarget('__history_back__');
      setShowUnsavedModal(true);
    };

    window.addEventListener('popstate', handleBackNavigation);
    return () => window.removeEventListener('popstate', handleBackNavigation);
  }, []);

  useEffect(() => {
    if (!hasUnsavedProfileChanges) return;

    const handleBeforeUnload = (event) => {
      if (allowExternalLeaveRef.current) return;
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedProfileChanges]);

  useEffect(() => {
    const handleConfirmLeaveProfile = (event) => {
      const nextView = event.detail?.nextView;
      if (!hasUnsavedProfileRef.current || !nextView) return;

      setPendingLeaveTarget(nextView);
      setShowUnsavedModal(true);
    };

    window.addEventListener('leva:confirm-leave-profile', handleConfirmLeaveProfile);
    return () => window.removeEventListener('leva:confirm-leave-profile', handleConfirmLeaveProfile);
  }, []);

  const closeUnsavedModal = () => {
    setShowUnsavedModal(false);
    setPendingLeaveTarget(null);
  };

  const continueLeaveAfterDecision = () => {
    if (!pendingLeaveTarget) return;

    if (pendingLeaveTarget === '__history_back__') {
      allowExternalLeaveRef.current = true;

      setTimeout(() => {
        window.history.back();
      }, 0);

      return;
    }

    setActiveView(pendingLeaveTarget, { force: true });
  };

  const handleSaveAndLeave = () => {
    setShowUnsavedModal(false);
    requestProfileSave('save-and-leave');
  };

  const handleCancelJurusanChange = () => {
    const previousJurusan = initialProfileRef.current.form.jurusan;

    setForm((prev) => ({ ...prev, jurusan: previousJurusan }));
    setShowJurusanChangeModal(false);
    setPendingSaveMode(null);
  };

  const handleConfirmJurusanChange = () => {
    const saveMode = pendingSaveMode;
    const saveSuccess = commitProfileChanges();
    if (!saveSuccess) return;

    setShowJurusanChangeModal(false);
    setPendingSaveMode(null);

    if (saveMode === 'save-and-leave') {
      setProfileHasUnsavedChanges(false);
      continueLeaveAfterDecision();
      setPendingLeaveTarget(null);
    }
  };

  const handleDiscardAndLeave = () => {
    resetProfileDraft();
    setShowUnsavedModal(false);
    setProfileHasUnsavedChanges(false);
    continueLeaveAfterDecision();
    setPendingLeaveTarget(null);
  };

  const inputStyle = {
    width: '100%', padding: '10px 13px',
    border: '1px solid var(--color-border)', borderRadius: 9,
    fontSize: 13, outline: 'none', boxSizing: 'border-box',
  };

  const errText = (key) => errors[key]
    ? (
      <p className="field-error-message" role="alert">
        <span style={{ display: 'inline-flex', alignItems: 'center', marginTop: 1 }}>
          <AppIcon name="warning" size={12} color="#DC2626" />
        </span>
        <span>{errors[key]}</span>
      </p>
    )
    : null;

  const Toggle = ({ val, set, label }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: val ? 'var(--color-primary)' : 'var(--color-text-secondary)' }}>
        {val ? 'Active' : 'Inactive'}
      </span>
      <button
        type="button"
        aria-pressed={val}
        aria-label={label ? `Toggle ${label}` : 'Toggle status'}
        onClick={() => set(v => !v)}
        style={{
          width: 44,
          height: 24,
          borderRadius: 12,
          cursor: 'pointer',
          background: val ? 'var(--color-primary)' : 'var(--color-border)',
          position: 'relative',
          transition: 'background 0.2s',
          flexShrink: 0,
          border: 'none',
        }}
      >
        <div style={{ position: 'absolute', top: 3, left: val ? 22 : 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
      </button>
    </div>
  );

  const initial = (form.name || 'R').charAt(0).toUpperCase();

  return (
    <div className="main-content view-enter" style={{ padding: '32px 36px', maxWidth: 680, margin: '0 auto' }}>

      <h1 style={{ margin: '0 0 24px', fontSize: 24, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
        <AppIcon name="user" size={22} /> Profile &amp; Settings
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
            <button className="btn-ghost" onClick={() => { setErrors({}); setEditMode(true); }} style={{ padding: '8px 16px', fontSize: 13 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><AppIcon name="pencil" size={12} /> Edit</span>
            </button>
          )}
        </div>

        {/* Edit Form */}
        {editMode && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 5 }}>Full Name</label>
                <input
                  value={form.name}
                  onChange={e => update('name', e.target.value)}
                  aria-invalid={!!errors.name}
                  style={{ ...inputStyle, borderColor: errors.name ? '#DC2626' : 'var(--color-border)' }}
                  onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
                  onBlur={e => e.target.style.borderColor = errors.name ? '#DC2626' : 'var(--color-border)'}
                />
                {errText('name')}
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 5 }}>Semester</label>
                <select value={form.semester} onChange={e => update('semester', e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                  {SEMESTER_OPTIONS.map(s => <option key={s} value={s}>Semester {s}</option>)}
                </select>
              </div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 5 }}>Major</label>
              <select value={form.jurusan} onChange={e => update('jurusan', e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                {JURUSAN_OPTIONS.map(j => <option key={j} value={j}>{j}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 8 }}>Language Preference</label>
              <div style={{ display: 'flex', gap: 10 }}>
                {['Indonesia', 'English'].map(lang => (
                  <button key={lang} onClick={() => update('bahasa', lang)} style={{ flex: 1, padding: '9px', borderRadius: 9, fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s', background: form.bahasa === lang ? 'var(--color-primary)' : 'var(--color-bg)', color: form.bahasa === lang ? '#fff' : 'var(--color-text-secondary)', border: `1.5px solid ${form.bahasa === lang ? 'var(--color-primary)' : 'var(--color-border)'}` }}>
                    {lang === 'Indonesia' ? 'ID Indonesia' : 'EN English'}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn-ghost" onClick={resetProfileDraft} style={{ flex: 1 }}>Cancel</button>
              <button className="btn-primary" onClick={handleSave} style={{ flex: 2, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><AppIcon name="check" size={14} color="#fff" /> Save Changes</button>
            </div>
          </div>
        )}
      </div>

      {/* -- Stats Card */}
      <div className="card" style={{ padding: '20px 24px', marginBottom: 20 }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}><AppIcon name="dashboard" size={16} /> Usage Statistics</h3>
        <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          {[
            {
              icon: 'clipboard',
              val: 12,
              label: 'Tasks Completed',
              aria: 'View task history in Chat and Task',
              trendText: '↑ 3 from last week',
              trendColor: '#065F46',
              graphic: 'sparkline',
            },
            {
              icon: 'book',
              val: savedTools.length,
              label: 'Saved Tools',
              aria: 'View saved tools list in Library',
              trendText: '↓ 1 from last week',
              trendColor: '#991B1B',
              graphic: 'sparkline',
            },
            {
              icon: 'calendar-clock',
              val: 8,
              label: 'Consecutive Days',
              aria: 'View daily streak progress',
              trendText: '- same as last week',
              trendColor: '#6B7280',
              graphic: 'streak',
            },
          ].map(stat => {
            const isHovered = hoveredStat === stat.label;
            const statTooltipText = stat.label === 'Consecutive Days'
              ? "Number of consecutive days you've used Leva."
              : '';
            const baseStyle = {
              textAlign: 'center',
              padding: '16px 10px',
              background: isHovered ? '#FFFFFF' : 'var(--color-bg)',
              borderRadius: 12,
              border: isHovered ? '1px solid #DDD8FF' : '1px solid transparent',
              cursor: 'pointer',
              boxShadow: isHovered ? '0 10px 24px rgba(108,99,255,0.14)' : '0 2px 8px rgba(15,23,42,0.06)',
              transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
              transition: 'transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease, background-color 0.18s ease',
            };
            return (
              <button
                key={stat.label}
                type="button"
                aria-label={stat.aria || stat.label}
                className={statTooltipText ? 'tooltip-host tooltip-block' : undefined}
                data-tooltip={statTooltipText || undefined}
                onClick={() => handleStatCardClick(stat.label)}
                style={baseStyle}
                onMouseEnter={() => setHoveredStat(stat.label)}
                onMouseLeave={() => setHoveredStat('')}
              >
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6 }}><AppIcon name={stat.icon} size={22} /></div>
                <div style={{ fontSize: 24, fontWeight: 800, color: isHovered ? 'var(--color-primary)' : 'var(--color-text-primary)' }}>{stat.val}</div>
                <div style={{ fontSize: 12, color: isHovered ? 'var(--color-primary)' : 'var(--color-text-secondary)', marginTop: 2 }}>
                  {stat.label}
                </div>
                {stat.graphic === 'sparkline' && (
                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: 6 }}>
                    <svg width="50" height="16" viewBox="0 0 50 16" role="img" aria-label="4-week trend">
                      <rect x="0" y="6" width="6" height="10" rx="2" fill="#6C47FF" />
                      <rect x="10" y="2" width="6" height="14" rx="2" fill="#6C47FF" />
                      <rect x="20" y="8" width="6" height="8" rx="2" fill="#6C47FF" />
                      <rect x="30" y="4" width="6" height="12" rx="2" fill="#6C47FF" />
                      <rect x="40" y="1" width="6" height="15" rx="2" fill="#6C47FF" />
                    </svg>
                  </div>
                )}
                {stat.graphic === 'streak' && (
                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: 6 }}>
                    <svg width="50" height="16" viewBox="0 0 50 16" role="img" aria-label="7-day streak">
                      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                        <rect key={i} x={i * 7} y="2" width="6" height="12" rx="2" fill={i < 5 ? '#6C47FF' : '#E2E8F0'} />
                      ))}
                    </svg>
                  </div>
                )}
                <div style={{ marginTop: 4, fontSize: 11, fontWeight: 600, color: stat.trendColor }}>
                  {stat.trendText}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* -- Notification Preferences */}
      <div className="card" style={{ padding: '20px 24px', marginBottom: 20 }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}><AppIcon name="bell" size={16} /> Notification Preferences</h3>
        {[
          { label: 'Sound Effects', sub: 'Play sound when completing tasks', val: soundEnabled, set: setSoundEnabled },
          { label: 'Daily Reminders', sub: 'Remind about new AI tools daily', val: notif1, set: setNotif1 },
          { label: 'Weekly Usage Tips', sub: 'Productivity tips every week', val: notif2, set: setNotif2 },
          { label: 'New Tool Updates', sub: 'New tools tailored for your major', val: notif3, set: setNotif3 },
        ].map((item, i, arr) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
            <div>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>{item.label}</p>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--color-text-secondary)' }}>{item.sub}</p>
            </div>
            <Toggle val={item.val} set={item.set} label={item.label} />
          </div>
        ))}
      </div>

      {/* -- Display Preferences */}
      <div className="card" style={{ padding: '20px 24px', marginBottom: 20 }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}><AppIcon name="moon" size={16} /> Display &amp; Accessibility</h3>
        {[
          { label: 'Dark Mode', sub: 'Dark mode for late night focus', val: darkMode, set: setDarkMode },
          { label: 'High Contrast', sub: 'Increase contrast for accessibility', val: highContrast, set: setHighContrast },
        ].map((item, i, arr) => (
          <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
            <div>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>{item.label}</p>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--color-text-secondary)' }}>{item.sub}</p>
            </div>
            <Toggle val={item.val} set={item.set} label={item.label} />
          </div>
        ))}
      </div>

      {/* -- Session Actions */}
      {/* UI/UX Fix: Step 6 — Hotspots must be easily recognizable (accordion). Step 7 — Destructive actions (reset) need safeguard. Clickable statistics improve cross-screen connectivity. */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <button
          onClick={handleLogoutOnly}
          style={{
            width: '100%', padding: '13px', borderRadius: 12, border: '1.5px solid var(--color-border)',
            background: '#fff', color: 'var(--color-text-secondary)', fontSize: 14, fontWeight: 600,
            cursor: 'pointer', transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#CBD5E1'; e.currentTarget.style.color = 'var(--color-text-primary)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-text-secondary)'; }}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><AppIcon name="logout" size={14} /> Log Out</span>
        </button>

        <button
          onClick={() => setShowResetModal(true)}
          style={{
            width: '100%', padding: '13px', borderRadius: 12, border: '1.5px solid #FEE2E2',
            background: '#FFF5F5', color: '#DC2626', fontSize: 14, fontWeight: 600,
            cursor: 'pointer', transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#FEE2E2'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#FFF5F5'; }}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><AppIcon name="trash" size={14} /> Reset Demo</span>
        </button>
      </div>

      {showResetModal && (
        <Modal title="Reset All Data?" onClose={() => setShowResetModal(false)}>
          <p style={{ margin: '0 0 16px', fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
            All data including task history, tool library, and settings will be deleted. This action cannot be undone.
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn-ghost" onClick={() => setShowResetModal(false)} style={{ flex: 1 }}>
              Cancel
            </button>
            <button
              onClick={handleResetDemo}
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
              Delete All Data
            </button>
          </div>
        </Modal>
      )}

      {showJurusanChangeModal && (
        <Modal title="Change Major?" onClose={handleCancelJurusanChange}>
          <p style={{ margin: '0 0 16px', fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
            Changing major from <strong>{initialProfileRef.current.form.jurusan}</strong> to <strong>{form.jurusan}</strong> will affect tool recommendations on the Dashboard. Continue?
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn-ghost" onClick={handleCancelJurusanChange} style={{ flex: 1 }}>
              Cancel
            </button>
            <button className="btn-primary" onClick={handleConfirmJurusanChange} style={{ flex: 1 }}>
              Yes, Change
            </button>
          </div>
        </Modal>
      )}

      {showUnsavedModal && (
        <Modal title="Unsaved Changes" onClose={closeUnsavedModal}>
          <p style={{ margin: '0 0 16px', fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
            You have unsaved profile or notification changes. What would you like to do?
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8 }}>
            <button
              type="button"
              onClick={handleSaveAndLeave}
              style={{
                width: '100%',
                border: 'none',
                borderRadius: 10,
                background: '#6C5CE7',
                color: '#fff',
                fontSize: 14,
                fontWeight: 700,
                padding: '10px 14px',
                cursor: 'pointer',
              }}
            >
              Save &amp; Continue
            </button>
            <button
              type="button"
              onClick={handleDiscardAndLeave}
              style={{
                width: '100%',
                border: '1px solid #FECACA',
                borderRadius: 10,
                background: '#fff',
                color: '#B91C1C',
                fontSize: 14,
                fontWeight: 600,
                padding: '10px 14px',
                cursor: 'pointer',
              }}
            >
              Discard Changes
            </button>
            <button className="btn-ghost" onClick={closeUnsavedModal}>
              Cancel
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

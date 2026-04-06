import { useState } from 'react';
import { useApp } from '../context/AppContext';
import AppIcon from '../components/AppIcon';

const JURUSAN_OPTIONS = [
  'Teknik Informatika', 'Sistem Informasi', 'Hukum', 'Kedokteran',
  'Psikologi', 'Bisnis & Manajemen', 'Desain Komunikasi Visual',
  'Akuntansi', 'Ilmu Komunikasi', 'Lainnya',
];

const SEMESTER_OPTIONS = Array.from({ length: 8 }, (_, i) => `${i + 1}`);

export default function OnboardingView() {
  const { setUser, setActiveView } = useApp();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: '', jurusan: '', semester: '', bahasa: 'Indonesia' });
  const [errors, setErrors] = useState({});

  const update = (key, val) => {
    setForm(f => ({ ...f, [key]: val }));
    setErrors(e => ({ ...e, [key]: '' }));
  };

  const validateStep1 = () => {
    if (!form.name.trim()) { setErrors({ name: 'Nama tidak boleh kosong.' }); return false; }
    return true;
  };

  const validateStep2 = () => {
    const e = {};
    if (!form.jurusan)  e.jurusan  = 'Pilih jurusanmu.';
    if (!form.semester) e.semester = 'Pilih semestermu.';
    if (Object.keys(e).length) { setErrors(e); return false; }
    return true;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2);
    if (step === 2 && validateStep2()) setStep(3);
  };

  const handleStart = () => {
    setUser(form);
    setActiveView('dashboard');
  };

  // -- Shared input style
  const inputStyle = (hasError) => ({
    width: '100%', padding: '12px 14px',
    border: `1.5px solid ${hasError ? '#EF4444' : 'var(--color-border)'}`,
    borderRadius: 10, fontSize: 14,
    outline: 'none', color: 'var(--color-text-primary)',
    background: '#fff',
    transition: 'border 0.2s',
    boxSizing: 'border-box',
  });

  const errText = (key) => errors[key]
    ? <p style={{ margin: '4px 0 0', fontSize: 12, color: '#EF4444' }}>{errors[key]}</p>
    : null;

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #6C63FF 0%, #8B5CF6 50%, #A78BFA 100%)',
      padding: 20,
    }}>
      <div className="card" style={{ width: '100%', maxWidth: 460, padding: 36 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6 }}><AppIcon name="sparkles" size={30} /></div>
          <span style={{ fontSize: 26, fontWeight: 800, color: 'var(--color-primary)', letterSpacing: '-0.5px' }}>
            Leva
          </span>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--color-text-secondary)' }}>
            Your Cognitive Lever for Academic Excellence
          </p>
        </div>

        {/* Step Dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 28 }}>
          {[1, 2, 3].map(s => (
            <div key={s} style={{
              width: s === step ? 24 : 8, height: 8, borderRadius: 4,
              background: s <= step ? 'var(--color-primary)' : 'var(--color-border)',
              transition: 'all 0.3s ease',
            }} />
          ))}
        </div>

        {/* --- STEP 1 --- */}
        {step === 1 && (
          <div>
            <h2 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 700 }}>Hei! Perkenalkan dirimu dulu</h2>
            <p style={{ margin: '0 0 24px', fontSize: 14, color: 'var(--color-text-secondary)' }}>
              Leva butuh sedikit info untuk mempersonalisasi pengalaman belajarmu.
            </p>

            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)', display: 'block', marginBottom: 6 }}>
              Nama lengkap kamu
            </label>
            <input
              value={form.name}
              onChange={e => update('name', e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleNext()}
              placeholder="Contoh: Renisa Mahardika"
              style={inputStyle(!!errors.name)}
              onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
              onBlur={e => e.target.style.borderColor = errors.name ? '#EF4444' : 'var(--color-border)'}
            />
            {errText('name')}

            <button
              className="btn-primary"
              onClick={handleNext}
              style={{
                width: '100%',
                padding: '13px',
                marginTop: 20,
                fontSize: 15,
                opacity: form.name.trim() ? 1 : 0.65,
                cursor: form.name.trim() ? 'pointer' : 'not-allowed',
              }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                Lanjut <AppIcon name="arrow-right" size={14} color="#fff" />
              </span>
            </button>
          </div>
        )}

        {/* --- STEP 2 --- */}
        {step === 2 && (
          <div>
            <h2 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 700 }}>Info Akademik Kamu</h2>
            <p style={{ margin: '0 0 24px', fontSize: 14, color: 'var(--color-text-secondary)' }}>
              Ini membantu Leva merekomendasikan tools yang paling relevan untukmu.
            </p>

            {/* Jurusan */}
            <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Jurusan</label>
            <select
              value={form.jurusan}
              onChange={e => update('jurusan', e.target.value)}
              style={{ ...inputStyle(!!errors.jurusan), cursor: 'pointer' }}
            >
              <option value="">-- Pilih jurusanmu --</option>
              {JURUSAN_OPTIONS.map(j => <option key={j} value={j}>{j}</option>)}
            </select>
            {errText('jurusan')}

            {/* Semester */}
            <label style={{ fontSize: 13, fontWeight: 600, display: 'block', margin: '16px 0 6px' }}>Semester</label>
            <select
              value={form.semester}
              onChange={e => update('semester', e.target.value)}
              style={{ ...inputStyle(!!errors.semester), cursor: 'pointer' }}
            >
              <option value="">-- Pilih semestermu --</option>
              {SEMESTER_OPTIONS.map(s => <option key={s} value={s}>Semester {s}</option>)}
            </select>
            {errText('semester')}

            {/* Bahasa */}
            <label style={{ fontSize: 13, fontWeight: 600, display: 'block', margin: '16px 0 8px' }}>Preferensi Bahasa</label>
            <div style={{ display: 'flex', gap: 10 }}>
              {['Indonesia', 'English'].map(lang => (
                <button
                  key={lang}
                  onClick={() => update('bahasa', lang)}
                  style={{
                    flex: 1, padding: '10px', borderRadius: 10, fontSize: 14, fontWeight: 500,
                    cursor: 'pointer', transition: 'all 0.2s',
                    background: form.bahasa === lang ? 'var(--color-primary)' : 'var(--color-bg)',
                    color: form.bahasa === lang ? '#fff' : 'var(--color-text-secondary)',
                    border: `1.5px solid ${form.bahasa === lang ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  }}
                >
                  {lang === 'Indonesia' ? 'ID Indonesia' : 'EN English'}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              <button className="btn-ghost" onClick={() => setStep(1)} style={{ flex: 1, padding: '13px' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <AppIcon name="arrow-left" size={14} /> Kembali
                </span>
              </button>
              <button className="btn-primary" onClick={handleNext} style={{ flex: 2, padding: '13px', fontSize: 15 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  Lanjut <AppIcon name="arrow-right" size={14} color="#fff" />
                </span>
              </button>
            </div>
          </div>
        )}

        {/* --- STEP 3 --- */}
        {step === 3 && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}><AppIcon name="graduation-cap" size={56} /></div>
            <h2 style={{ margin: '0 0 12px', fontSize: 22, fontWeight: 700, lineHeight: 1.35 }}>
              Siap, <span style={{ color: 'var(--color-primary)' }}>{form.name.split(' ')[0]}</span>!
            </h2>
            <p style={{ margin: '0 0 20px', fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
              Kamu mahasiswa jurusan <strong>{form.jurusan}</strong>, semester <strong>{form.semester}</strong>.<br />
              Leva siap jadi asisten akademikmu. Mulai jelajahi sekarang!
            </p>

            {/* Summary card */}
            <div style={{
              background: 'var(--color-primary-light)', borderRadius: 12,
              padding: '14px 18px', marginBottom: 24, textAlign: 'left',
            }}>
              {[
                { label: 'Nama',    val: form.name },
                { label: 'Jurusan', val: form.jurusan },
                { label: 'Semester',val: `Semester ${form.semester}` },
                { label: 'Bahasa',  val: form.bahasa },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '5px 0', borderBottom: '1px solid rgba(108,99,255,0.15)' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>{row.label}</span>
                  <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{row.val}</span>
                </div>
              ))}
            </div>

            <button
              onClick={handleStart}
              style={{
                width: '100%', padding: '14px', borderRadius: 12, border: 'none',
                background: 'var(--color-secondary)', color: '#fff',
                fontSize: 16, fontWeight: 700, cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#059669'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--color-secondary)'}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                Masuk ke Dashboard <AppIcon name="arrow-right" size={14} color="#fff" />
              </span>
            </button>

            <button className="btn-ghost" onClick={() => setStep(2)} style={{ width: '100%', marginTop: 10 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <AppIcon name="arrow-left" size={14} /> Edit Data
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

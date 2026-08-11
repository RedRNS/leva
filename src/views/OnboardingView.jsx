import { useEffect, useMemo, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import AppIcon from '../components/AppIcon';
import { playSoundEffect } from '../utils/sound';

const MAJOR_OPTIONS = [
  'Computer Science',
  'Information Systems',
  'Electrical Engineering',
  'Civil Engineering',
  'Mechanical Engineering',
  'Management',
  'Accounting',
  'Communication Studies',
  'Business Administration',
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'Law',
  'Psychology',
  'Education',
  'Sociology',
];

const SEMESTER_OPTIONS = Array.from({ length: 8 }, (_, i) => `${i + 1}`);

export default function OnboardingView() {
  const { setUser, setActiveView, showToast, soundEnabled } = useApp();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: '', jurusan: '', semester: '', bahasa: 'Indonesia' });
  const [errors, setErrors] = useState({});
  const [stepAnimationClass, setStepAnimationClass] = useState('');
  const [showStep3Confetti, setShowStep3Confetti] = useState(false);
  const [majorQuery, setMajorQuery] = useState('');
  const [isMajorOpen, setIsMajorOpen] = useState(false);
  const [majorHighlightIndex, setMajorHighlightIndex] = useState(-1);
  const nameInputRef = useRef(null);
  const majorBoxRef = useRef(null);
  const majorInputRef = useRef(null);
  const semesterChipRefs = useRef([]);
  const bahasaToggleRefs = useRef([]);

  const step3ConfettiPieces = useMemo(
    () => Array.from({ length: 24 }, (_, index) => {
      const colors = ['#6C47FF', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4'];
      return {
        id: `step3-confetti-${index}`,
        left: `${(index * 11) % 100}%`,
        delay: `${(index % 7) * 0.08}s`,
        duration: `${1.2 + (index % 5) * 0.18}s`,
        color: colors[index % colors.length],
      };
    }),
    []
  );

  const filteredMajors = useMemo(() => {
    const normalizedQuery = majorQuery.trim().toLowerCase();
    if (!normalizedQuery) return MAJOR_OPTIONS;
    return MAJOR_OPTIONS.filter((option) => option.toLowerCase().includes(normalizedQuery));
  }, [majorQuery]);

  useEffect(() => {
    if (!form.jurusan) {
      setMajorQuery('');
      return;
    }

    setMajorQuery(form.jurusan);
  }, [form.jurusan]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!majorBoxRef.current?.contains(event.target)) {
        setIsMajorOpen(false);
        setMajorHighlightIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  useEffect(() => {
    if (step === 1) nameInputRef.current?.focus();
  }, [step]);

  useEffect(() => {
    if (!stepAnimationClass) return;

    const clearTimer = setTimeout(() => setStepAnimationClass(''), 320);
    return () => clearTimeout(clearTimer);
  }, [stepAnimationClass]);

  useEffect(() => {
    if (step !== 3) {
      setShowStep3Confetti(false);
      return;
    }

    /* UI/UX Fix: Step 6 — Speaker output device (sound feedback) for positive reinforcement. Micro-animations provide psychological rewards, supporting the habit loop. 47.5% of users work late at night — small dopamine hits help. */
    if (soundEnabled) playSoundEffect('chime');
    setShowStep3Confetti(true);

    const confettiTimer = setTimeout(() => setShowStep3Confetti(false), 2000);
    return () => clearTimeout(confettiTimer);
  }, [step, soundEnabled]);

  useEffect(() => {
    const handleGlobalEscape = () => {
      setIsMajorOpen(false);
      setMajorHighlightIndex(-1);
    };

    window.addEventListener('leva:escape', handleGlobalEscape);
    return () => window.removeEventListener('leva:escape', handleGlobalEscape);
  }, []);

  const update = (key, val) => {
    setForm(f => ({ ...f, [key]: val }));
    setErrors(e => ({ ...e, [key]: '' }));
  };

  const selectMajor = (major) => {
    update('jurusan', major);
    setMajorQuery(major);
    setIsMajorOpen(false);
    setMajorHighlightIndex(-1);
  };

  const clearMajor = () => {
    update('jurusan', '');
    setMajorQuery('');
    setIsMajorOpen(false);
    setMajorHighlightIndex(-1);
    majorInputRef.current?.focus();
  };

  const handleMajorTyping = (value) => {
    setMajorQuery(value);
    setIsMajorOpen(true);
    setMajorHighlightIndex(0);
    setErrors((prev) => ({ ...prev, jurusan: '' }));
    setForm((prev) => ({ ...prev, jurusan: prev.jurusan.toLowerCase() === value.trim().toLowerCase() ? prev.jurusan : '' }));
  };

  const handleMajorKeyDown = (event) => {
    if (!isMajorOpen && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
      setIsMajorOpen(true);
      setMajorHighlightIndex(0);
      event.preventDefault();
      return;
    }

    if (event.key === 'ArrowDown' && filteredMajors.length > 0) {
      event.preventDefault();
      setMajorHighlightIndex((prev) => Math.min(prev + 1, filteredMajors.length - 1));
      return;
    }

    if (event.key === 'ArrowUp' && filteredMajors.length > 0) {
      event.preventDefault();
      setMajorHighlightIndex((prev) => Math.max(prev - 1, 0));
      return;
    }

    if (event.key === 'Enter' && isMajorOpen && majorHighlightIndex >= 0 && filteredMajors[majorHighlightIndex]) {
      event.preventDefault();
      selectMajor(filteredMajors[majorHighlightIndex]);
      return;
    }

    if (event.key === 'Escape') {
      setIsMajorOpen(false);
      setMajorHighlightIndex(-1);
    }
  };

  const handleSemesterKeyDown = (event, index) => {
    const columns = window.matchMedia('(max-width: 768px)').matches ? 1 : 4;
    let nextIndex = index;

    if (event.key === 'ArrowRight') nextIndex = Math.min(index + 1, SEMESTER_OPTIONS.length - 1);
    if (event.key === 'ArrowLeft') nextIndex = Math.max(index - 1, 0);
    if (event.key === 'ArrowDown') nextIndex = Math.min(index + columns, SEMESTER_OPTIONS.length - 1);
    if (event.key === 'ArrowUp') nextIndex = Math.max(index - columns, 0);

    if (nextIndex !== index) {
      event.preventDefault();
      update('semester', SEMESTER_OPTIONS[nextIndex]);
      semesterChipRefs.current[nextIndex]?.focus();
      return;
    }

    if (event.key === 'Enter' || event.key === ' ' || event.key === 'Spacebar') {
      event.preventDefault();
      update('semester', SEMESTER_OPTIONS[index]);
    }
  };

  const handleBahasaKeyDown = (event, index) => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      const nextIndex = Math.min(index + 1, 1);
      const nextValue = nextIndex === 0 ? 'Indonesia' : 'English';
      update('bahasa', nextValue);
      bahasaToggleRefs.current[nextIndex]?.focus();
      return;
    }

    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      const nextIndex = Math.max(index - 1, 0);
      const nextValue = nextIndex === 0 ? 'Indonesia' : 'English';
      update('bahasa', nextValue);
      bahasaToggleRefs.current[nextIndex]?.focus();
      return;
    }

    if (event.key === 'Enter' || event.key === ' ' || event.key === 'Spacebar') {
      event.preventDefault();
      update('bahasa', index === 0 ? 'Indonesia' : 'English');
    }
  };

  const validateStep1 = () => {
    if (!form.name.trim()) {
      setErrors((prev) => ({ ...prev, name: 'Name cannot be empty. Please enter your full name to continue.' }));
      nameInputRef.current?.focus();
      return false;
    }

    return true;
  };

  const validateStep2 = () => {
    const e = {};
    if (!form.jurusan)  e.jurusan  = 'Please select your major first.';
    if (!form.semester) e.semester = 'Please select your semester.';
    if (Object.keys(e).length) { setErrors(e); return false; }
    return true;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStepAnimationClass('onboarding-slide-next');
      setStep(2);
    }

    if (step === 2 && validateStep2()) {
      setStepAnimationClass('onboarding-slide-next');
      setStep(3);
    }
  };

  const goToPreviousStep = (nextStep) => {
    setStepAnimationClass('onboarding-slide-back');
    setStep(nextStep);
  };

  const handleGoogleContinue = () => {
    showToast('Google Sign-In coming soon!', 'info');
  };

  const handleStart = () => {
    setUser(form);
    setActiveView('dashboard');
  };

  // -- Shared input style
  const inputStyle = (hasError) => ({
    width: '100%',
    padding: '12px 16px',
    height: 48,
    border: `1px solid ${hasError ? '#DC2626' : '#E5E7EB'}`,
    borderRadius: 8,
    fontSize: 14,
    outline: 'none', color: 'var(--color-text-primary)',
    background: '#fff',
    transition: 'border 0.2s, box-shadow 0.2s',
    boxSizing: 'border-box',
  });

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

  const isStep1Complete = form.name.trim().length > 0;
  const isStep2Complete = Boolean(form.jurusan && form.semester);
  const STEP_DOT_TOOLTIP = {
    1: '1. Name',
    2: '2. Academic Info',
    3: '3. Confirmation',
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #6C47FF 0%, #8B5CF6 50%, #A78BFA 100%)',
      padding: 24,
    }}>
      <div className="card" style={{ width: '100%', maxWidth: 464, padding: 24, position: 'relative', overflow: 'hidden' }}>

        {step === 3 && showStep3Confetti && (
          <div className="onboarding-confetti-layer" aria-hidden="true">
            {step3ConfettiPieces.map((piece) => (
              <span
                key={piece.id}
                className="onboarding-confetti-piece"
                style={{
                  left: piece.left,
                  background: piece.color,
                  animationDelay: piece.delay,
                  animationDuration: piece.duration,
                }}
              />
            ))}
          </div>
        )}

        <div className={`onboarding-step-panel ${stepAnimationClass}`}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}><AppIcon name="sparkles" size={30} /></div>
          <span style={{ fontSize: 26, fontWeight: 800, color: 'var(--color-primary)', letterSpacing: '-0.5px' }}>
            Leva
          </span>
          <p style={{ margin: '8px 0 0', fontSize: 12, color: '#6B7280' }}>
            Your Cognitive Lever for Academic Excellence
          </p>
          <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6B7280', fontWeight: 600 }}>
            Your Smart Academic Assistant
          </p>
        </div>

        {/* Step Dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
          {[1, 2, 3].map(s => (
            <span
              key={s}
              className={`tooltip-host ${s === step ? 'tooltip-active' : ''}`}
              data-tooltip={STEP_DOT_TOOLTIP[s]}
              tabIndex={0}
              aria-label={STEP_DOT_TOOLTIP[s]}
              style={{ display: 'inline-flex' }}
            >
              <span style={{
                width: s === step ? 24 : 8, height: 8, borderRadius: 4,
                background: s <= step ? 'var(--color-primary)' : 'var(--color-border)',
                transition: 'all 0.3s ease',
                cursor: 'help',
              }} />
            </span>
          ))}
        </div>
        <p style={{ margin: '0 0 16px', textAlign: 'center', fontSize: 12, color: 'var(--color-text-peripheral)' }}>
          Step {step} of 3
        </p>

        {/* --- STEP 1 --- */}
        {step === 1 && (
          <div>
            <h2 style={{ margin: '0 0 8px', fontSize: 24, fontWeight: 700, textAlign: 'center', color: '#111827' }}>
              Hey! Introduce yourself first
            </h2>
            <p style={{ margin: '0 0 24px', fontSize: 14, color: '#6B7280', textAlign: 'center' }}>
              Leva needs a little info to personalize your learning experience.
            </p>

            <label style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)', display: 'block', marginBottom: 4 }}>
              Your full name
            </label>
            <input
              ref={nameInputRef}
              autoFocus
              autoComplete="name"
              value={form.name}
              onChange={e => update('name', e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleNext()}
              placeholder="e.g., Renisa Assyifa Putri"
              aria-invalid={!!errors.name}
              style={inputStyle(!!errors.name)}
              onFocus={(event) => {
                event.target.style.borderColor = 'var(--color-primary)';
                event.target.style.boxShadow = '0 0 0 4px rgba(196, 181, 253, 0.55)';
              }}
              onBlur={(event) => {
                event.target.style.borderColor = errors.name ? '#DC2626' : 'var(--color-border)';
                event.target.style.boxShadow = 'none';
              }}
            />
            {errText('name')}

            <button
              className="btn-primary"
              onClick={handleNext}
              aria-disabled={!isStep1Complete}
              style={{
                width: '100%',
                height: 48,
                padding: '0 16px',
                marginTop: 24,
                fontSize: 14,
                borderRadius: 8,
                background: isStep1Complete ? 'var(--color-primary)' : '#D1D5DB',
                color: isStep1Complete ? '#FFFFFF' : '#9CA3AF',
                border: 'none',
                opacity: isStep1Complete ? 1 : 0.6,
                cursor: isStep1Complete ? 'pointer' : 'not-allowed',
              }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                Continue <AppIcon name="arrow-right" size={14} color="#fff" />
              </span>
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '16px 0' }}>
              <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
              <span style={{ fontSize: 12, color: 'var(--color-text-secondary)', fontWeight: 600 }}>or</span>
              <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
            </div>

            <button
              type="button"
              onClick={handleGoogleContinue}
              style={{
                width: '100%',
                height: 48,
                padding: '0 16px',
                marginTop: 0,
                borderRadius: 8,
                border: '1px solid #E5E7EB',
                background: '#fff',
                color: '#374151',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                transition: 'background 0.2s ease',
              }}
              onMouseEnter={(event) => {
                event.currentTarget.style.background = '#F9FAFB';
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.background = '#fff';
              }}
            >
              <AppIcon name="google" size={14} /> Or continue with Google
            </button>
          </div>
        )}

        {/* --- STEP 2 --- */}
        {step === 2 && (
          <div>
            <h2 style={{ margin: '0 0 8px', fontSize: 24, fontWeight: 700, textAlign: 'center', color: '#111827' }}>
              Your Academic Info
            </h2>
            <p style={{ margin: '0 0 24px', fontSize: 14, color: '#6B7280', textAlign: 'center' }}>
              This helps Leva recommend the most relevant tools for you.
            </p>

            {/* Major */}
            <label style={{ fontSize: 14, fontWeight: 600, display: 'block', marginBottom: 4 }}>Major</label>
            {/* UI/UX Fix: Step 7 — Combo box combines text entry + list box for quick search. Radio button grid displays all options at once (display as many choices as possible). */}
            <div ref={majorBoxRef} style={{ position: 'relative' }}>
              <input
                ref={majorInputRef}
                value={majorQuery}
                onChange={(event) => handleMajorTyping(event.target.value)}
                onFocus={() => {
                  setIsMajorOpen(true);
                  setMajorHighlightIndex(filteredMajors.length ? 0 : -1);
                }}
                onKeyDown={handleMajorKeyDown}
                onBlur={(event) => {
                  if (!majorBoxRef.current?.contains(event.relatedTarget)) {
                    setIsMajorOpen(false);
                    setMajorHighlightIndex(-1);
                  }
                }}
                placeholder="Type or select your major..."
                role="combobox"
                aria-expanded={isMajorOpen}
                aria-controls="major-combobox-list"
                aria-autocomplete="list"
                aria-invalid={!!errors.jurusan}
                style={{ ...inputStyle(!!errors.jurusan), paddingRight: 64 }}
              />

              {majorQuery && (
                <button
                  type="button"
                  onClick={clearMajor}
                  aria-label="Reset major"
                  style={{
                    position: 'absolute',
                    right: 32,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    border: 'none',
                    background: 'transparent',
                    color: 'var(--color-text-secondary)',
                    cursor: 'pointer',
                    padding: 0,
                    display: 'flex',
                  }}
                >
                  <AppIcon name="x" size={14} />
                </button>
              )}

              <span style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)', pointerEvents: 'none', display: 'flex' }}>
                <AppIcon name="chevron-down" size={14} />
              </span>

              {isMajorOpen && (
                <div
                  id="major-combobox-list"
                  role="listbox"
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    top: 'calc(100% + 8px)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 8,
                    background: '#fff',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    maxHeight: 208,
                    overflowY: 'auto',
                    zIndex: 20,
                  }}
                >
                  {filteredMajors.length === 0 ? (
                    <div style={{ padding: '10px 12px', fontSize: 13, color: 'var(--color-text-secondary)' }}>
                      Major not found
                    </div>
                  ) : (
                    filteredMajors.map((major, index) => {
                      const isHighlighted = index === majorHighlightIndex;
                      return (
                        <button
                          key={major}
                          type="button"
                          role="option"
                          aria-selected={form.jurusan === major}
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => selectMajor(major)}
                          style={{
                            width: '100%',
                            textAlign: 'left',
                            border: 'none',
                            background: isHighlighted ? 'var(--color-primary-light)' : '#fff',
                            color: isHighlighted ? 'var(--color-primary)' : 'var(--color-text-primary)',
                            padding: '8px 16px',
                            cursor: 'pointer',
                            fontSize: 14,
                          }}
                        >
                          {major}
                        </button>
                      );
                    })
                  )}
                </div>
              )}
            </div>
            <p style={{ margin: '8px 0 0', fontSize: 12, color: 'var(--color-text-secondary)' }}>
              Type your major name to search faster
            </p>
            {errText('jurusan')}

            {/* Semester */}
            <label style={{ fontSize: 14, fontWeight: 600, display: 'block', margin: '16px 0 8px' }}>Semester</label>
            <div className="onboarding-semester-grid" role="radiogroup" aria-label="Select semester" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {SEMESTER_OPTIONS.map((semester, index) => {
                const isSelected = form.semester === semester;
                return (
                  <button
                    key={semester}
                    ref={(element) => { semesterChipRefs.current[index] = element; }}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    tabIndex={form.semester ? (isSelected ? 0 : -1) : (index === 0 ? 0 : -1)}
                    onKeyDown={(event) => handleSemesterKeyDown(event, index)}
                    onClick={() => update('semester', semester)}
                    style={{
                      height: 40,
                      padding: '0 8px',
                      borderRadius: 8,
                      border: `1.5px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                      background: isSelected ? 'var(--color-primary)' : '#fff',
                      color: isSelected ? '#fff' : 'var(--color-text-secondary)',
                      cursor: 'pointer',
                      fontSize: 14,
                      fontWeight: 600,
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(event) => {
                      if (!isSelected) event.currentTarget.style.borderColor = '#C4B5FD';
                    }}
                    onMouseLeave={(event) => {
                      if (!isSelected) event.currentTarget.style.borderColor = 'var(--color-border)';
                    }}
                  >
                    Semester {semester}
                  </button>
                );
              })}
            </div>
            <p style={{ margin: '8px 0 0', fontSize: 12, color: 'var(--color-text-secondary)' }}>
              Regular undergraduate program = 8 semesters
            </p>
            {errText('semester')}

            {/* Language */}
            <label style={{ fontSize: 14, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 8, margin: '16px 0 8px' }}>
              <span>Language Preference</span>
              <span
                className="tooltip-host tooltip-help-icon"
                data-tooltip="Leva's interface and tool recommendations will follow this preference."
                aria-label="Language preference info"
                tabIndex={0}
              >
                ?
              </span>
            </label>
            <div role="radiogroup" aria-label="Language preference" style={{ display: 'flex', gap: 8 }}>
              {['Indonesia', 'English'].map((lang, index) => (
                <button
                  key={lang}
                  ref={(element) => { bahasaToggleRefs.current[index] = element; }}
                  type="button"
                  role="radio"
                  aria-checked={form.bahasa === lang}
                  tabIndex={form.bahasa === lang ? 0 : -1}
                  onClick={() => update('bahasa', lang)}
                  onKeyDown={(event) => handleBahasaKeyDown(event, index)}
                  style={{
                    flex: 1, height: 40, padding: '0 8px', borderRadius: 8, fontSize: 14, fontWeight: 500,
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
            <p style={{ margin: '8px 0 0', fontSize: 12, color: 'var(--color-text-secondary)' }}>
              Leva's interface and tool recommendations will follow this preference.
            </p>

            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              <button className="btn-secondary" onClick={() => goToPreviousStep(1)} style={{ flex: 1, height: 48, borderRadius: 8 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <AppIcon name="arrow-left" size={14} /> Back
                </span>
              </button>
              <button
                className="btn-primary"
                onClick={handleNext}
                aria-disabled={!isStep2Complete}
                style={{
                  flex: 2,
                  height: 48,
                  padding: '0 16px',
                  fontSize: 14,
                  borderRadius: 8,
                  background: isStep2Complete ? 'var(--color-primary)' : '#D1D5DB',
                  color: isStep2Complete ? '#FFFFFF' : '#9CA3AF',
                  border: 'none',
                  opacity: isStep2Complete ? 1 : 0.6,
                  cursor: isStep2Complete ? 'pointer' : 'not-allowed',
                  transition: 'filter 0.2s ease',
                }}
                onMouseEnter={(event) => {
                  if (isStep2Complete) event.currentTarget.style.filter = 'brightness(1.04)';
                }}
                onMouseLeave={(event) => {
                  if (isStep2Complete) event.currentTarget.style.filter = 'none';
                }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  Continue <AppIcon name="arrow-right" size={14} color="#fff" />
                </span>
              </button>
            </div>
          </div>
        )}

        {/* --- STEP 3 --- */}
        {step === 3 && (
          <div style={{ textAlign: 'center' }}>
            <div aria-hidden="true" style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 16 }}>
              {['#6C47FF', '#F59E0B', '#10B981', '#8B5CF6', '#EC4899'].map((color, idx) => (
                <span key={color + idx} style={{ width: 8, height: 8, borderRadius: '50%', background: color, opacity: 0.7 }} />
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}><AppIcon name="graduation-cap" size={48} /></div>
            <h2 style={{ margin: '0 0 16px', fontSize: 24, fontWeight: 700, lineHeight: 1.35, color: '#111827' }}>
              All set, <span style={{ color: 'var(--color-primary)' }}>{form.name.split(' ')[0]}</span>!
            </h2>
            <p style={{ margin: '0 0 24px', fontSize: 14, color: '#6B7280', lineHeight: 1.6 }}>
              You're a <strong>{form.jurusan}</strong> student, semester <strong>{form.semester}</strong>.<br />
              Leva is ready to be your academic assistant. Start exploring now!
            </p>

            {/* Summary card */}
            <div style={{
              background: '#F9FAFB', borderRadius: 8,
              padding: 16, marginBottom: 24, textAlign: 'left',
            }}>
              {[
                { label: 'Name',    val: form.name },
                { label: 'Major', val: form.jurusan },
                { label: 'Semester',val: `Semester ${form.semester}` },
                { label: 'Language',  val: form.bahasa },
              ].map((row, index, arr) => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, padding: '12px 0', borderBottom: index < arr.length - 1 ? '1px solid #E5E7EB' : 'none' }}>
                  <span style={{ color: '#6B7280' }}>{row.label}</span>
                  <span style={{ fontWeight: 600, color: '#111827' }}>{row.val}</span>
                </div>
              ))}
            </div>

            <p style={{ margin: '0 0 16px', fontSize: 12, color: '#6B7280', fontStyle: 'italic' }}>
              Don't worry, you can change this anytime on the Profile page.
            </p>

            <button
              onClick={handleStart}
              style={{
                width: '100%', height: 48, padding: '0 16px', borderRadius: 8, border: 'none',
                background: '#065F46', color: '#fff',
                fontSize: 14, fontWeight: 700, cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#059669'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--color-secondary)'}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                Go to Dashboard <AppIcon name="arrow-right" size={14} color="#fff" />
              </span>
            </button>

            <button className="btn-secondary" onClick={() => goToPreviousStep(2)} style={{ width: '100%', height: 48, marginTop: 16 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <AppIcon name="arrow-left" size={14} /> Edit Data
              </span>
            </button>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}

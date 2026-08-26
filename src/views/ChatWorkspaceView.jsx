import { useEffect, useMemo, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { mockSubTasks, mockTools } from '../data/mockData';
import AppIcon from '../components/AppIcon';
import Modal from '../components/Modal';
import { playSoundEffect } from '../utils/sound';

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

const MAX_ATTACHMENT_SIZE_BYTES = 10 * 1024 * 1024;
const ACCEPTED_ATTACHMENT_EXTENSIONS = ['pdf', 'txt'];
const QUICK_PROMPTS_BY_JURUSAN = {
  computerScience: ['Help me plan my thesis', 'Debug Python code', 'Review IEEE journal', 'Learn a new framework'],
  communicationStudies: ['Analyze media content', 'Draft research proposal', 'Review communication theory', 'Create essay outline'],
  default: ['Help me plan my thesis', 'How to learn coding from scratch', 'Write a professional ethics essay', 'Analyze related journals'],
};

const getFileExtension = (fileName = '') => fileName.split('.').pop()?.toLowerCase() || '';

const validateAttachment = (file) => {
  if (!file) return 'Please select a file first.';
  if (file.size > MAX_ATTACHMENT_SIZE_BYTES) {
    const fileSizeMb = (file.size / (1024 * 1024)).toFixed(1);
    return `Maximum file size is 10MB. Your file is ${fileSizeMb}MB. Try compressing it first.`;
  }

  const extension = getFileExtension(file.name);
  if (!ACCEPTED_ATTACHMENT_EXTENSIONS.includes(extension)) {
    return 'File format not supported. Currently Leva accepts PDF and TXT files.';
  }

  return '';
};

const getGeneratedTaskTitle = (text, jurusan, attachedFile) => {
  const raw = text.toLowerCase();

  if (attachedFile?.name) return `Breaking Down Task from ${attachedFile.name}`;
  if (raw.includes('skripsi') || raw.includes('thesis')) return `Writing Thesis — ${jurusan}`;
  if (raw.includes('essay')) return `Writing Essay — ${jurusan}`;
  if (raw.includes('koding') || raw.includes('coding')) return 'Learning Coding from Scratch';
  if (raw.includes('resume')) return 'Creating Internship Resume';

  return 'Completing Academic Task';
};

const getEstimatedProcessingMs = ({ text, attachedFile }) => {
  const baseMs = 12000;
  const textComplexityMs = Math.min(text.trim().length * 45, 15000);
  const attachmentMs = attachedFile ? 5000 : 0;
  return Math.min(baseMs + textComplexityMs + attachmentMs, 32000);
};

const getProcessingMessage = (elapsedSeconds) => {
  if (elapsedSeconds < 5) return 'Leva is reading your task...';
  if (elapsedSeconds < 15) return 'Breaking down task into small steps...';
  if (elapsedSeconds < 30) return 'Finding the most relevant AI tools...';
  return 'Almost done, please wait a moment...';
};

const RAG_ERROR_MESSAGE = 'Sorry, Leva cannot process your task right now. Please try again or rewrite with a more specific description.';

// --- Subtask Card
function SubTaskCard({ task, index, isExpanded, onToggle, onMarkDone, onSaveTool, isDoneJustNow }) {
  const tools = mockTools.filter(t => task.toolIds.includes(t.id));
  const ts = tagStyle(task.category);
  const [isHeaderHovered, setIsHeaderHovered] = useState(false);
  const isDone = task.status === 'done';
  const isActive = !isDone && isExpanded;

  const headerBgColor = isExpanded
    ? 'var(--color-primary-light)'
    : isHeaderHovered
      ? '#F1F5F9'
      : '#F8FAFC';

  return (
    <div className={`card ${isDoneJustNow ? 'subtask-card-highlight' : ''}`} style={{ marginBottom: 16, overflow: 'hidden', transition: 'box-shadow 0.2s', borderRadius: 8 }}>
      {/* Card Header */}
      <div
        onClick={onToggle}
        onMouseEnter={() => setIsHeaderHovered(true)}
        onMouseLeave={() => setIsHeaderHovered(false)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onToggle();
          }
        }}
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
        /* UI/UX Fix: Step 6 — Hotspot must be easily recognizable (accordion). Step 7 — Destructive actions (reset) need safeguard. Clickable statistics improve cross-screen connectivity. */
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: 16, cursor: 'pointer',
          background: headerBgColor,
          transition: 'background 0.2s',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Step number */}
          <div
            aria-label={isDone ? 'Subtask completed' : isActive ? 'Subtask active' : 'Subtask not started'}
            style={{
              width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
              background: isDone ? 'var(--color-secondary)' : isActive ? 'var(--color-primary-light)' : 'transparent',
              border: isDone ? 'none' : `2px solid ${isActive ? 'var(--color-primary)' : 'var(--color-border)'}`,
              color: isDone ? '#fff' : isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 700,
            }}
          >
            {isDone ? <AppIcon name="check" size={14} color="#fff" aria-hidden="true" /> : (isActive ? index + 1 : null)}
          </div>
          <span style={{ fontWeight: 600, fontSize: 16, color: 'var(--color-text-primary)' }}>
            {task.title}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {task.status === 'done'
            ? <span className={`badge-done ${isDoneJustNow ? 'badge-done-pop' : ''}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>Done <AppIcon name="check" size={12} color="var(--color-secondary)" /></span>
            : (
              <span
                className="badge-next tooltip-host"
                data-tooltip="Continue to next subtask"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
              >
                Next Section <AppIcon name="arrow-right" size={12} />
              </span>
            )
          }
          <span style={{
            color: 'var(--color-text-secondary)', fontSize: 18, display: 'flex',
            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)',
            transition: 'transform 0.3s',
          }}><AppIcon name="chevron-down" size={16} /></span>
        </div>
      </div>

      {/* Expandable Content */}
      <div className={`subtask-content ${isExpanded ? 'open' : ''}`}>
        <div style={{ padding: 16, borderTop: '1px solid #E5E7EB' }}>
          {/* Meta row */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <span style={{ fontSize: 12, fontWeight: 600, padding: '0 10px', height: 24, borderRadius: 12, display: 'inline-flex', alignItems: 'center', ...ts }}>
              {task.category}
            </span>
            <span style={{ fontSize: 12, color: 'var(--color-text-secondary)', padding: '0 10px', height: 24, background: 'var(--color-bg)', borderRadius: 12, display: 'inline-flex', alignItems: 'center' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><AppIcon name="clock" size={12} /> {task.estimate}</span>
            </span>
          </div>

          {/* Description */}
          <p style={{ margin: '0 0 16px', fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
            {task.description}
          </p>

          {/* Action button */}
          {task.status !== 'done' ? (
            <button
              className="btn-primary"
              onClick={() => onMarkDone(task.id)}
              style={{ height: 40, padding: '0 16px', fontSize: 14, borderRadius: 8, display: 'inline-flex', alignItems: 'center', gap: 8 }}
            >
              <AppIcon name="check" size={14} color="#fff" /> Mark as Done
            </button>
          ) : (
            <button
              className="btn-secondary"
              onClick={() => onMarkDone(task.id)}
              style={{ height: 40, padding: '0 16px', fontSize: 14, borderRadius: 8, display: 'inline-flex', alignItems: 'center', gap: 8 }}
            >
              <AppIcon name="undo" size={14} /> Unmark
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Right Panel: Tool Recommendations
function RightPanel({ task, isOpen, onSave, savedToolNames, onCopyTips, copiedTipsTaskId }) {
  const tools = task ? mockTools.filter(t => task.toolIds.includes(t.id)) : [];

  return (
    <div
      className={`right-panel ${isOpen ? 'open' : ''}`}
      style={{
        width: isOpen ? 280 : 0,
        minWidth: isOpen ? 280 : 0,
        height: '100%',
        background: 'var(--color-surface)',
        borderLeft: isOpen ? '1px solid #E5E7EB' : 'none',
        overflowY: 'auto',
        overflowX: 'hidden',
        position: 'sticky', top: 0,
        padding: isOpen ? 16 : 0,
        pointerEvents: isOpen ? 'auto' : 'none',
        transition: 'width 0.3s ease, min-width 0.3s ease',
      }}
    >
      {!isOpen || !task ? null : (
        <>
          {/* Tool Recommendations */}
          <div style={{ marginBottom: 24 }}>
            <p style={{ margin: '0 0 16px', fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', letterSpacing: '0.07em' }}>
              AI TOOL RECOMMENDATIONS
            </p>
            {tools.map(tool => {
              const isSaved = savedToolNames.has(tool.name.toLowerCase());

              return (
              <div
                key={tool.id}
                className="card"
                style={{ padding: 16, marginBottom: 16, border: '1px solid #E5E7EB', borderRadius: 8 }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ display: 'flex' }}><AppIcon name={tool.iconKey} size={18} /></span>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{tool.name}</span>
                  </div>
                  <a
                    href={`https://${tool.url}`} target="_blank" rel="noreferrer"
                    aria-label={`Open ${tool.name}`}
                    style={{ display: 'flex', color: 'var(--color-primary)', textDecoration: 'none' }}
                  ><AppIcon name="external-link" size={14} /></a>
                </div>
                <p style={{ margin: '8px 0 16px', fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                  {tool.desc.slice(0, 70)}...
                </p>
                <button
                  disabled={isSaved}
                  onClick={() => onSave(tool)}
                  style={{
                    width: '100%',
                    height: 40,
                    padding: '0 12px',
                    fontSize: 12,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    borderRadius: 8,
                    border: isSaved ? '1px solid #C4B5FD' : '1px solid #D7D2FF',
                    background: isSaved ? '#EDE9FE' : '#fff',
                    color: 'var(--color-primary)',
                    fontWeight: 600,
                    cursor: isSaved ? 'not-allowed' : 'pointer',
                  }}
                >
                  <AppIcon name="bookmark" size={16} color="var(--color-primary)" filled={isSaved} aria-hidden="true" />
                  {isSaved ? 'Saved ✓' : 'Save to Library'}
                </button>
              </div>
              );
            })}
          </div>

          {/* Usage Tips */}
          <div style={{
            background: '#FEF3C7',
            border: '1px solid #FDE68A',
            borderLeft: '4px solid #F59E0B',
            borderRadius: 8, padding: 12, marginBottom: 16,
          }}>
            <p style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 700, color: '#92400E' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <AppIcon name="lamp" size={14} color="#92400E" aria-hidden="true" />
                HOW TO USE THIS TOOL
              </span>
            </p>
            <p style={{ margin: 0, fontSize: 12, color: '#78350F', lineHeight: 1.6 }}>
              {task.tips}
            </p>
          </div>

          {/* Quick Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button
              className="btn-ghost"
              style={{ fontSize: 12, padding: '8px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              onClick={() => onCopyTips(task)}
            >
              <AppIcon name="copy" size={12} /> {copiedTipsTaskId === task.id ? '✓ Copied!' : 'Copy Prompt Tips'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// --- Main Chat Workspace View
export default function ChatWorkspaceView() {
  const {
    user,
    activeTask,
    setActiveTask,
    setActiveView,
    setChatHasDraft,
    saveToolToLibrary,
    savedTools,
    showToast,
    soundEnabled,
  } = useApp();
  const firstName = user ? user.name.split(' ')[0] : 'Renisa';
  const jurusan   = user ? user.jurusan : 'Computer Science';

  const [inputVal, setInputVal]         = useState('');
  const [taskTitle, setTaskTitle]       = useState('');
  const [subTasks, setSubTasks]         = useState([]);
  const [expandedId, setExpandedId]     = useState(null);
  const [isLoading, setIsLoading]       = useState(false);
  const [followUpVal, setFollowUpVal]   = useState('');
  const [followUpReply, setFollowUpReply] = useState('');
  const [attachedFile, setAttachedFile] = useState(null);
  const [fileError, setFileError]       = useState('');
  const [ragError, setRagError]         = useState('');
  const [lastSubmission, setLastSubmission] = useState(null);
  const [loadingElapsedSeconds, setLoadingElapsedSeconds] = useState(0);
  const [estimatedProcessingSeconds, setEstimatedProcessingSeconds] = useState(15);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [copiedTipsTaskId, setCopiedTipsTaskId] = useState(null);
  const [showCompletionOverlay, setShowCompletionOverlay] = useState(false);
  const [showCompletionConfetti, setShowCompletionConfetti] = useState(false);
  const [justCompletedTaskIds, setJustCompletedTaskIds] = useState([]);
  const [showLeaveDraftModal, setShowLeaveDraftModal] = useState(false);
  const [pendingLeaveTarget, setPendingLeaveTarget] = useState(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const dragCounterRef = useRef(0);
  const copyResetTimerRef = useRef(null);
  const followUpTextareaRef = useRef(null);
  const completionPrimaryActionRef = useRef(null);
  const hasUnsentDraftRef = useRef(false);
  const hasPushedBackGuardRef = useRef(false);
  const allowExternalLeaveRef = useRef(false);
  const completionAnimationTimersRef = useRef([]);
  const hasCelebratedAllDoneRef = useRef(false);

  const completionConfettiPieces = useMemo(
    () => Array.from({ length: 28 }, (_, index) => {
      const colors = ['#6C47FF', '#10B981', '#F59E0B', '#14B8A6', '#EC4899', '#3B82F6'];
      return {
        id: `completion-confetti-${index}`,
        left: `${(index * 9) % 100}%`,
        delay: `${(index % 8) * 0.07}s`,
        duration: `${1.1 + (index % 6) * 0.16}s`,
        color: colors[index % colors.length],
      };
    }),
    []
  );

  const resetWorkspace = () => {
    setTaskTitle('');
    setSubTasks([]);
    setExpandedId(null);
    setIsLoading(false);
    setInputVal('');
    setFollowUpVal('');
    setFollowUpReply('');
    setAttachedFile(null);
    setFileError('');
    setRagError('');
    setLastSubmission(null);
    setLoadingElapsedSeconds(0);
    setEstimatedProcessingSeconds(15);
    setShowLeaveDraftModal(false);
    setPendingLeaveTarget(null);
    setIsDraggingFile(false);
    setCopiedTipsTaskId(null);
    setShowCompletionOverlay(false);
    setShowCompletionConfetti(false);
    setJustCompletedTaskIds([]);
    completionAnimationTimersRef.current.forEach((timerId) => clearTimeout(timerId));
    completionAnimationTimersRef.current = [];
    hasCelebratedAllDoneRef.current = false;
  };

  // Load from history task if set
  useEffect(() => {
    if (activeTask) {
      setTaskTitle('Writing Thesis — ' + jurusan);
      setSubTasks(mockSubTasks.map(t => ({ ...t })));
      setExpandedId(1);
    } else {
      resetWorkspace();
    }
  }, [activeTask]);

  useEffect(() => {
    const handleNewChat = () => resetWorkspace();

    window.addEventListener('leva:new-chat', handleNewChat);
    return () => window.removeEventListener('leva:new-chat', handleNewChat);
  }, []);

  useEffect(() => () => {
    if (copyResetTimerRef.current) clearTimeout(copyResetTimerRef.current);
    completionAnimationTimersRef.current.forEach((timerId) => clearTimeout(timerId));
  }, []);

  const hasUnsentDraft = inputVal.trim().length > 0;

  useEffect(() => {
    hasUnsentDraftRef.current = hasUnsentDraft;
    setChatHasDraft(hasUnsentDraft);
  }, [hasUnsentDraft, setChatHasDraft]);

  useEffect(() => () => {
    setChatHasDraft(false);
  }, [setChatHasDraft]);

  useEffect(() => {
    if (!hasUnsentDraft || hasPushedBackGuardRef.current) return;

    window.history.pushState({ levaChatDraftGuard: true }, '', window.location.href);
    hasPushedBackGuardRef.current = true;
  }, [hasUnsentDraft]);

  useEffect(() => {
    if (hasUnsentDraft) return;
    hasPushedBackGuardRef.current = false;
  }, [hasUnsentDraft]);

  useEffect(() => {
    const handleBackNavigation = () => {
      if (!hasUnsentDraftRef.current || allowExternalLeaveRef.current) return;

      window.history.pushState({ levaChatDraftGuard: true }, '', window.location.href);
      setPendingLeaveTarget('__history_back__');
      setShowLeaveDraftModal(true);
    };

    window.addEventListener('popstate', handleBackNavigation);
    return () => window.removeEventListener('popstate', handleBackNavigation);
  }, []);

  useEffect(() => {
    if (!hasUnsentDraft) return;

    const handleBeforeUnload = (event) => {
      if (allowExternalLeaveRef.current) return;
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsentDraft]);

  useEffect(() => {
    const handleConfirmLeaveChat = (event) => {
      const nextView = event.detail?.nextView;
      if (!hasUnsentDraftRef.current || !nextView) return;

      setPendingLeaveTarget(nextView);
      setShowLeaveDraftModal(true);
    };

    window.addEventListener('leva:confirm-leave-chat', handleConfirmLeaveChat);
    return () => window.removeEventListener('leva:confirm-leave-chat', handleConfirmLeaveChat);
  }, []);

  useEffect(() => {
    if (!isLoading) return;

    const timer = setInterval(() => {
      setLoadingElapsedSeconds((previous) => previous + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isLoading]);

  const applyAttachment = (file) => {
    /* UI/UX Fix: Step 6 — Adding alternative input device (file upload + drag-drop) to reduce cognitive load of breaking down tasks. Survey: 76.3% users spend >15 minutes before starting work. */
    const validationError = validateAttachment(file);

    if (validationError) {
      setAttachedFile(null);
      setFileError(validationError);
      return;
    }

    setAttachedFile(file);
    setFileError('');
    setRagError('');
  };

  const removeAttachment = () => {
    /* UI/UX Fix: Step 7 — Screen-based control with removable chip helps users check and correct files before sending. */
    setAttachedFile(null);
    setFileError('');
  };

  const runMockRag = (submissionPayload) => {
    const text = submissionPayload.text.trim();
    const estimatedMs = getEstimatedProcessingMs(submissionPayload);
    const loweredText = text.toLowerCase();

    const ragPromise = new Promise((resolve, reject) => {
      if (typeof navigator !== 'undefined' && navigator.onLine === false) {
        reject(new Error('offline'));
        return;
      }

      if (loweredText.includes('server error') || loweredText.includes('server gagal')) {
        setTimeout(() => reject(new Error('server-error')), 1200);
        return;
      }

      setTimeout(() => {
        resolve({
          title: getGeneratedTaskTitle(text, jurusan, submissionPayload.attachedFile),
          subTasks: mockSubTasks.map((task) => ({ ...task })),
        });
      }, estimatedMs);
    });

    let timeoutHandle;
    const timeoutPromise = new Promise((_, reject) => {
      timeoutHandle = setTimeout(() => reject(new Error('timeout')), 45000);
    });

    return Promise.race([ragPromise, timeoutPromise]).finally(() => {
      if (timeoutHandle) clearTimeout(timeoutHandle);
    });
  };

  const submitTaskToRag = async (submissionPayload) => {
    const trimmedText = submissionPayload.text.trim();
    if (!trimmedText || isLoading) return;

    const estimatedMs = getEstimatedProcessingMs(submissionPayload);

    setIsLoading(true);
    setRagError('');
    setLoadingElapsedSeconds(0);
    setEstimatedProcessingSeconds(Math.max(15, Math.round(estimatedMs / 1000)));
    setTaskTitle('');
    setSubTasks([]);
    setExpandedId(null);

    try {
      const ragResult = await runMockRag(submissionPayload);
      setTaskTitle(ragResult.title);
      setSubTasks(ragResult.subTasks);
      setExpandedId(1);
      setInputVal('');
      setAttachedFile(null);
      setFileError('');
      setRagError('');
    } catch {
      setRagError(RAG_ERROR_MESSAGE);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePickAttachment = () => {
    if (isLoading) return;
    fileInputRef.current?.click();
  };

  const handleAttachmentInput = (event) => {
    const file = event.target.files?.[0];
    if (file) applyAttachment(file);
    event.target.value = '';
  };

  const handleDragEnter = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (isLoading) return;

    dragCounterRef.current += 1;
    setIsDraggingFile(true);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (isLoading) return;

    dragCounterRef.current = Math.max(0, dragCounterRef.current - 1);
    if (dragCounterRef.current === 0) setIsDraggingFile(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (isLoading) return;

    dragCounterRef.current = 0;
    setIsDraggingFile(false);

    const file = event.dataTransfer.files?.[0];
    if (file) applyAttachment(file);
  };

  const handleSubmit = () => {
    if (isLoading) return;
    if (!inputVal.trim()) return;
    if (fileError) return;

    const submissionPayload = {
      text: inputVal,
      attachedFile,
    };

    setLastSubmission(submissionPayload);
    submitTaskToRag(submissionPayload);
  };

  const handleRetryLastSubmission = () => {
    if (!lastSubmission || isLoading) return;
    submitTaskToRag(lastSubmission);
  };

  const handleStayInChat = () => {
    setShowLeaveDraftModal(false);
    setPendingLeaveTarget(null);
  };

  const handleLeaveFromChat = () => {
    const target = pendingLeaveTarget;

    setShowLeaveDraftModal(false);
    setPendingLeaveTarget(null);

    if (!target) return;

    if (target === '__history_back__') {
      allowExternalLeaveRef.current = true;
      setInputVal('');
      setAttachedFile(null);
      setFileError('');
      setRagError('');

      setTimeout(() => {
        window.history.back();
      }, 0);

      return;
    }

    setActiveView(target, { force: true });
  };

  const toggleExpand = (id) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  const toggleDone = (id) => {
    let isMarkingDone = false;

    setSubTasks(prev =>
      prev.map((taskItem) => {
        if (taskItem.id !== id) return taskItem;

        const nextStatus = taskItem.status === 'done' ? 'next' : 'done';
        if (taskItem.status !== 'done' && nextStatus === 'done') isMarkingDone = true;

        return { ...taskItem, status: nextStatus };
      })
    );

    /* UI/UX Fix: Step 6 — Output device speaker (sound feedback) for positive reinforcement. Micro-animations provide psychological reward, supporting habit loop. 47.5% users work late at night — small dopamine hits help. */
    if (isMarkingDone && soundEnabled) {
      playSoundEffect('chime');
    }

    if (isMarkingDone) {
      setJustCompletedTaskIds((prev) => (prev.includes(id) ? prev : [...prev, id]));

      const timerId = setTimeout(() => {
        setJustCompletedTaskIds((prev) => prev.filter((taskId) => taskId !== id));
      }, 520);
      completionAnimationTimersRef.current.push(timerId);
    }
  };

  const handleFollowUp = () => {
    if (!followUpVal.trim()) return;
    setFollowUpReply('');
    setTimeout(() => {
      setFollowUpReply(
        `For the subtask "${subTasks.find(t => t.id === expandedId)?.title ?? 'this'}", I recommend starting with Perplexity AI — enter your major keywords and ask it to analyze topic trends from 2024-2025. This is far more efficient than manually browsing Google Scholar.`
      );
      setFollowUpVal('');
    }, 1200);
  };

  const autoResizeFollowUpTextarea = (textareaEl) => {
    if (!textareaEl) return;
    textareaEl.style.height = '44px';
    const nextHeight = Math.min(textareaEl.scrollHeight, 150);
    textareaEl.style.height = `${nextHeight}px`;
    textareaEl.style.overflowY = textareaEl.scrollHeight > 150 ? 'auto' : 'hidden';
  };

  useEffect(() => {
    autoResizeFollowUpTextarea(followUpTextareaRef.current);
  }, [followUpVal]);

  const expandedTask  = subTasks.find(t => t.id === expandedId) ?? null;
  const hasResults    = subTasks.length > 0;
  const canSendMessage = inputVal.trim().length > 0;
  const processingMessage = getProcessingMessage(loadingElapsedSeconds);
  const rightPanelOpen = !!expandedTask;
  const savedToolNames = new Set(savedTools.map((tool) => tool.name.toLowerCase()));

  const handleCopyTips = async (task) => {
    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error('Clipboard API not available');
      }

      await navigator.clipboard.writeText(task.tips);
      setCopiedTipsTaskId(task.id);
      showToast('Copied! Prompt tips successfully copied to clipboard.', 'success');

      if (copyResetTimerRef.current) clearTimeout(copyResetTimerRef.current);
      copyResetTimerRef.current = setTimeout(() => setCopiedTipsTaskId(null), 2000);
    } catch {
      showToast('Failed to copy prompt tips.', 'error');
    }
  };

  const completedCount = subTasks.filter(t => t.status === 'done').length;
  const progressPct    = subTasks.length ? Math.round((completedCount / subTasks.length) * 100) : 0;
  const allTasksDone = subTasks.length > 0 && completedCount === subTasks.length;
  const activeStepIndex = subTasks.length ? Math.min(completedCount + 1, subTasks.length) : 0;
  const quickPromptChips = useMemo(() => {
    const normalizedJurusan = jurusan.trim().toLowerCase();

    /* UI/UX Fix: Step 6 — Keyboard shortcuts minimize hand movement (47.5% late-night users). Step 7 — Disabled state = "work the way it looks". Contextual quick prompts reduce 35.6% of complaints about AI being too generic. */
    if (normalizedJurusan.includes('computer science')) return QUICK_PROMPTS_BY_JURUSAN.computerScience;
    if (normalizedJurusan.includes('communication')) return QUICK_PROMPTS_BY_JURUSAN.communicationStudies;

    return QUICK_PROMPTS_BY_JURUSAN.default;
  }, [jurusan]);

  useEffect(() => {
    if (!allTasksDone) {
      hasCelebratedAllDoneRef.current = false;
      setShowCompletionOverlay(false);
      setShowCompletionConfetti(false);
      return;
    }

    if (hasCelebratedAllDoneRef.current) return;
    hasCelebratedAllDoneRef.current = true;

    if (soundEnabled) playSoundEffect('celebration');
    setShowCompletionOverlay(true);
    setShowCompletionConfetti(true);

    const confettiTimer = setTimeout(() => setShowCompletionConfetti(false), 3000);

    return () => {
      clearTimeout(confettiTimer);
    };
  }, [allTasksDone, soundEnabled]);

  useEffect(() => {
    if (!showCompletionOverlay) return;

    completionPrimaryActionRef.current?.focus();
  }, [showCompletionOverlay]);

  const handleViewSummary = () => {
    setShowCompletionOverlay(false);
  };

  const handleStartNewTask = () => {
    window.dispatchEvent(new CustomEvent('leva:new-chat'));
    setActiveTask(null);
    setShowCompletionOverlay(false);
  };

  return (
    <div className="view-enter main-content" style={{ display: 'flex', height: '100%', overflow: 'hidden', position: 'relative', padding: 0 }}>

      {/* -- CENTER PANEL */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        <div className="chat-center" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>

          {/* -- EMPTY STATE */}
          {!hasResults && (
            <div style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              padding: 32, minHeight: 'calc(100vh - 120px)',
            }}>
              <div style={{ display: 'flex', marginBottom: 16 }}>
                <AppIcon name="sparkles" size={64} color="#6C47FF" className="sparkle-pulse" aria-hidden="true" />
              </div>
              <h2 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 700, textAlign: 'center', color: '#111827' }}>
                Hey, {firstName}! Tell us about your task today.
              </h2>
              <p style={{ margin: '0 0 24px', fontSize: 14, color: '#6B7280', textAlign: 'center', maxWidth: 400, lineHeight: 1.65 }}>
                Leva will break it down into small steps and recommend the best AI tools for you.
              </p>

              {/* Main Input */}
              <div style={{ width: '100%', maxWidth: 560, position: 'relative' }}>
                {/* UI/UX Fix: Step 6 — File picker filter prepared for the most common campus task document scenarios used by users. */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.txt"
                  onChange={handleAttachmentInput}
                  style={{ display: 'none' }}
                />

                {attachedFile && (
                  <div
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 8,
                      marginBottom: 10, background: 'var(--color-primary-light)',
                      color: 'var(--color-primary)', borderRadius: 999, padding: '7px 12px',
                      fontSize: 12, fontWeight: 600,
                    }}
                  >
                    <AppIcon name="paperclip" size={12} />
                    <span>{attachedFile.name}</span>
                    <button
                      onClick={removeAttachment}
                      aria-label="Remove file"
                      style={{
                        border: 'none', background: 'transparent', color: 'var(--color-primary)',
                        cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center',
                      }}
                    >
                      <AppIcon name="x" size={13} />
                    </button>
                  </div>
                )}

                <textarea
                  ref={inputRef}
                  value={inputVal}
                  disabled={isLoading}
                  onChange={e => {
                    setInputVal(e.target.value);
                    if (ragError) setRagError('');
                  }}
                  onKeyDown={e => {
                    /* UI/UX Fix: Step 7 — Providing keyboard controls (Enter/Ctrl+Enter) for efficiency on laptop/desktop users. */
                    const shouldSend = e.key === 'Enter' && (e.ctrlKey || !e.shiftKey);
                    if (shouldSend && !isLoading) {
                      e.preventDefault();
                      handleSubmit();
                    }
                  }}
                  placeholder="e.g., I want to write my thesis, or help me write a professional ethics essay..."
                  rows={3}
                  onDragEnter={handleDragEnter}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  style={{
                    width: '100%', padding: '16px 56px',
                    minHeight: 80,
                    border: '1px solid #E5E7EB',
                    borderRadius: 12, fontSize: 14, resize: 'none',
                    outline: 'none', color: 'var(--color-text-primary)',
                    lineHeight: 1.6, boxSizing: 'border-box',
                    transition: 'border 0.2s',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                    background: isLoading ? '#F8FAFC' : '#fff',
                    cursor: isLoading ? 'not-allowed' : 'text',
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
                  onBlur={e  => e.target.style.borderColor = 'var(--color-border)'}
                />

                <button
                  onClick={handlePickAttachment}
                  disabled={isLoading}
                  aria-label="Upload file"
                  className="tooltip-host"
                  data-tooltip="Attach your syllabus PDF or task document"
                  style={{
                    position: 'absolute', left: 16, bottom: 16,
                    background: 'transparent',
                    border: 'none', borderRadius: 8, width: 40, height: 40,
                    cursor: isLoading ? 'default' : 'pointer',
                    color: 'var(--color-primary)', fontSize: 16,
                    display: 'flex', opacity: isLoading ? 0.45 : 1,
                    alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <AppIcon name="paperclip" size={16} />
                </button>

                <button
                  onClick={handleSubmit}
                  disabled={isLoading || !canSendMessage || !!fileError}
                  aria-label="Send message"
                  style={{
                    position: 'absolute', right: 16, bottom: 16,
                    background: canSendMessage ? 'var(--color-primary)' : 'var(--color-border)',
                    border: 'none', borderRadius: 8, width: 40, height: 40,
                    cursor: (isLoading || !canSendMessage || !!fileError) ? 'default' : 'pointer',
                    color: '#fff', fontSize: 16, transition: 'background 0.2s', display: 'flex', opacity: (isLoading || !canSendMessage || !!fileError) ? 0.55 : 1,
                    alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  {isLoading
                    ? <AppIcon name="loader" size={16} color="#fff" className="send-spinner" />
                    : <AppIcon name="send" size={16} color="#fff" />}
                </button>

                {isDraggingFile && !isLoading && (
                  <div
                    className="file-drop-overlay"
                    onDragEnter={handleDragEnter}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    Drop file here
                  </div>
                )}
              </div>

              {fileError && (
                <p style={{ marginTop: 8, fontSize: 12, color: '#DC2626', width: '100%', maxWidth: 560 }}>
                  {fileError}
                </p>
              )}

              {isLoading && (
                <div style={{ marginTop: 8, width: '100%', maxWidth: 560, background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 12, padding: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <span style={{ display: 'inline-flex', marginTop: 2 }}>
                      <AppIcon name="loader" size={16} className="send-spinner" />
                    </span>
                    <div>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                        {processingMessage}
                        <span className="processing-indicator" style={{ marginLeft: 3 }}>
                          <span className="processing-dot">.</span>
                          <span className="processing-dot">.</span>
                          <span className="processing-dot">.</span>
                        </span>
                      </p>
                      <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--color-text-secondary)' }}>
                        (estimated ~{estimatedProcessingSeconds} seconds)
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {ragError && !isLoading && (
                <div style={{ marginTop: 8, width: '100%', maxWidth: 560, background: '#FDF2F8', border: '1px solid #FCA5A5', borderRadius: 12, padding: 16 }}>
                  <p style={{ margin: 0, fontSize: 12, color: '#B91C1C', lineHeight: 1.6, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <span style={{ display: 'inline-flex', marginTop: 1 }}><AppIcon name="warning" size={13} color="#DC2626" /></span>
                    <span>{ragError}</span>
                  </p>
                  <button
                    type="button"
                    onClick={handleRetryLastSubmission}
                    disabled={!lastSubmission || isLoading}
                    style={{ marginTop: 8, border: '1px solid #FCA5A5', background: '#fff', color: '#B91C1C', borderRadius: 8, fontSize: 12, fontWeight: 700, height: 40, padding: '0 16px', cursor: !lastSubmission || isLoading ? 'not-allowed' : 'pointer', opacity: !lastSubmission || isLoading ? 0.6 : 1 }}
                  >
                    🔄 Try Again
                  </button>
                </div>
              )}

              {!isLoading && (
                <p style={{ marginTop: 8, fontSize: 12, color: '#9CA3AF', textAlign: 'center' }}>
                  Press Enter or Ctrl+Enter to send
                </p>
              )}

              {/* Quick suggestions */}
              <p style={{ margin: '24px 0 8px', fontSize: 14, color: 'var(--color-text-secondary)' }}>
                Or try one of these examples:
              </p>
              <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'nowrap', justifyContent: 'flex-start', overflowX: 'auto', paddingBottom: 8, width: '100%', maxWidth: 560 }}>
                {quickPromptChips.map(s => (
                  <button
                    key={s}
                    onClick={() => {
                      if (isLoading) return;
                      setInputVal(s);
                      inputRef.current?.focus();
                    }}
                    style={{
                      height: 40,
                      padding: '0 16px', borderRadius: 20, fontSize: 14, fontWeight: 500,
                      background: 'var(--color-surface)', border: '1px solid #E5E7EB',
                      cursor: 'pointer', color: 'var(--color-text-secondary)',
                      transition: 'all 0.2s',
                      flexShrink: 0,
                      opacity: isLoading ? 0.55 : 1,
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

          {/* -- RESULTS */}
          {hasResults && !isLoading && (
            <>
              {/* Task Title Card */}
              <div style={{
                background: 'linear-gradient(135deg, #6C47FF 0%, #5535CC 100%)',
                borderRadius: '0 0 12px 12px', padding: '16px 24px', marginBottom: 24, color: '#fff',
                display: 'flex', flexDirection: 'column', gap: 16,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                  <div>
                    <p style={{ margin: '0 0 8px', fontSize: 12, opacity: 0.85, fontWeight: 600, letterSpacing: '0.08em' }}>ACTIVE TASK</p>
                    <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>{taskTitle}</h2>
                  </div>
                  <p style={{ margin: 0, fontSize: 12, opacity: 0.9 }}>
                    {completedCount}/{subTasks.length} completed ({progressPct}%)
                  </p>
                </div>
                <div
                  role="progressbar"
                  aria-label="Task progress"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={progressPct}
                  style={{ width: '100%', height: 6, background: '#EDE9FF', borderRadius: 999 }}
                >
                  <div
                    style={{
                      width: `${progressPct}%`,
                      height: '100%',
                      background: '#22C55E',
                      borderRadius: 999,
                      transition: 'width 0.5s ease-in-out',
                    }}
                  />
                </div>
              </div>

              {/* Step Indicator */}
              {subTasks.length > 0 && (
                <div style={{ marginBottom: 24, padding: 16, border: '1px solid #E5E7EB', borderRadius: 8, background: '#fff' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {subTasks.map((task, index) => {
                      const isDone = task.status === 'done';
                      const isActive = task.id === expandedId;
                      const circleStyle = {
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 12,
                        fontWeight: 700,
                        background: isDone ? '#22C55E' : isActive ? '#6C47FF' : 'transparent',
                        border: isDone ? 'none' : `2px solid ${isActive ? '#6C47FF' : '#E5E7EB'}`,
                        color: isDone ? '#fff' : isActive ? '#fff' : '#9CA3AF',
                      };
                      return (
                        <div key={task.id} style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, minWidth: 56 }}>
                            <div className={isActive ? 'step-pulse' : undefined} style={circleStyle}>
                              {isDone ? <AppIcon name="check" size={14} color="#fff" aria-hidden="true" /> : isActive ? '●' : '○'}
                            </div>
                            {isActive && (
                              <span style={{ fontSize: 12, color: '#6B7280', textAlign: 'center', lineHeight: 1.2 }}>
                                {task.title}
                              </span>
                            )}
                          </div>
                          {index < subTasks.length - 1 && (
                            <div aria-hidden="true" style={{ flex: 1, height: 2, background: isDone ? '#22C55E' : '#E5E7EB', margin: '0 8px' }} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <p style={{ margin: '12px 0 0', fontSize: 12, color: '#9CA3AF' }}>
                    Step {activeStepIndex} of {subTasks.length}
                  </p>
                </div>
              )}

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
                  isDoneJustNow={justCompletedTaskIds.includes(task.id)}
                />
              ))}

              {completedCount === subTasks.length && subTasks.length > 0 && (
                <div style={{
                  background: 'linear-gradient(135deg, var(--color-secondary), #059669)',
                  borderRadius: 16, padding: '24px', textAlign: 'center', marginTop: 16, color: '#fff',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}><AppIcon name="check" size={40} color="#fff" /></div>
                  <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700 }}>🎉 Task Complete!</h3>
                  <p style={{ margin: 0, fontSize: 14, opacity: 0.9 }}>
                    You successfully completed: {taskTitle}
                  </p>
                </div>
              )}

              {/* Follow-up Input */}
              <div style={{ marginTop: 20, padding: '16px 20px', background: 'var(--color-surface)', borderRadius: 14, border: '1px solid var(--color-border)' }}>
                {followUpReply && (
                  <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
                    <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, flexShrink: 0 }}><AppIcon name="sparkles" size={12} color="#fff" /></div>
                    <div style={{ background: 'var(--color-primary-light)', borderRadius: 12, padding: '12px 14px', fontSize: 13, lineHeight: 1.65, color: 'var(--color-text-primary)', flex: 1 }}>
                      {followUpReply}
                    </div>
                  </div>
                )}
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
                  <textarea
                    ref={followUpTextareaRef}
                    value={followUpVal}
                    onChange={e => setFollowUpVal(e.target.value)}
                    onInput={e => autoResizeFollowUpTextarea(e.currentTarget)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleFollowUp();
                      }
                    }}
                    placeholder="Ask more about this task..."
                    rows={1}
                    style={{
                      flex: 1, padding: '10px 14px',
                      border: '1px solid var(--color-border)',
                      borderRadius: 10, fontSize: 13, outline: 'none',
                      minHeight: 44,
                      maxHeight: 150,
                      resize: 'none',
                      lineHeight: 1.55,
                      overflowY: 'hidden',
                    }}
                    onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
                    onBlur={e  => e.target.style.borderColor = 'var(--color-border)'}
                  />
                  <button className="btn-primary tooltip-host" data-tooltip="Send (Enter)" onClick={handleFollowUp} style={{ padding: '10px 18px', fontSize: 13 }}>
                    Send
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
        savedToolNames={savedToolNames}
        onCopyTips={handleCopyTips}
        copiedTipsTaskId={copiedTipsTaskId}
      />

      {showCompletionOverlay && (
        <div className="completion-overlay">
          {showCompletionConfetti && (
            <div className="completion-confetti-layer" aria-hidden="true">
              {completionConfettiPieces.map((piece) => (
                <span
                  key={piece.id}
                  className="completion-confetti-piece"
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

          <div className="completion-card" role="dialog" aria-modal="true" aria-label="All subtasks completed" onClick={(event) => event.stopPropagation()}>
            <div className="completion-icon-wrap">
              <AppIcon name="check" size={44} color="#fff" />
            </div>
            <h3 className="completion-title">🎉 Task Complete!</h3>
            <p className="completion-subtitle">You successfully completed: {taskTitle}</p>
            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button ref={completionPrimaryActionRef} className="btn-primary" onClick={handleViewSummary} style={{ flex: 1 }}>
                View Summary
              </button>
              <button className="btn-ghost" onClick={handleStartNewTask} style={{ flex: 1 }}>
                Back to Chat
              </button>
            </div>
          </div>
        </div>
      )}

      {showLeaveDraftModal && (
        <Modal title="Unsent Text" onClose={handleStayInChat}>
          <p style={{ margin: '0 0 18px', fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
            You have unsent text. Are you sure you want to leave this page?
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="button"
              onClick={handleStayInChat}
              style={{
                flex: 1,
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
              Stay Here
            </button>
            <button
              type="button"
              onClick={handleLeaveFromChat}
              style={{
                flex: 1,
                border: '1px solid var(--color-border)',
                borderRadius: 10,
                background: '#fff',
                color: 'var(--color-text-secondary)',
                fontSize: 14,
                fontWeight: 600,
                padding: '10px 14px',
                cursor: 'pointer',
              }}
            >
              Leave
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

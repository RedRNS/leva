import { useEffect, useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import OnboardingView from './views/OnboardingView';
import DashboardView from './views/DashboardView';
import ChatWorkspaceView from './views/ChatWorkspaceView';
import LibraryView from './views/LibraryView';
import ProfileView from './views/ProfileView';
import Sidebar from './components/Sidebar';
import Toast from './components/Toast';
import AppIcon from './components/AppIcon';
import DashboardTour from './components/DashboardTour';
import { preloadSoundEffects } from './utils/sound';

const isTypingTarget = (target) => {
  if (!(target instanceof HTMLElement)) return false;

  const tagName = target.tagName;
  if (target.isContentEditable || target.closest('[contenteditable="true"]')) return true;

  return tagName === 'INPUT' || tagName === 'TEXTAREA' || tagName === 'SELECT';
};

function AppInner() {
  const { activeView, toasts, dismissToast, setActiveView, setActiveTask, highContrast, setHighContrast } = useApp();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const pageTitleByView = {
      onboarding: 'Leva — Introduction',
      dashboard: 'Leva — Dashboard',
      chat: 'Leva — Chat & Task',
      library: 'Leva — Library',
      profile: 'Leva — Profile & Settings',
    };

    document.title = pageTitleByView[activeView] || 'Leva';
  }, [activeView]);

  useEffect(() => {
    preloadSoundEffects();
  }, []);

  useEffect(() => {
    document.body.classList.toggle('high-contrast', highContrast);
  }, [highContrast]);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        window.dispatchEvent(new CustomEvent('leva:escape'));
        return;
      }

      if (activeView === 'onboarding' || isTypingTarget(event.target)) return;

      const key = event.key.toLowerCase();

      /* UI/UX Fix: Step 6 — Keyboard shortcuts minimize hand movement (47.5% late-night users). Step 7 — Disabled state = "work the way it looks". Contextual quick prompts reduce 35.6% of complaints about AI being too generic. */
      if ((event.ctrlKey || event.metaKey) && key === 'k') {
        event.preventDefault();
        window.dispatchEvent(new CustomEvent('leva:focus-sidebar-search'));
        return;
      }

      if ((event.ctrlKey || event.metaKey) && event.shiftKey && key === 'h') {
        event.preventDefault();
        setHighContrast((prev) => !prev);
        return;
      }

      if (!event.ctrlKey && !event.metaKey && !event.altKey && key === '/') {
        event.preventDefault();
        window.dispatchEvent(new CustomEvent('leva:focus-sidebar-search'));
        return;
      }

      if ((event.ctrlKey || event.metaKey) && key === 'n') {
        event.preventDefault();
        window.dispatchEvent(new CustomEvent('leva:new-chat'));
        setActiveTask(null);
        setActiveView('chat');
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeView, setActiveTask, setActiveView, setHighContrast]);

  function MobileBottomNav() {
    const { activeView: mobileActiveView, setActiveView } = useApp();
    const items = [
      { id: 'dashboard', icon: 'home', label: 'Home' },
      { id: 'chat', icon: 'message', label: 'Chat' },
      { id: 'library', icon: 'library', label: 'Library' },
      { id: 'profile', icon: 'user', label: 'Profile' },
    ];
    return (
      <div
        className="mobile-bottom-nav"
        style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          background: 'var(--color-surface)',
          borderTop: '1px solid var(--color-border)',
          zIndex: 600,
        }}
      >
        {items.map(item => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActiveView(item.id)}
            style={{
              flex: 1, padding: '10px 0', textAlign: 'center',
              cursor: 'pointer',
              color: mobileActiveView === item.id ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              border: 'none',
              background: 'transparent',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <AppIcon name={item.icon} size={20} />
            </div>
            <div style={{ fontSize: 10, fontWeight: 600, marginTop: 2 }}>{item.label}</div>
          </button>
        ))}
      </div>
    );
  }

  if (activeView === 'onboarding') {
    return <OnboardingView />;
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--color-bg)' }}>
      <Sidebar />
      <main style={{ flex: 1, overflowY: 'auto', paddingBottom: isMobile ? 72 : 0 }}>
        {activeView === 'dashboard' && <DashboardView />}
        {activeView === 'chat' && <ChatWorkspaceView />}
        {activeView === 'library' && <LibraryView />}
        {activeView === 'profile' && <ProfileView />}
      </main>
      {isMobile && <MobileBottomNav />}
      <DashboardTour isActive={activeView === 'dashboard'} />
      {toasts.length > 0 && <Toast toasts={toasts} onClose={dismissToast} />}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  );
}

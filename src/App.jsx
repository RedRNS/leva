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

function AppInner() {
  const { activeView, toast } = useApp();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  function MobileBottomNav() {
    const { activeView: mobileActiveView, setActiveView } = useApp();
    const items = [
      { id: 'dashboard', icon: 'home', label: 'Home' },
      { id: 'chat', icon: 'message', label: 'Chat' },
      { id: 'library', icon: 'library', label: 'Library' },
      { id: 'profile', icon: 'user', label: 'Profil' },
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
          <div
            key={item.id}
            onClick={() => setActiveView(item.id)}
            style={{
              flex: 1, padding: '10px 0', textAlign: 'center',
              cursor: 'pointer',
              color: mobileActiveView === item.id ? 'var(--color-primary)' : 'var(--color-text-secondary)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <AppIcon name={item.icon} size={20} />
            </div>
            <div style={{ fontSize: 10, fontWeight: 600, marginTop: 2 }}>{item.label}</div>
          </div>
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
      {toast && <Toast message={toast} />}
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

import { createContext, useContext, useState } from 'react';
import { mockSavedTools } from '../data/mockData';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  // User persona from onboarding
  const [user, setUser] = useState(null); // null = not onboarded yet

  // Active view: 'onboarding' | 'dashboard' | 'chat' | 'library' | 'profile'
  const [activeView, setActiveView] = useState('onboarding');

  // Active task in ChatWorkspaceView
  const [activeTask, setActiveTask] = useState(null);

  // Saved tools library
  const [savedTools, setSavedTools] = useState(mockSavedTools);

  // Toast notification
  const [toast, setToast] = useState(null);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const saveToolToLibrary = (tool) => {
    const already = savedTools.find((t) => t.name === tool.name);
    if (already) {
      showToast('⚠️ Tool ini sudah ada di Library-mu!');
      return;
    }
    const newEntry = {
      id: Date.now(),
      name: tool.name,
      url: tool.url,
      priority: '🟢 Sangat Bagus',
      priorityKey: 'good',
      category: tool.category,
      keywords: [tool.category.toLowerCase(), 'ai tools', 'leva'],
      savedAt: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
      note: '',
    };
    setSavedTools((prev) => [newEntry, ...prev]);
    showToast('✅ Disimpan ke Library!');
  };

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        activeView,
        setActiveView,
        activeTask,
        setActiveTask,
        savedTools,
        setSavedTools,
        toast,
        showToast,
        saveToolToLibrary,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);

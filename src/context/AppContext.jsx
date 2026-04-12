import { createContext, useContext, useState } from 'react';
import { historyTasks as mockHistoryTasks, mockSavedTools } from '../data/mockData';

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

  // Task history in sidebar
  const [historyTasks, setHistoryTasks] = useState(mockHistoryTasks);

  // Toast notification
  const [toast, setToast] = useState(null);

  // UX sound effect preference
  const [soundEnabled, setSoundEnabled] = useState(true);

  const showToast = (message, type = 'info') => {
    setToast({
      id: Date.now(),
      message,
      type,
    });
  };

  const dismissToast = () => {
    setToast(null);
  };

  const saveToolToLibrary = (tool) => {
    const already = savedTools.find((t) => t.name === tool.name);
    if (already) {
      showToast(`Tool ${tool.name} sudah ada di Library-mu.`, 'info');
      return false;
    }

    /* UI/UX Fix: Step 6 — Output device harus memberi respond jelas ke aksi user. Step 7 — Aksi destruktif (hapus) harus ada safeguard/konfirmasi. Survei: 52,5% user sulit temukan referensi. */
    const newEntry = {
      id: Date.now(),
      name: tool.name,
      url: tool.url,
      priority: 'Sangat Bagus',
      priorityKey: 'good',
      pricingType: tool.pricingType ?? 'freemium',
      category: tool.category,
      keywords: [tool.category.toLowerCase(), 'ai tools', 'leva'],
      savedAt: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
      savedTimestamp: Date.now(),
      description: tool.desc || '',
      rating: tool.rating ?? 0,
      note: '',
    };
    setSavedTools((prev) => [newEntry, ...prev]);
    showToast(`✓ ${tool.name} berhasil disimpan ke Library!`, 'success');
    return true;
  };

  const removeToolFromLibrary = (toolId) => {
    setSavedTools((prev) => prev.filter((t) => t.id !== toolId));
    showToast('Tool berhasil dihapus', 'info');
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
        historyTasks,
        setHistoryTasks,
        toast,
        showToast,
        dismissToast,
        soundEnabled,
        setSoundEnabled,
        saveToolToLibrary,
        removeToolFromLibrary,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);

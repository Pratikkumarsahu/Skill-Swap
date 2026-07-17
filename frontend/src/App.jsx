import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Explore from './pages/Explore';
import Chat from './pages/Chat';
import Schedule from './pages/Schedule';
import Profile from './pages/Profile';
import AdminPanel from './pages/AdminPanel';

function App() {
  const { user, loading } = useAuth();
  
  // Theme state: dark or light, synced with local storage
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [authPage, setAuthPage] = useState('landing');
  
  // Triggers opening chat room directly from explore match search clicks
  const [selectChatUserId, setSelectChatUserId] = useState(null);

  // Toggle global theme setting
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center bg-[#070b13] ${theme}`}>
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-9 w-9 border-t-2 border-indigo-500 border-r-2"></div>
          <span className="text-xs text-slate-500 font-semibold tracking-wider uppercase">Loading network...</span>
        </div>
      </div>
    );
  }

  // Not authenticated routing (Landing, Login, Register)
  if (!user) {
    if (authPage === 'landing') {
      return (
        <div className={`min-h-screen ${theme}`}>
          <Landing onNavigate={setAuthPage} theme={theme} onToggleTheme={toggleTheme} />
        </div>
      );
    }
    return authPage === 'login' ? (
      <div className={`min-h-screen ${theme}`}>
        <Login onNavigate={setAuthPage} theme={theme} onToggleTheme={toggleTheme} />
      </div>
    ) : (
      <div className={`min-h-screen ${theme}`}>
        <Register onNavigate={setAuthPage} theme={theme} onToggleTheme={toggleTheme} />
      </div>
    );
  }

  // Authenticated Layout
  return (
    <div className={`flex min-h-screen bg-[#070b13] text-slate-100 font-sans ${theme}`}>
      {/* Navigation Sidebar */}
      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Main Panel Content Window */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden h-screen relative">
        {currentPage === 'dashboard' && (
          <Dashboard
            onNavigate={setCurrentPage}
            setSelectChatUserId={setSelectChatUserId}
          />
        )}
        {currentPage === 'explore' && (
          <Explore
            onNavigate={setCurrentPage}
            setSelectChatUserId={setSelectChatUserId}
          />
        )}
        {currentPage === 'chat' && (
          <Chat
            selectChatUserId={selectChatUserId}
            setSelectChatUserId={setSelectChatUserId}
          />
        )}
        {currentPage === 'schedule' && (
          <Schedule
            onNavigate={setCurrentPage}
            setSelectChatUserId={setSelectChatUserId}
          />
        )}
        {currentPage === 'profile' && <Profile />}
        {currentPage === 'admin' && <AdminPanel />}
      </main>
    </div>
  );
}

export default App;

import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Explore from './pages/Explore';
import Chat from './pages/Chat';
import Schedule from './pages/Schedule';
import Profile from './pages/Profile';

function App() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [authPage, setAuthPage] = useState('login');
  
  // Triggers opening chat room directly from explore match search clicks
  const [selectChatUserId, setSelectChatUserId] = useState(null);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#070b13]">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-9 w-9 border-t-2 border-indigo-500 border-r-2"></div>
          <span className="text-xs text-slate-500 font-semibold tracking-wider uppercase">Loading network...</span>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return authPage === 'login' ? (
      <Login onNavigate={setAuthPage} />
    ) : (
      <Register onNavigate={setAuthPage} />
    );
  }

  // Authenticated Layout
  return (
    <div className="flex min-h-screen bg-[#070b13] text-slate-100 font-sans">
      {/* Navigation Sidebar */}
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />

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
      </main>
    </div>
  );
}

export default App;

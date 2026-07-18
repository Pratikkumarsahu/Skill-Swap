// Real-time Chat/Inbox page
import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { Send, Smile, MessageSquare } from 'lucide-react';

const Chat = ({ selectChatUserId, setSelectChatUserId }) => {
  const { user, token, API_URL } = useAuth();
  const { socket, onlineUsers } = useSocket();
  const [conversations, setConversations] = useState([]);
  const [activePartner, setActivePartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [loadingConv, setLoadingConv] = useState(true);
  const [loadingMsg, setLoadingMsg] = useState(false);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Auto-scroll logic helper
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, partnerTyping]);

  // Fetch active conversations list
  const fetchConversations = async () => {
    try {
      const response = await fetch(`${API_URL}/chats/conversations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setConversations(data || []);

      // If user came here via clicking "Message" on Explore/Dashboard
      if (selectChatUserId) {
        const existingConv = data.find((c) => c.partner._id === selectChatUserId);
        if (existingConv) {
          handleSelectPartner(existingConv.partner);
        } else {
          const resUser = await fetch(`${API_URL}/users/${selectChatUserId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (resUser.ok) {
            const partnerUser = await resUser.json();
            handleSelectPartner(partnerUser);
          }
        }
        setSelectChatUserId(null); // Reset select trigger
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
    } finally {
      setLoadingConv(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [token, selectChatUserId]);

  // Fetch message log history with selected partner
  const fetchMessages = async (partnerId) => {
    setLoadingMsg(true);
    try {
      const response = await fetch(`${API_URL}/chats/messages/${partnerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setMessages(data || []);
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setLoadingMsg(false);
    }
  };

  const handleSelectPartner = (partner) => {
    setActivePartner(partner);
    fetchMessages(partner._id);

    // Join room for communication via WebSockets
    if (socket) {
      socket.emit('join_room', { senderId: user._id, receiverId: partner._id });
    }

    // Reset unread message badge count locally
    setConversations((prev) =>
      prev.map((c) => (c.partner._id === partner._id ? { ...c, unreadCount: 0 } : c))
    );
  };

  // Socket event listeners for real-time messaging
  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (message) => {
      // Add message if it belongs to current active conversation
      if (
        activePartner &&
        (message.sender._id === activePartner._id || message.sender._id === user._id)
      ) {
        setMessages((prev) => [...prev, message]);
      }
      
      // Update sidebar conversation preview details
      fetchConversations();
    };

    const handleTypingStatus = ({ senderId, isTyping }) => {
      if (activePartner && senderId === activePartner._id) {
        setPartnerTyping(isTyping);
      }
    };

    socket.on('receive_message', handleReceiveMessage);
    socket.on('typing_status', handleTypingStatus);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
      socket.off('typing_status', handleTypingStatus);
    };
  }, [socket, activePartner, user]);

  // Emit typing event to partner
  const handleMessageChange = (e) => {
    setNewMessage(e.target.value);

    if (!socket || !activePartner) return;

    if (!isTyping) {
      setIsTyping(true);
      socket.emit('typing', {
        senderId: user._id,
        receiverId: activePartner._id,
        isTyping: true,
      });
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    // Reset typing status after 1.5 seconds of no typing
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket.emit('typing', {
        senderId: user._id,
        receiverId: activePartner._id,
        isTyping: false,
      });
    }, 1500);
  };

  // Send message
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket || !activePartner) return;

    socket.emit('send_message', {
      senderId: user._id,
      receiverId: activePartner._id,
      content: newMessage.trim(),
    });

    if (isTyping) {
      setIsTyping(false);
      socket.emit('typing', {
        senderId: user._id,
        receiverId: activePartner._id,
        isTyping: false,
      });
    }
    
    setNewMessage('');
  };

  return (
    <div className="flex-1 bg-slate-950 flex h-screen overflow-hidden text-slate-300">
      {/* Active Chats Sidebar (Left) */}
      <div className="w-80 border-r border-slate-800 flex flex-col bg-slate-900">
        <div className="p-6 border-b border-slate-800 bg-slate-900">
          <h2 className="text-lg font-bold text-white tracking-wide">Inbox Messages</h2>
          <p className="text-xs text-slate-500 mt-1">Talk with your swap partners</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {loadingConv ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-indigo-500"></div>
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-12 px-4 space-y-2">
              <MessageSquare className="w-8 h-8 text-slate-600 mx-auto opacity-50" />
              <p className="text-xs text-slate-500 leading-relaxed">
                Inbox is empty. Start a conversation from the Explore page!
              </p>
            </div>
          ) : (
            conversations.map((conv) => {
              const isPartnerOnline = onlineUsers.includes(conv.partner._id);
              const isActive = activePartner?._id === conv.partner._id;
              return (
                <button
                  key={conv.partner._id}
                  onClick={() => handleSelectPartner(conv.partner)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all border ${
                    isActive
                      ? 'bg-indigo-600/10 border-indigo-500/20 text-indigo-400'
                      : 'bg-transparent border-transparent hover:bg-slate-800 text-slate-400'
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <img
                      src={conv.partner.avatar || 'https://via.placeholder.com/150'}
                      alt={conv.partner.name}
                      className="w-10 h-10 rounded-xl border border-slate-800 object-cover"
                    />
                    <span
                      className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-slate-900 ${
                        isPartnerOnline ? 'bg-emerald-500' : 'bg-slate-600'
                      }`}
                    />
                  </div>
                  <div className="min-w-0 flex-1 text-left">
                    <div className="flex justify-between items-baseline">
                      <h4 className={`text-xs font-bold truncate ${isActive ? 'text-white' : 'text-slate-300'}`}>
                        {conv.partner.name}
                      </h4>
                      {conv.unreadCount > 0 && (
                        <span className="bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {conv.lastMessage?.content || 'No messages yet.'}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Message Screen (Right) */}
      <div className="flex-1 flex flex-col bg-slate-950">
        {activePartner ? (
          <>
            {/* Header banner info */}
            <div className="p-5 border-b border-slate-800 bg-slate-900 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={activePartner.avatar || 'https://via.placeholder.com/150'}
                  alt={activePartner.name}
                  className="w-10 h-10 rounded-xl border border-slate-800 object-cover"
                />
                <div>
                  <h3 className="font-extrabold text-white text-sm leading-snug">
                    {activePartner.name}
                  </h3>
                  <span className="text-[10px] text-slate-500 font-semibold">
                    {onlineUsers.includes(activePartner._id) ? (
                      <span className="text-emerald-400">Online</span>
                    ) : (
                      'Offline'
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Chat logs scroll container */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {loadingMsg ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-7 w-7 border-t-2 border-indigo-500"></div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full space-y-3 opacity-60">
                  <MessageSquare className="w-10 h-10 text-indigo-400" />
                  <p className="text-xs text-slate-400">Start messaging {activePartner.name}!</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isOwn = msg.sender._id === user._id;
                  return (
                    <div
                      key={msg._id || Math.random().toString()}
                      className={`flex gap-3 max-w-[70%] ${isOwn ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                    >
                      {!isOwn && (
                        <img
                          src={msg.sender.avatar || 'https://via.placeholder.com/150'}
                          alt={msg.sender.name}
                          className="w-8 h-8 rounded-lg border border-slate-800 object-cover flex-shrink-0"
                        />
                      )}
                      <div>
                        <div
                          className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                            isOwn
                              ? 'bg-indigo-600 text-white rounded-tr-none'
                              : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                          }`}
                        >
                          {msg.content}
                        </div>
                        <span className="text-[9px] text-slate-500 mt-1 block px-1 text-right">
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}

              {/* Partner typing state */}
              {partnerTyping && (
                <div className="flex gap-3 max-w-[70%] mr-auto items-center">
                  <img
                    src={activePartner.avatar || 'https://via.placeholder.com/150'}
                    alt={activePartner.name}
                    className="w-8 h-8 rounded-lg border border-slate-800 object-cover flex-shrink-0"
                  />
                  <div className="px-3.5 py-3.5 bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-none text-xs italic text-slate-400">
                    Typing...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Block status alert inside chat window */}
            {user?.isBlockedUntil && new Date(user.isBlockedUntil) > new Date() && (
              <div className="px-5 py-2.5 bg-red-950/20 border-t border-b border-red-900/30 text-red-400 text-[10px] font-semibold">
                ⚠️ Your account is temporarily blocked from sending messages until {new Date(user.isBlockedUntil).toLocaleString()}. Reason: {user.blockReason}
              </div>
            )}

            {/* Message input form */}
            <form onSubmit={handleSendMessage} className="p-5 border-t border-slate-800 bg-slate-900">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  disabled={user?.isBlockedUntil && new Date(user.isBlockedUntil) > new Date()}
                  value={newMessage}
                  onChange={handleMessageChange}
                  placeholder={user?.isBlockedUntil && new Date(user.isBlockedUntil) > new Date() ? "You are temporarily blocked from sending messages..." : "Send message..."}
                  className="w-full py-3 bg-slate-950 border border-slate-800 focus:outline-none px-4 rounded-xl text-xs text-white disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || (user?.isBlockedUntil && new Date(user.isBlockedUntil) > new Date())}
                  className="p-3 bg-indigo-600 hover:bg-indigo-750 text-white rounded-xl disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center space-y-3 opacity-60">
            <MessageSquare className="w-12 h-12 text-slate-600" />
            <h3 className="text-white text-base font-bold">Select a conversation</h3>
            <p className="text-xs text-slate-500">Pick a partner from the inbox to chat.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;

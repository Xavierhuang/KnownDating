import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { firebaseApi } from '../utils/firebaseApi';
import { logger } from '../utils/logger';
import { Message, Match } from '../types';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Send, MoreVertical, Flag, Ban, Sparkles } from 'lucide-react';
import { formatInTimeZone } from 'date-fns-tz';

export default function Chat() {
  const { matchId } = useParams<{ matchId: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!matchId) return;

    loadMatch();

    // Subscribe to real-time messages using Firestore
    const unsubscribe = firebaseApi.subscribeToMessages(
      matchId,
      (updatedMessages) => {
        setMessages(updatedMessages);
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [matchId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMatch = async () => {
    try {
      const matches = await api.getMatches();
      const currentMatch = matches.find((m) => m.id === matchId);
      setMatch(currentMatch || null);
    } catch (error) {
      logger.error('Failed to load match', error as Error, { matchId });
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!matchId) return;

    // Validate message
    const { validateMessage } = await import('../utils/validation');
    const validation = validateMessage(newMessage);
    if (!validation.valid) {
      alert(validation.error || 'Invalid message');
      return;
    }

    // Import content filter
    const { filterContent } = await import('../utils/contentFilter');
    const filterResult = filterContent(newMessage.trim());
    
    if (filterResult.isBlocked) {
      alert(`Message blocked: ${filterResult.reason || 'Contains inappropriate content'}`);
      return;
    }

    try {
      await api.sendMessage(matchId, filterResult.filtered);
      setNewMessage('');
    } catch (error: any) {
      alert(error.message || 'Failed to send message. Please try again.');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleReport = async (reason: string) => {
    if (!match || !user) return;
    
    // Get the other user's ID from the match
    const reportedUserId = match.user1_id === user.id ? match.user2_id : match.user1_id;
    
    try {
      const result = await api.reportUser(reportedUserId, reason);
      alert(result.message || `User reported for: ${reason}. Our team will review within 24 hours.`);
      setShowReportModal(false);
      setShowMenu(false);
    } catch (error: any) {
      logger.error('Failed to report user', error as Error, { reportedUserId, reason });
      alert(error.message || 'Failed to submit report. Please try again.');
    }
  };

  const handleBlock = async () => {
    if (!match || !user) return;
    
    if (!confirm('Are you sure you want to block this user? You will no longer see their messages or profile.')) {
      return;
    }
    
    // Get the other user's ID from the match
    const blockedUserId = match.user1_id === user.id ? match.user2_id : match.user1_id;
    
    try {
      const result = await api.blockUser(blockedUserId);
      alert(result.message || 'User blocked successfully.');
      setShowMenu(false);
      navigate('/matches');
    } catch (error: any) {
      logger.error('Failed to block user', error as Error, { blockedUserId });
      alert(error.message || 'Failed to block user. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-icy-100 via-white to-icy-200 page-with-nav relative">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-icy-200 px-4 py-3 flex items-center gap-3 relative z-10">
        <button
          onClick={() => navigate('/matches')}
          className="text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        
        {match && (
          <>
            <img
              src={match.photos[0] || 'https://via.placeholder.com/40'}
              alt={match.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="flex-1">
              <h2 className="font-semibold text-dark">{match.name}</h2>
              <p className="text-xs text-gray-500">Match</p>
            </div>
            
            {/* Report/Block Menu */}
            <div className="relative z-50">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 hover:bg-gray-100 rounded-full transition relative z-50"
              >
                <MoreVertical className="w-5 h-5 text-gray-600" />
              </button>
              
              {showMenu && (
                <>
                  {/* Backdrop to close menu when clicking outside */}
                  <div 
                    className="fixed inset-0 z-40"
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 top-12 bg-white rounded-lg shadow-xl border border-gray-200 py-2 w-48 z-50">
                    <button
                      onClick={() => {
                        setShowReportModal(true);
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2 text-gray-700"
                    >
                      <Flag className="w-4 h-4" />
                      Report User
                    </button>
                    <button
                      onClick={handleBlock}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2 text-red-600"
                    >
                      <Ban className="w-4 h-4" />
                      Block User
                    </button>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 relative z-0">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-12">
            <Sparkles className="w-10 h-10 mx-auto mb-3 text-primary animate-sparkle" />
            <p>No messages yet. Say hi!</p>
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isOwn={message.sender_id === user?.id}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white/90 backdrop-blur-sm border-t border-icy-200 px-4 py-3 relative z-10">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-dark mb-4">Report User</h3>
            <p className="text-gray-600 mb-4">
              Please select a reason for reporting this user. All reports are reviewed within 24 hours.
            </p>
            
            <div className="space-y-2 mb-6">
              {[
                'Harassment or bullying',
                'Inappropriate content',
                'Spam or solicitation',
                'Fake profile',
                'Offensive language',
                'Other safety concern'
              ].map((reason) => (
                <button
                  key={reason}
                  onClick={() => handleReport(reason)}
                  className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition"
                >
                  {reason}
                </button>
              ))}
            </div>
            
            <button
              onClick={() => setShowReportModal(false)}
              className="w-full py-2 text-gray-600 hover:text-gray-900"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  const timeZone = 'America/New_York';
  const formattedTime = formatInTimeZone(
    new Date(message.created_at),
    timeZone,
    'h:mm a'
  );

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[70%] ${isOwn ? 'order-2' : 'order-1'}`}>
        {!isOwn && (
          <p className="text-xs text-gray-500 mb-1 px-3">{message.sender_name}</p>
        )}
        <div className="flex items-end gap-1">
          <div
            className={`px-4 py-2 rounded-2xl ${
              isOwn
                ? 'bg-primary text-white rounded-br-sm'
                : 'bg-white text-dark rounded-bl-sm'
            }`}
          >
            <p>{message.content}</p>
          </div>
          {isOwn && (
            <span className="text-xs">
              {message.read ? '✓✓' : '✓'}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-1 px-3">{formattedTime}</p>
      </div>
    </div>
  );
}


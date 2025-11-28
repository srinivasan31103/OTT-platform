import { useEffect, useRef, useState } from 'react';
import { FiSend, FiSmile } from 'react-icons/fi';
import { useAuthStore } from '../store/authStore';
import { chatApi } from '../api/apiClient';

const ChatBox = ({ channelId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const { user, token } = useAuthStore();

  // Fetch initial messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await chatApi.getMessages(channelId);
        setMessages(response.data || []);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to fetch messages:', error);
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [channelId]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle send message
  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!newMessage.trim()) return;

    try {
      const response = await chatApi.sendMessage(channelId, newMessage);
      setMessages([...messages, response.data]);
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-pulse text-gray-400">Loading messages...</div>
      </div>
    );
  }

  return (
    <div className="glass-effect rounded-lg h-96 flex flex-col">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            <p>No messages yet. Be the first to chat!</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.userId === user?._id ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs px-4 py-2 rounded-lg ${
                  msg.userId === user?._id
                    ? 'bg-primary text-white'
                    : 'bg-slate-700 text-gray-100'
                }`}
              >
                {msg.userId !== user?._id && (
                  <p className="text-xs font-bold text-accent mb-1">
                    {msg.userName}
                  </p>
                )}
                <p className="text-sm break-words">{msg.message}</p>
                <p className="text-xs opacity-70 mt-1 text-right">
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form
        onSubmit={handleSendMessage}
        className="border-t border-slate-700 p-4 flex gap-2"
      >
        <button
          type="button"
          className="text-gray-400 hover:text-white transition-colors"
        >
          <FiSmile size={20} />
        </button>

        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-slate-800 text-white rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />

        <button
          type="submit"
          disabled={!newMessage.trim()}
          className="text-primary hover:text-pink-700 transition-colors disabled:opacity-50"
        >
          <FiSend size={20} />
        </button>
      </form>
    </div>
  );
};

export default ChatBox;

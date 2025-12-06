import type { Conversation } from '../types';

interface ConversationItemProps {
  conversation: Conversation;
  onClick: () => void;
  isActive: boolean;
}

export function ConversationItem({ conversation, onClick, isActive }: ConversationItemProps) {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Ontem';
    } else if (days < 7) {
      return date.toLocaleDateString('pt-BR', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    }
  };

  const truncateMessage = (text: string, maxLength: number = 40) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 p-4 cursor-pointer transition border-b border-gray-100 ${
        isActive ? 'bg-blue-50' : 'hover:bg-gray-50'
      }`}
    >
      {/* Avatar */}
      <div className="flex-shrink-0 w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center text-xl font-semibold">
        {conversation.otherUser.name.charAt(0).toUpperCase()}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">
              {conversation.otherUser.name}
            </h3>
            <p className="text-xs text-gray-500 truncate">
              @{conversation.otherUser.nickname}
            </p>
          </div>
          {conversation.lastMessage && (
            <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
              {formatTime(conversation.lastMessage.createdAt)}
            </span>
          )}
        </div>
        {conversation.lastMessage && (
          <p className="text-sm text-gray-600 truncate">
            {truncateMessage(conversation.lastMessage.content)}
          </p>
        )}
      </div>

      {/* Unread badge */}
      {conversation.unreadCount > 0 && (
        <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
          {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
        </div>
      )}
    </div>
  );
}

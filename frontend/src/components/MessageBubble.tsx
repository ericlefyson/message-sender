import type { Message } from '../types';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[70%] ${isOwn ? 'order-2' : 'order-1'}`}>
        {!isOwn && (
          <p className="text-xs text-gray-600 mb-1 px-2">{message.sender.name}</p>
        )}
        <div
          className={`px-4 py-2 ${
            isOwn
              ? 'bg-blue-500 text-white rounded-l-2xl rounded-tr-2xl rounded-br-md'
              : 'bg-gray-200 text-gray-900 rounded-r-2xl rounded-tl-2xl rounded-bl-md'
          }`}
        >
          <p className="break-words whitespace-pre-wrap">{message.content}</p>
        </div>
        <div className={`flex items-center gap-1 mt-1 px-2 ${isOwn ? 'justify-end' : 'justify-start'}`}>
          <span className="text-xs text-gray-500">{formatTime(message.createdAt)}</span>
          {isOwn && (
            <span className="text-xs text-gray-500">
              {message.read ? '✓✓' : '✓'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

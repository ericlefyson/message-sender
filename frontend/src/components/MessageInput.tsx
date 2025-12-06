import { useState, type FormEvent, type KeyboardEvent } from 'react';

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  isConnected: boolean;
  onTyping?: (isTyping: boolean) => void;
}

export function MessageInput({ onSendMessage, isConnected, onTyping }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!message.trim() || !isConnected) return;

    onSendMessage(message.trim());
    setMessage('');

    if (isTyping && onTyping) {
      setIsTyping(false);
      onTyping(false);
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  const handleChange = (value: string) => {
    setMessage(value);

    // Send typing indicator
    if (onTyping) {
      if (value.length > 0 && !isTyping) {
        setIsTyping(true);
        onTyping(true);
      } else if (value.length === 0 && isTyping) {
        setIsTyping(false);
        onTyping(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border-t border-gray-200 p-4">
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => handleChange(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={isConnected ? "Digite uma mensagem..." : "Desconectado..."}
          disabled={!isConnected}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
        <button
          type="submit"
          disabled={!isConnected || !message.trim()}
          className="px-6 py-2 bg-blue-500 text-white rounded-full font-medium hover:bg-blue-600 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Enviar
        </button>
      </div>
    </form>
  );
}

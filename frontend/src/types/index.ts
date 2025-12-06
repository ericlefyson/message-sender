export interface User {
  id: string;
  name: string;
  nickname: string;  // Unique nickname for user identification
  email: string;     // Email used only for authentication
  role?: string;     // Optional: 'user' | 'admin'
  isActive?: boolean;
  createdAt: string;
}

export interface Conversation {
  id: string;
  userId1: string;
  userId2: string;
  roomId?: string;        // Optional for backward compatibility with mock data
  otherUser: User;        // The other participant (not current user)
  lastMessage?: Message;
  unreadCount: number;
  updatedAt: string;
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  sender: User;
  conversationId: string;
  createdAt: string;
  read: boolean;
}

export interface WebSocketMessage {
  type: 'message' | 'join' | 'leave' | 'history' | 'typing' | 'read' | 'error' | 'authenticated';
  payload: any;
}

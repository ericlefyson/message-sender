import type { User, Conversation, Message } from '../../types';

// Mock data storage
export class MockDataStore {
  private static instance: MockDataStore;

  private currentUser: User | null = null;
  private users: User[] = [
    {
      id: 'user-1',
      name: 'Alice Silva',
      nickname: 'alicesilva',
      email: 'alice@example.com',
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    },
    {
      id: 'user-2',
      name: 'Bob Santos',
      nickname: 'bobsantos',
      email: 'bob@example.com',
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
    {
      id: 'user-3',
      name: 'Carlos Lima',
      nickname: 'carloslima',
      email: 'carlos@example.com',
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
  ];

  private conversations: Conversation[] = [];
  private messages: Map<string, Message[]> = new Map();

  private constructor() {
    this.initializeMockData();
  }

  static getInstance(): MockDataStore {
    if (!MockDataStore.instance) {
      MockDataStore.instance = new MockDataStore();
    }
    return MockDataStore.instance;
  }

  private initializeMockData() {
    // Initialize some mock conversations and messages
    // Will be created dynamically when user logs in
  }

  // User operations
  setCurrentUser(user: User) {
    this.currentUser = user;
    this.initializeConversationsForUser(user);
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  clearCurrentUser() {
    this.currentUser = null;
  }

  getAllUsers(): User[] {
    return this.users.filter(u => u.id !== this.currentUser?.id);
  }

  getUserById(id: string): User | null {
    return this.users.find(u => u.id === id) || null;
  }

  getUserByNickname(nickname: string): User | null {
    return this.users.find(u => u.nickname.toLowerCase() === nickname.toLowerCase()) || null;
  }

  getUsers(): User[] {
    return this.users;
  }

  createOrGetUser(email: string): User {
    const existing = this.users.find(u => u.email === email);
    if (existing) {
      return existing;
    }

    const emailPrefix = email.split('@')[0];
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: emailPrefix,
      nickname: emailPrefix.toLowerCase(),
      email: email,
      createdAt: new Date().toISOString(),
    };
    this.users.push(newUser);
    return newUser;
  }

  createUserWithName(name: string, nickname: string, email: string): User {
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: name,
      nickname: nickname,
      email: email,
      createdAt: new Date().toISOString(),
    };
    this.users.push(newUser);
    return newUser;
  }

  // Conversation operations
  private initializeConversationsForUser(user: User) {
    if (this.conversations.length > 0) return;

    // Create a conversation with Alice (if current user is not Alice)
    const alice = this.users.find(u => u.name === 'Alice Silva');
    if (alice && alice.id !== user.id) {
      const conv = this.createConversationBetween(user, alice);
      this.addMockMessages(conv.id, user.id, alice.id);
    }
  }

  private createConversationBetween(user1: User, user2: User): Conversation {
    const convId = `conv-${user1.id}-${user2.id}`;
    const otherUser = user1.id === this.currentUser?.id ? user2 : user1;

    const conversation: Conversation = {
      id: convId,
      userId1: user1.id,
      userId2: user2.id,
      otherUser,
      unreadCount: 0,
      updatedAt: new Date().toISOString(),
    };

    this.conversations.push(conversation);
    return conversation;
  }

  private addMockMessages(convId: string, userId1: string, userId2: string) {
    const messages: Message[] = [
      {
        id: `msg-1-${convId}`,
        content: 'Oi! Tudo bem?',
        senderId: userId2,
        sender: this.getUserById(userId2)!,
        conversationId: convId,
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        read: true,
      },
      {
        id: `msg-2-${convId}`,
        content: 'Tudo ótimo! E você?',
        senderId: userId1,
        sender: this.getUserById(userId1)!,
        conversationId: convId,
        createdAt: new Date(Date.now() - 3000000).toISOString(),
        read: true,
      },
      {
        id: `msg-3-${convId}`,
        content: 'Também! Vamos marcar um café?',
        senderId: userId2,
        sender: this.getUserById(userId2)!,
        conversationId: convId,
        createdAt: new Date(Date.now() - 1800000).toISOString(),
        read: false,
      },
    ];

    this.messages.set(convId, messages);

    // Update conversation with last message
    const conv = this.conversations.find(c => c.id === convId);
    if (conv) {
      conv.lastMessage = messages[messages.length - 1];
      conv.unreadCount = messages.filter(m => !m.read && m.senderId !== this.currentUser?.id).length;
      conv.updatedAt = messages[messages.length - 1].createdAt;
    }
  }

  getConversations(): Conversation[] {
    return this.conversations.map(conv => ({
      ...conv,
      unreadCount: this.getUnreadCount(conv.id),
    }));
  }

  getConversationById(id: string): Conversation | null {
    return this.conversations.find(c => c.id === id) || null;
  }

  createConversation(otherUserId: string): Conversation {
    if (!this.currentUser) {
      throw new Error('No current user');
    }

    // Check if conversation already exists
    const existing = this.conversations.find(
      c => (c.userId1 === this.currentUser!.id && c.userId2 === otherUserId) ||
           (c.userId2 === this.currentUser!.id && c.userId1 === otherUserId)
    );

    if (existing) {
      return existing;
    }

    const otherUser = this.getUserById(otherUserId);
    if (!otherUser) {
      throw new Error('User not found');
    }

    return this.createConversationBetween(this.currentUser, otherUser);
  }

  getMessages(conversationId: string): Message[] {
    return this.messages.get(conversationId) || [];
  }

  addMessage(conversationId: string, content: string, senderId: string): Message {
    const sender = this.getUserById(senderId);
    if (!sender) {
      throw new Error('Sender not found');
    }

    const message: Message = {
      id: `msg-${Date.now()}`,
      content,
      senderId,
      sender,
      conversationId,
      createdAt: new Date().toISOString(),
      read: false,
    };

    const messages = this.messages.get(conversationId) || [];
    messages.push(message);
    this.messages.set(conversationId, messages);

    // Update conversation
    const conv = this.conversations.find(c => c.id === conversationId);
    if (conv) {
      conv.lastMessage = message;
      conv.updatedAt = message.createdAt;
      conv.unreadCount = this.getUnreadCount(conversationId);
    }

    return message;
  }

  markAsRead(messageId: string) {
    for (const [_, messages] of this.messages) {
      const msg = messages.find(m => m.id === messageId);
      if (msg) {
        msg.read = true;
        return;
      }
    }
  }

  private getUnreadCount(conversationId: string): number {
    const messages = this.messages.get(conversationId) || [];
    return messages.filter(m => !m.read && m.senderId !== this.currentUser?.id).length;
  }

  // Simulate other user sending a message (for testing)
  simulateIncomingMessage(conversationId: string, delay: number = 3000) {
    setTimeout(() => {
      const conv = this.getConversationById(conversationId);
      if (!conv || !this.currentUser) return;

      const otherUserId = conv.userId1 === this.currentUser.id ? conv.userId2 : conv.userId1;
      const responses = [
        'Que legal!',
        'Com certeza!',
        'Adorei a ideia',
        'Vamos sim!',
        'Perfeito!',
      ];

      const content = responses[Math.floor(Math.random() * responses.length)];
      this.addMessage(conversationId, content, otherUserId);
    }, delay);
  }
}

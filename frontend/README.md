# Chat App Frontend

Real-time 1:1 chat application built with React 18, TypeScript, Vite, and TailwindCSS.

## ⚡ Quick Start (No Backend Required!)

```bash
npm install
npm run dev
```

Visit `http://localhost:5173` - **The app works immediately with mock data!**

No backend needed for development. Switch to real API when ready by changing one environment variable.

## Features

- **User Authentication**: Login with username, session persisted in localStorage
- **1:1 Conversations**: Private conversations between two users
- **Real-time Messaging**: WebSocket-based instant message delivery
- **Conversation List**: View all your conversations and start new ones
- **Typing Indicators**: See when the other person is typing
- **Read Receipts**: Double checkmark for read messages
- **Message History**: Grouped by date with "Today", "Yesterday" labels
- **Mobile-Responsive**: Optimized for all screen sizes
- **🎭 Mock Mode**: Realistic mock data for development without backend

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **TailwindCSS** - Utility-first CSS framework
- **WebSocket** - Real-time communication
- **Repository Pattern** - Clean abstraction for mock/API switching

## Project Structure

```
src/
├── components/          # React components
│   ├── LoginScreen.tsx
│   ├── ConversationList.tsx
│   ├── ConversationItem.tsx
│   ├── ChatScreen.tsx
│   ├── MessageList.tsx
│   ├── MessageBubble.tsx
│   └── MessageInput.tsx
├── contexts/
│   └── AuthContext.tsx  # Authentication state management
├── hooks/
│   └── useWebSocket.ts  # WebSocket connection management
├── utils/
│   └── roomId.ts        # Utility functions
├── types/
│   └── index.ts         # TypeScript types
├── App.tsx              # Main app component
└── main.tsx            # Entry point
```

## Getting Started

## 🎭 Mock vs API Mode

This app uses the **Repository Pattern** to easily switch between mock data and real API:

### Development Mode (Mock - Default)
```env
VITE_REPOSITORY_MODE=mock
```
- ✅ No backend required
- ✅ Realistic mock data with delays
- ✅ Simulated WebSocket behavior
- ✅ Pre-populated users and conversations
- ✅ Auto-responses (50% chance)

### Production Mode (API)
```env
VITE_REPOSITORY_MODE=api
```
- ✅ Real backend integration
- ✅ Actual WebSocket connections
- ✅ Database persistence

**See [REPOSITORY_PATTERN.md](REPOSITORY_PATTERN.md) for detailed documentation.**

### Prerequisites

- Node.js 18+ installed
- Backend server running (only for `api` mode)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` to match your backend configuration:
```env
VITE_API_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001
```

3. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## API Integration

The frontend expects the following backend endpoints:

### REST API
- `POST /api/auth/login` - Login with username
- `GET /api/users` - Get all users (except current)
- `GET /api/conversations` - Get current user's conversations
- `POST /api/conversations` - Create/get conversation with another user
- `GET /api/conversations/:id/messages` - Get message history

### WebSocket
Connect to WebSocket with `?userId={userId}` query parameter.

**Client → Server Messages:**
- `join` - Join a conversation room
- `message` - Send a message
- `typing` - Send typing indicator
- `read` - Mark message as read

**Server → Client Messages:**
- `history` - Message history on room join
- `message` - New message received
- `typing` - Other user typing status
- `read` - Message read receipt
- `error` - Error notification

## Key Features Implementation

### Session Persistence
User sessions are stored in `localStorage` and automatically restored on page reload.

### Real-time Updates
WebSocket connection maintains real-time message delivery with automatic reconnection on disconnect.

### Responsive Design
Mobile-first design using TailwindCSS utilities for all screen sizes.

### User Experience
- Visual connection status indicator
- Loading states on all async operations
- Optimistic UI updates
- Smooth scrolling to new messages
- Date separators in message history

## Language

All UI text is in Portuguese (Brazil):
- "Entrar" - Login
- "Suas Conversas" - Your Conversations
- "Iniciar Nova Conversa" - Start New Conversation
- "Digite uma mensagem..." - Type a message...
- "Conectado/Desconectado" - Connected/Disconnected

## License

MIT

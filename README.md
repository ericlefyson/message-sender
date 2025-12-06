# Real-Time 1:1 Chat Application

A modern, real-time chat application with 1:1 private conversations built using React 18, TypeScript, and WebSocket.

## Project Structure

```
message-sender/
├── frontend/           # React 18 + TypeScript + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── hooks/
│   │   ├── types/
│   │   └── utils/
│   └── README.md
└── backend/           # Backend server (to be implemented)
    └── README.md
```

## Features

### ✅ Frontend (Complete)

- **User Authentication** - Login with username, session persistence
- **1:1 Conversations** - Private messaging between two users
- **Real-time Messaging** - WebSocket-based instant delivery
- **Conversation List** - View all chats and start new ones
- **Typing Indicators** - See when the other person is typing
- **Read Receipts** - Visual feedback for read messages
- **Message History** - Date-grouped message display
- **Responsive Design** - Mobile-first TailwindCSS styling
- **Auto-Reconnect** - WebSocket reconnection on disconnect

### 🔄 Backend (To Be Implemented)

The backend needs to provide:
- REST API endpoints for authentication and conversation management
- WebSocket server for real-time messaging
- Database for storing users, conversations, and messages

## Getting Started

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

The frontend will run on `http://localhost:5173`

See [frontend/README.md](frontend/README.md) for detailed documentation.

### Backend

The backend directory is ready for implementation. It should provide:
- User authentication endpoints
- Conversation and message management
- WebSocket server for real-time communication

## Tech Stack

### Frontend
- React 18
- TypeScript
- Vite
- TailwindCSS
- WebSocket API

### Backend (Suggested)
- Node.js / Express
- WebSocket (ws library)
- PostgreSQL / MongoDB
- Prisma / TypeORM

## API Contract

The frontend expects these endpoints:

### REST API
- `POST /api/auth/login` - Login with username
- `GET /api/users` - Get all users
- `GET /api/conversations` - Get user's conversations
- `POST /api/conversations` - Create conversation
- `GET /api/conversations/:id/messages` - Get messages

### WebSocket
- Connect: `ws://localhost:3001?userId={userId}`
- Message types: `join`, `message`, `typing`, `read`

## Development Workflow

1. ✅ Frontend implementation complete
2. 🔄 Implement backend server
3. 🔄 Connect frontend to backend
4. 🔄 Test real-time messaging
5. 🔄 Deploy to production

## Environment Variables

### Frontend (.env)
```
VITE_API_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001
```

### Backend (to be configured)
```
PORT=3001
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
```

## License

MIT

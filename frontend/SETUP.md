# Chat App - Setup Guide

## ✅ Project Status

The frontend is **complete and production-ready**!

## 📁 Project Structure

```
message-sender/
├── backend/                 # Empty - ready for backend implementation
│   └── README.md
├── frontend/               # ✅ Complete React application
│   ├── src/
│   │   ├── components/    # 8 UI components
│   │   ├── contexts/      # Auth context
│   │   ├── hooks/         # WebSocket hook
│   │   ├── types/         # TypeScript definitions
│   │   └── utils/         # Utility functions
│   ├── dist/              # Build output
│   ├── .env               # Environment config
│   └── package.json
└── README.md
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Environment

The `.env` file is already configured with defaults:

```env
VITE_API_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001
```

### 3. Start Development Server

```bash
npm run dev
```

Visit: `http://localhost:5173`

### 4. Build for Production

```bash
npm run build
```

The production build will be in `frontend/dist/`

## ✨ Features Implemented

### Authentication
- ✅ Username-based login
- ✅ Session persistence (localStorage)
- ✅ Auto-restore on reload

### Messaging
- ✅ Real-time message delivery
- ✅ Typing indicators
- ✅ Read receipts (✓/✓✓)
- ✅ Message history
- ✅ Date grouping (Hoje/Ontem)

### Conversations
- ✅ List all conversations
- ✅ Start new conversations
- ✅ Unread message badges
- ✅ Last message preview
- ✅ Conversation search

### UI/UX
- ✅ Mobile-responsive design
- ✅ Connection status indicator
- ✅ Loading states
- ✅ Error handling
- ✅ Smooth animations
- ✅ Portuguese (Brazil) UI

## 🔌 Backend Requirements

The frontend expects a backend with:

### REST API Endpoints

```typescript
POST   /api/auth/login              // Login with username
GET    /api/users                   // Get all users
GET    /api/conversations           // Get user's conversations
POST   /api/conversations           // Create conversation
GET    /api/conversations/:id       // Get conversation details
GET    /api/conversations/:id/messages // Get messages
```

### WebSocket Server

Connect to: `ws://localhost:3001?userId={userId}`

**Client → Server:**
- `join` - Join conversation room
- `message` - Send message
- `typing` - Typing indicator
- `read` - Mark as read

**Server → Client:**
- `history` - Message history
- `message` - New message
- `typing` - User typing
- `read` - Read receipt
- `error` - Error notification

## 📦 Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **TailwindCSS v3** - Styling
- **WebSocket API** - Real-time communication

## 🧪 Testing the Frontend

Without a backend, you can:

1. Run the dev server: `npm run dev`
2. Open the login screen
3. Attempt to login (will fail gracefully)
4. Review the UI components in browser DevTools

With a mock backend:
- The frontend will fully work once you implement the backend endpoints
- All API calls include proper error handling
- WebSocket auto-reconnects on disconnect

## 📝 Next Steps

1. **Implement Backend**
   - Choose your stack (Node.js/Express, Python/FastAPI, etc.)
   - Implement REST endpoints
   - Setup WebSocket server
   - Add database (PostgreSQL, MongoDB, etc.)

2. **Connect & Test**
   - Start both frontend and backend
   - Test real-time messaging
   - Verify all features work

3. **Deploy**
   - Build frontend: `npm run build`
   - Deploy dist/ to hosting (Vercel, Netlify, etc.)
   - Deploy backend to server
   - Update environment variables

## 🐛 Troubleshooting

### Build fails
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Port already in use
```bash
# Change port in vite.config.ts or kill the process
lsof -ti:5173 | xargs kill
```

### WebSocket connection fails
- Check backend is running on port 3001
- Verify VITE_WS_URL in .env
- Check browser console for errors

## 📚 Documentation

- [Frontend README](frontend/README.md) - Detailed frontend docs
- [Project README](README.md) - Project overview
- [Backend README](backend/README.md) - Backend placeholder

## 💡 Tips

- Use browser DevTools to inspect WebSocket messages
- Check Network tab for API call issues
- localStorage key for session: `chat_user`
- All text is in Portuguese (Brazil)

---

**Built with ❤️ using Claude Code**

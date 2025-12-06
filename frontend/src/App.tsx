import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginScreen } from './components/LoginScreen';
import { ConversationList } from './components/ConversationList';
import { ChatScreen } from './components/ChatScreen';

function AppContent() {
  const { user, isLoading } = useAuth();
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-gray-600">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  if (activeConversationId) {
    return (
      <ChatScreen
        conversationId={activeConversationId}
        onBack={() => setActiveConversationId(null)}
      />
    );
  }

  return (
    <ConversationList
      onSelectConversation={setActiveConversationId}
      activeConversationId={activeConversationId}
    />
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;

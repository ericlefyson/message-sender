import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { RepositoryProvider } from './contexts/RepositoryContext';
import { LoginScreen } from './components/LoginScreen';
import { RegisterScreen } from './components/RegisterScreen';
import { ConversationList } from './components/ConversationList';
import { ChatScreen } from './components/ChatScreen';

function AppContent() {
  const { user, isLoading } = useAuth();
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [showRegister, setShowRegister] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-gray-600">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    if (showRegister) {
      return <RegisterScreen onBackToLogin={() => setShowRegister(false)} />;
    }
    return <LoginScreen onShowRegister={() => setShowRegister(true)} />;
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
    <RepositoryProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </RepositoryProvider>
  );
}

export default App;

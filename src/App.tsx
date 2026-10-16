import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useHashRoute } from './lib/router';
import { Navbar } from './components/Navbar';
import { MobileTabBar, Sidebar } from './components/Sidebar';
import { RightPanel } from './components/RightPanel';
import { CreatePostModal } from './components/CreatePostModal';
import { Toaster, cx } from './components/ui';
import { PenSquare } from 'lucide-react';

import { FeedView } from './views/FeedView';
import { ExploreView } from './views/ExploreView';
import { EventsView } from './views/EventsView';
import { ChatView } from './views/ChatView';
import { NotificationsView } from './views/NotificationsView';
import { ProfileView } from './views/ProfileView';
import { PostView } from './views/PostView';
import { AdminView } from './views/AdminView';
import { SettingsView } from './views/SettingsView';
import { AuthView } from './views/AuthView';

function MainAppContent() {
  const { currentUser } = useAuth();
  const { route, navigate, replace } = useHashRoute();
  const [isComposerOpen, setIsComposerOpen] = useState(false);

  const { view, param } = route;

  const openComposer = () => {
    if (currentUser) setIsComposerOpen(true);
    else navigate('auth');
  };

  const renderView = () => {
    switch (view) {
      case 'explore':
        return <ExploreView key={param ?? ''} onNavigate={navigate} initialQuery={param ?? ''} />;
      case 'events':
        return <EventsView onNavigate={navigate} highlightEventId={param} />;
      case 'chat':
        return <ChatView onNavigate={navigate} initialUserId={param} />;
      case 'notifications':
        return <NotificationsView onNavigate={navigate} />;
      case 'saved':
        return <ProfileView key={`saved-${currentUser?.id}`} userId={currentUser?.id} initialTab="saved" onNavigate={navigate} />;
      case 'profile': {
        const userId = param || currentUser?.id;
        return <ProfileView key={userId ?? 'none'} userId={userId} onNavigate={navigate} />;
      }
      case 'post':
        return <PostView key={param} postId={param} onNavigate={navigate} />;
      case 'admin':
        return <AdminView onNavigate={navigate} />;
      case 'settings':
        return <SettingsView onNavigate={navigate} />;
      case 'auth':
        return <AuthView onSuccess={() => replace('feed')} />;
      default:
        return <FeedView onNavigate={navigate} onOpenCreatePost={openComposer} />;
    }
  };

  const isAuth = view === 'auth';
  const isChat = view === 'chat';
  const showRightPanel = !isAuth && !isChat && view !== 'admin';
  const showFab = !!currentUser && !isAuth && !isChat;

  return (
    <div className="min-h-dvh">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-3 focus:py-2 focus:bg-surface focus:rounded-md"
      >
        Pular para o conteúdo
      </a>

      <Navbar currentView={view} onNavigate={navigate} onOpenCreatePost={openComposer} />

      <div
        className={cx(
          'max-w-[1280px] mx-auto flex items-start gap-8 sm:px-5',
          isChat ? 'lg:py-6' : 'pt-3 sm:pt-6 pb-[calc(var(--tabbar-h)+1.5rem)] lg:pb-10'
        )}
      >
        {!isAuth && (
          <Sidebar currentView={view} currentParam={param} onNavigate={navigate} />
        )}

        <main id="main" className="flex-1 min-w-0">
          {renderView()}
        </main>

        {showRightPanel && <RightPanel onNavigate={navigate} />}
      </div>

      {!isAuth && <MobileTabBar currentView={view} currentParam={param} onNavigate={navigate} />}

      {showFab && (
        <button
          onClick={openComposer}
          aria-label="Nova publicação"
          className="lg:hidden fixed z-30 right-4 bottom-[calc(var(--tabbar-h)+1rem)] w-14 h-14 rounded-full bg-accent text-accent-fg shadow-lg flex items-center justify-center active:scale-95 transition-transform"
        >
          <PenSquare className="w-6 h-6" />
        </button>
      )}

      <CreatePostModal
        isOpen={isComposerOpen}
        onClose={() => setIsComposerOpen(false)}
        onPostCreated={() => {
          if (view !== 'feed') navigate('feed');
        }}
      />

      <Toaster />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}

import React from 'react';
import { useAuth } from '../context/AuthContext';
import { storage } from '../services/storage';
import { Navigate } from '../lib/router';
import { PostCard } from '../components/PostCard';
import { Button, EmptyState, Panel } from '../components/ui';
import { ArrowLeft } from 'lucide-react';

export const PostView: React.FC<{ postId?: string; onNavigate: Navigate }> = ({ postId, onNavigate }) => {
  useAuth(); // re-renderiza quando os dados mudam
  const post = postId ? storage.getPostById(postId) : undefined;

  return (
    <div className="max-w-2xl mx-auto w-full">
      <button
        onClick={() => (window.history.length > 1 ? window.history.back() : onNavigate('feed'))}
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink mb-3 px-4 sm:px-0 h-8"
      >
        <ArrowLeft className="w-4 h-4" /> Voltar
      </button>
      <Panel>
        {post ? (
          <PostCard post={post} onNavigate={onNavigate} defaultShowComments />
        ) : (
          <EmptyState
            title="Publicação não encontrada"
            text="Ela pode ter sido excluída pelo autor ou pela moderação."
            action={<Button size="sm" onClick={() => onNavigate('feed')}>Ir para o início</Button>}
          />
        )}
      </Panel>
    </div>
  );
};

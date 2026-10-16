import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { storage } from '../services/storage';
import { Navigate } from '../lib/router';
import { PostCard } from '../components/PostCard';
import { UserAvatar } from '../components/UserAvatar';
import { Button, EmptyState, Panel, Tabs } from '../components/ui';
import { IFSP_CAMPUSES } from '../data/campuses';

interface FeedViewProps {
  onNavigate: Navigate;
  onOpenCreatePost: () => void;
}

type FeedTab = 'recent' | 'following' | 'campus';

const ALL_CAMPI = 'Todos os Campi (Geral)';

export const FeedView: React.FC<FeedViewProps> = ({ onNavigate, onOpenCreatePost }) => {
  const { currentUser } = useAuth();
  const [tab, setTab] = useState<FeedTab>('recent');
  const [campusFilter, setCampusFilter] = useState('all');

  const blocked = new Set(currentUser?.blockedUsers ?? []);
  let posts = storage.getPosts().filter(p => !blocked.has(p.authorId));

  if (tab === 'following' && currentUser) {
    const following = new Set(storage.getFollowing(currentUser.id).map(u => u.id));
    posts = posts.filter(p => following.has(p.authorId) || p.authorId === currentUser.id);
  } else if (tab === 'campus' && currentUser) {
    posts = posts.filter(p => p.campus === currentUser.campus || p.campus === ALL_CAMPI);
  } else if (campusFilter !== 'all') {
    posts = posts.filter(p => p.campus === campusFilter || p.campus === ALL_CAMPI);
  }

  posts.sort((a, b) => {
    // Fixados primeiro apenas na aba "Recentes".
    if (tab === 'recent' && !!a.isPinned !== !!b.isPinned) return a.isPinned ? -1 : 1;
    return b.createdAt.localeCompare(a.createdAt);
  });

  const tabs = [
    { id: 'recent' as const, label: 'Recentes' },
    ...(currentUser
      ? [
          { id: 'following' as const, label: 'Seguindo' },
          { id: 'campus' as const, label: 'Meu campus' }
        ]
      : [])
  ];

  return (
    <div className="max-w-2xl mx-auto w-full">
      {!currentUser && (
        <Panel className="px-5 py-5 mb-4">
          <h1 className="text-lg font-semibold">O fórum da comunidade IFSP</h1>
          <p className="text-sm text-ink-2 mt-1 leading-relaxed">
            Tire dúvidas de disciplinas, divulgue projetos e acompanhe eventos dos campi.
          </p>
          <div className="flex gap-2 mt-4">
            <Button variant="primary" size="sm" onClick={() => onNavigate('auth')}>Criar conta</Button>
            <Button variant="secondary" size="sm" onClick={() => onNavigate('auth')}>Entrar</Button>
          </div>
        </Panel>
      )}

      <Panel className="overflow-hidden">
        {currentUser && (
          <button
            onClick={onOpenCreatePost}
            className="w-full flex items-center gap-3 px-4 sm:px-5 py-3.5 border-b border-line text-left group"
          >
            <UserAvatar user={currentUser} size="md" />
            <span className="flex-1 text-[15px] text-muted group-hover:text-ink-2 transition-colors">
              No que você está trabalhando?
            </span>
            <span className="hidden sm:inline-flex h-8 px-3 items-center rounded-md bg-accent text-accent-fg text-[13px] font-medium">
              Publicar
            </span>
          </button>
        )}

        <div className="flex items-center justify-between border-b border-line pr-3">
          <Tabs items={tabs} value={tab} onChange={setTab} className="border-b-0 flex-1" />
          {tab === 'recent' && (
            <select
              value={campusFilter}
              onChange={e => setCampusFilter(e.target.value)}
              aria-label="Filtrar por campus"
              className="shrink-0 max-w-[9.5rem] sm:max-w-[12rem] h-8 pl-2 pr-1 rounded-md bg-transparent text-[13px] text-ink-2 hover:bg-subtle focus:outline-none cursor-pointer"
            >
              <option value="all">Todos os campi</option>
              {IFSP_CAMPUSES.map(c => (
                <option key={c.id} value={c.name}>{c.name.replace('IFSP ', '')}</option>
              ))}
            </select>
          )}
        </div>

        {posts.length === 0 ? (
          <EmptyState
            title={tab === 'following' ? 'Nada por aqui ainda' : 'Nenhuma publicação'}
            text={
              tab === 'following'
                ? 'Siga colegas e professores para ver as publicações deles nesta aba.'
                : 'Ainda não há publicações para esse filtro.'
            }
            action={
              tab === 'following' ? (
                <Button size="sm" onClick={() => onNavigate('explore')}>Encontrar pessoas</Button>
              ) : (
                <Button size="sm" variant="primary" onClick={onOpenCreatePost}>Escrever a primeira</Button>
              )
            }
          />
        ) : (
          <div className="divide-y divide-line">
            {posts.map(post => (
              <PostCard key={post.id} post={post} onNavigate={onNavigate} />
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
};

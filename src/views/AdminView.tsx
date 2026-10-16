import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { storage } from '../services/storage';
import { Navigate } from '../lib/router';
import { Report } from '../types';
import { ROLE_LABELS, timeAgo } from '../lib/format';
import { RoleTag, UserAvatar } from '../components/UserAvatar';
import { Button, EmptyState, PageHeader, Panel, Tabs, cx, inputClass, toast } from '../components/ui';
import { Search } from 'lucide-react';

const TYPE_LABEL: Record<Report['targetType'], string> = {
  post: 'Publicação',
  comment: 'Comentário',
  event: 'Evento',
  user: 'Perfil'
};

export const AdminView: React.FC<{ onNavigate: Navigate }> = ({ onNavigate }) => {
  const { currentUser } = useAuth();
  const [tab, setTab] = useState<'pending' | 'history' | 'users'>('pending');
  const [userSearch, setUserSearch] = useState('');

  const isMod = currentUser?.role === 'admin' || currentUser?.role === 'moderator';

  if (!currentUser || !isMod) {
    return (
      <Panel className="max-w-md mx-auto">
        <EmptyState
          title="Área restrita"
          text="Só a equipe de moderação tem acesso a esta página."
          action={<Button size="sm" onClick={() => onNavigate('feed')}>Voltar ao início</Button>}
        />
      </Panel>
    );
  }

  const reports = storage.getReports();
  const pending = reports.filter(r => r.status === 'pending');
  const history = reports.filter(r => r.status !== 'pending');
  const users = storage.getUsers();

  const preview = (r: Report): { text: string; exists: boolean; open?: () => void } => {
    switch (r.targetType) {
      case 'post': {
        const p = storage.getPostById(r.targetId);
        return p
          ? { text: p.content, exists: true, open: () => onNavigate('post', p.id) }
          : { text: 'Publicação já removida', exists: false };
      }
      case 'comment': {
        const c = storage.getComments().find(c => c.id === r.targetId);
        return c
          ? { text: c.content, exists: true, open: () => onNavigate('post', c.postId) }
          : { text: 'Comentário já removido', exists: false };
      }
      case 'event': {
        const e = storage.getEventById(r.targetId);
        return e
          ? { text: e.title, exists: true, open: () => onNavigate('events', e.id) }
          : { text: 'Evento já removido', exists: false };
      }
      case 'user': {
        const u = storage.getUserById(r.targetId);
        return u
          ? { text: `${u.name} (@${u.username})`, exists: true, open: () => onNavigate('profile', u.id) }
          : { text: 'Conta removida', exists: false };
      }
    }
  };

  const removeContent = (r: Report) => {
    if (r.targetType === 'user') {
      const u = storage.getUserById(r.targetId);
      if (!u || !window.confirm(`Suspender a conta de ${u.name}?`)) return;
      storage.suspendUser(u.id, true);
    } else {
      if (!window.confirm('Remover este conteúdo? Essa ação não pode ser desfeita.')) return;
      if (r.targetType === 'post') storage.deletePost(r.targetId, currentUser.id);
      if (r.targetType === 'comment') storage.deleteComment(r.targetId, currentUser.id);
      if (r.targetType === 'event') storage.deleteEvent(r.targetId, currentUser.id);
    }
    // Resolve as outras denúncias sobre o mesmo alvo.
    reports
      .filter(x => x.targetId === r.targetId && x.status === 'pending')
      .forEach(x => storage.updateReportStatus(x.id, 'resolved'));
    toast(r.targetType === 'user' ? 'Conta suspensa' : 'Conteúdo removido');
  };

  const toggleSuspend = (userId: string, suspended: boolean) => {
    if (!window.confirm(suspended ? 'Reativar esta conta?' : 'Suspender esta conta? A pessoa não conseguirá entrar.')) return;
    storage.suspendUser(userId, !suspended);
    toast(suspended ? 'Conta reativada' : 'Conta suspensa');
  };

  const q = userSearch.trim().toLowerCase();
  const filteredUsers = users.filter(u =>
    !q || [u.name, u.username, u.campus, u.email].some(f => f.toLowerCase().includes(q))
  );

  const renderReport = (r: Report) => {
    const reporter = storage.getUserById(r.reporterId);
    const target = preview(r);
    return (
      <li key={r.id} className="px-4 sm:px-5 py-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-mono uppercase tracking-wider text-muted">{TYPE_LABEL[r.targetType]}</p>
            <p className="text-sm font-medium text-ink mt-0.5">{r.reason}</p>
            {r.details && <p className="text-sm text-ink-2 mt-1">“{r.details}”</p>}
          </div>
          <span className="text-xs text-muted shrink-0">{timeAgo(r.createdAt)}</span>
        </div>

        <button
          onClick={target.open}
          disabled={!target.exists}
          className="block w-full text-left text-sm text-ink-2 bg-subtle rounded-md px-3 py-2 line-clamp-3 enabled:hover:text-ink disabled:italic disabled:text-muted"
        >
          {target.text}
        </button>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs text-muted">
            Denunciado por {reporter?.name ?? 'conta removida'}
          </span>
          {r.status === 'pending' ? (
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" onClick={() => storage.updateReportStatus(r.id, 'dismissed')}>
                Descartar
              </Button>
              {target.exists && (
                <Button size="sm" variant="danger" onClick={() => removeContent(r)}>
                  {r.targetType === 'user' ? 'Suspender conta' : 'Remover'}
                </Button>
              )}
              {!target.exists && (
                <Button size="sm" onClick={() => storage.updateReportStatus(r.id, 'resolved')}>
                  Marcar resolvida
                </Button>
              )}
            </div>
          ) : (
            <span className={cx('text-xs font-medium', r.status === 'resolved' ? 'text-accent-ink' : 'text-muted')}>
              {r.status === 'resolved' ? 'Resolvida' : 'Descartada'}
            </span>
          )}
        </div>
      </li>
    );
  };

  return (
    <div className="max-w-3xl mx-auto w-full">
      <PageHeader title="Moderação" description="Denúncias da comunidade e gestão de contas." />

      <dl className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-line border-y sm:border border-line sm:rounded-lg overflow-hidden mb-4">
        {[
          { label: 'Denúncias pendentes', value: pending.length },
          { label: 'Contas', value: users.length },
          { label: 'Publicações', value: storage.getPosts().length },
          { label: 'Eventos', value: storage.getEvents().length }
        ].map(stat => (
          <div key={stat.label} className="bg-surface px-4 py-3">
            <dt className="text-xs text-muted">{stat.label}</dt>
            <dd className="text-2xl font-semibold text-ink mt-0.5 font-mono">{stat.value}</dd>
          </div>
        ))}
      </dl>

      <Panel className="overflow-hidden">
        <Tabs
          value={tab}
          onChange={setTab}
          items={[
            { id: 'pending', label: 'Pendentes', count: pending.length },
            { id: 'history', label: 'Histórico', count: history.length },
            { id: 'users', label: 'Contas', count: users.length }
          ]}
        />

        {tab === 'pending' && (
          pending.length === 0
            ? <EmptyState title="Nenhuma denúncia pendente" />
            : <ul className="divide-y divide-line">{pending.map(renderReport)}</ul>
        )}

        {tab === 'history' && (
          history.length === 0
            ? <EmptyState title="Nenhuma denúncia analisada ainda" />
            : <ul className="divide-y divide-line">{history.map(renderReport)}</ul>
        )}

        {tab === 'users' && (
          <>
            <div className="p-3 sm:px-5 border-b border-line">
              <label className="relative block">
                <span className="sr-only">Buscar contas</span>
                <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="search"
                  value={userSearch}
                  onChange={e => setUserSearch(e.target.value)}
                  placeholder="Nome, usuário, e-mail ou campus"
                  className={cx(inputClass, 'pl-9')}
                />
              </label>
            </div>
            <ul className="divide-y divide-line">
              {filteredUsers.map(u => (
                <li key={u.id} className="flex items-center gap-3 px-4 sm:px-5 py-3">
                  <button onClick={() => onNavigate('profile', u.id)} className="shrink-0 rounded-full">
                    <UserAvatar user={u} size="md" />
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1.5">
                      <span className="text-sm font-medium text-ink truncate">{u.name}</span>
                      <RoleTag role={u.role} />
                    </p>
                    <p className="text-xs text-muted truncate">
                      {ROLE_LABELS[u.role]} · {u.campus}
                      {u.isSuspended && <span className="text-danger font-medium"> · suspensa</span>}
                    </p>
                  </div>
                  {u.id !== currentUser.id && u.role !== 'admin' && (
                    <Button
                      size="sm"
                      variant={u.isSuspended ? 'secondary' : 'danger-ghost'}
                      onClick={() => toggleSuspend(u.id, !!u.isSuspended)}
                    >
                      {u.isSuspended ? 'Reativar' : 'Suspender'}
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          </>
        )}
      </Panel>
    </div>
  );
};

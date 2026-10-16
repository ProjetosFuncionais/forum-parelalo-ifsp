import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { storage } from '../services/storage';
import { Navigate } from '../lib/router';
import { clockTime, timeAgo } from '../lib/format';
import { Message } from '../types';
import { RoleTag, UserAvatar } from '../components/UserAvatar';
import { Button, EmptyState, IconButton, Modal, Panel, cx, inputClass } from '../components/ui';
import { ArrowLeft, Check, CheckCheck, PenSquare, Search, SendHorizontal } from 'lucide-react';

interface ChatViewProps {
  onNavigate: Navigate;
  initialUserId?: string;
}

function dayLabel(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Hoje';
  if (d.toDateString() === yesterday.toDateString()) return 'Ontem';
  return d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' });
}

export const ChatView: React.FC<ChatViewProps> = ({ onNavigate, initialUserId }) => {
  const { currentUser, availableUsers, dataVersion } = useAuth();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [search, setSearch] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [newSearch, setNewSearch] = useState('');
  const [mobilePane, setMobilePane] = useState<'list' | 'thread'>('list');
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const userId = currentUser?.id;

  // Abre a conversa pedida pela URL (/chat/<usuário>) ou a mais recente.
  // Depende só do id: antes, cada gravação no storage recriava o usuário e reabria a conversa.
  useEffect(() => {
    if (!userId) return;
    if (initialUserId && initialUserId !== userId) {
      const conv = storage.getOrCreateConversation(userId, initialUserId);
      setActiveId(conv.id);
      setMobilePane('thread');
    } else {
      setActiveId(storage.getConversations(userId)[0]?.id ?? null);
      setMobilePane('list');
    }
  }, [userId, initialUserId]);

  const conversations = userId ? storage.getConversations(userId) : [];
  const active = conversations.find(c => c.id === activeId) ?? null;
  const partnerId = active?.participants.find(p => p !== userId);
  const partner = partnerId ? storage.getUserById(partnerId) : undefined;
  const messages: Message[] = active ? storage.getMessages(active.id) : [];

  // Marca como lida tanto ao abrir quanto ao receber mensagem com a conversa aberta.
  useEffect(() => {
    if (active && userId && (active.unreadCount?.[userId] ?? 0) > 0) {
      storage.markConversationAsRead(active.id, userId);
    }
  }, [active, userId, dataVersion]);

  useLayoutEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [activeId, messages.length]);

  if (!currentUser) {
    return (
      <Panel className="max-w-md mx-auto mt-6">
        <EmptyState
          title="Entre para conversar"
          text="Mande mensagens diretas para colegas e professores de qualquer campus."
          action={<Button variant="primary" size="sm" onClick={() => onNavigate('auth')}>Entrar</Button>}
        />
      </Panel>
    );
  }

  const iBlocked = !!partner && (currentUser.blockedUsers ?? []).includes(partner.id);
  const blockedMe = !!partner && (partner.blockedUsers ?? []).includes(currentUser.id);

  const send = (e?: React.FormEvent) => {
    e?.preventDefault();
    const content = text.trim();
    if (!content || !active || iBlocked || blockedMe) return;
    storage.sendMessage(active.id, currentUser.id, content);
    setText('');
    inputRef.current?.focus();
  };

  const openConversation = (id: string) => {
    setActiveId(id);
    setMobilePane('thread');
  };

  const startWith = (targetId: string) => {
    const conv = storage.getOrCreateConversation(currentUser.id, targetId);
    setShowNew(false);
    setNewSearch('');
    openConversation(conv.id);
  };

  const q = search.trim().toLowerCase();
  const visibleConversations = conversations.filter(c => {
    if (!q) return true;
    const p = storage.getUserById(c.participants.find(id => id !== currentUser.id) ?? '');
    return p?.name.toLowerCase().includes(q) || c.lastMessage.toLowerCase().includes(q);
  });

  const contacts = availableUsers.filter(
    u =>
      u.id !== currentUser.id &&
      !u.isSuspended &&
      (!newSearch.trim() || `${u.name} ${u.username} ${u.campus}`.toLowerCase().includes(newSearch.trim().toLowerCase()))
  );

  return (
    <div
      className={cx(
        'bg-surface sm:border border-line sm:rounded-lg overflow-hidden flex',
        'h-[calc(100dvh-var(--header-h)-var(--tabbar-h))] lg:h-[calc(100dvh-var(--header-h)-3rem)]'
      )}
    >
      {/* Lista de conversas */}
      <section
        aria-label="Conversas"
        className={cx(
          'w-full md:w-80 md:border-r border-line flex-col min-h-0',
          mobilePane === 'thread' ? 'hidden md:flex' : 'flex'
        )}
      >
        <div className="flex items-center justify-between gap-2 pl-4 pr-2 h-14 border-b border-line shrink-0">
          <h1 className="text-base font-semibold">Mensagens</h1>
          <IconButton label="Nova conversa" onClick={() => setShowNew(true)}>
            <PenSquare className="w-[18px] h-[18px]" />
          </IconButton>
        </div>

        <div className="p-3 border-b border-line shrink-0">
          <label className="relative block">
            <span className="sr-only">Buscar conversa</span>
            <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar"
              className="w-full h-9 pl-9 pr-3 rounded-md bg-subtle text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/20"
            />
          </label>
        </div>

        <ul className="flex-1 overflow-y-auto">
          {visibleConversations.length === 0 ? (
            <li>
              <EmptyState
                title={q ? 'Nenhuma conversa encontrada' : 'Nenhuma conversa ainda'}
                action={!q && <Button size="sm" onClick={() => setShowNew(true)}>Começar uma conversa</Button>}
              />
            </li>
          ) : (
            visibleConversations.map(conv => {
              const p = storage.getUserById(conv.participants.find(id => id !== currentUser.id) ?? '');
              const unread = conv.unreadCount?.[currentUser.id] ?? 0;
              const selected = conv.id === activeId;
              return (
                <li key={conv.id}>
                  <button
                    onClick={() => openConversation(conv.id)}
                    aria-current={selected ? 'true' : undefined}
                    className={cx(
                      'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors',
                      selected ? 'md:bg-subtle' : 'hover:bg-subtle'
                    )}
                  >
                    <UserAvatar user={p} size="md" />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline justify-between gap-2">
                        <span className={cx('text-sm truncate', unread ? 'font-semibold text-ink' : 'font-medium text-ink')}>
                          {p?.name ?? 'Conta removida'}
                        </span>
                        {conv.lastMessage && (
                          <span className="text-xs text-muted shrink-0">{timeAgo(conv.lastMessageAt)}</span>
                        )}
                      </span>
                      <span className="flex items-center gap-2">
                        <span className={cx('text-[13px] truncate flex-1', unread ? 'text-ink-2' : 'text-muted')}>
                          {conv.lastMessageSenderId === currentUser.id && conv.lastMessage ? 'Você: ' : ''}
                          {conv.lastMessage || 'Nova conversa'}
                        </span>
                        {unread > 0 && (
                          <span className="min-w-5 h-5 px-1.5 rounded-full bg-accent text-accent-fg text-[11px] font-semibold leading-5 text-center">
                            {unread}
                          </span>
                        )}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })
          )}
        </ul>
      </section>

      {/* Conversa aberta */}
      <section
        aria-label="Conversa"
        className={cx('flex-1 flex-col min-w-0 min-h-0', mobilePane === 'list' ? 'hidden md:flex' : 'flex')}
      >
        {active && partner ? (
          <>
            <header className="flex items-center gap-2 px-2 md:px-4 h-14 border-b border-line shrink-0">
              <IconButton label="Voltar para conversas" className="md:hidden" onClick={() => setMobilePane('list')}>
                <ArrowLeft className="w-5 h-5" />
              </IconButton>
              <button
                onClick={() => onNavigate('profile', partner.id)}
                className="flex items-center gap-2.5 min-w-0 rounded-md pr-2"
              >
                <UserAvatar user={partner} size="sm" />
                <span className="min-w-0 text-left">
                  <span className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold text-ink truncate">{partner.name}</span>
                    <RoleTag role={partner.role} />
                  </span>
                  <span className="block text-xs text-muted truncate">{partner.campus}</span>
                </span>
              </button>
            </header>

            <div className="flex-1 overflow-y-auto px-3 md:px-5 py-4 bg-bg">
              {messages.length === 0 ? (
                <p className="text-center text-sm text-muted py-10">
                  Envie a primeira mensagem para {partner.name.split(' ')[0]}.
                </p>
              ) : (
                <ol className="space-y-1">
                  {messages.map((msg, i) => {
                    const mine = msg.senderId === currentUser.id;
                    const prev = messages[i - 1];
                    const newDay = !prev || new Date(prev.createdAt).toDateString() !== new Date(msg.createdAt).toDateString();
                    const grouped = prev && !newDay && prev.senderId === msg.senderId;
                    return (
                      <li key={msg.id}>
                        {newDay && (
                          <p className="text-center text-xs text-muted my-4">{dayLabel(msg.createdAt)}</p>
                        )}
                        <div className={cx('flex', mine ? 'justify-end' : 'justify-start', !grouped && !newDay && 'mt-3')}>
                          <div
                            className={cx(
                              'max-w-[80%] md:max-w-[65%] px-3.5 py-2 rounded-lg text-[15px] leading-snug',
                              mine
                                ? 'bg-accent text-accent-fg rounded-br-sm'
                                : 'bg-surface text-ink border border-line rounded-bl-sm'
                            )}
                          >
                            <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                            <p
                              className={cx(
                                'flex items-center justify-end gap-1 text-[11px] mt-1',
                                mine ? 'text-accent-fg/75' : 'text-muted'
                              )}
                            >
                              {clockTime(msg.createdAt)}
                              {mine && (msg.read
                                ? <CheckCheck className="w-3.5 h-3.5" aria-label="Lida" />
                                : <Check className="w-3.5 h-3.5" aria-label="Enviada" />)}
                            </p>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              )}
              <div ref={endRef} />
            </div>

            {iBlocked || blockedMe ? (
              <p className="px-4 py-4 border-t border-line text-sm text-muted text-center shrink-0">
                {iBlocked
                  ? 'Você bloqueou esta pessoa. Desbloqueie em Configurações para enviar mensagens.'
                  : 'Não é possível enviar mensagens para esta pessoa.'}
              </p>
            ) : (
              <form onSubmit={send} className="flex items-end gap-2 p-2 md:p-3 border-t border-line shrink-0">
                <textarea
                  ref={inputRef}
                  value={text}
                  onChange={e => setText(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                      e.preventDefault();
                      send();
                    }
                  }}
                  rows={1}
                  maxLength={2000}
                  placeholder="Escreva uma mensagem"
                  aria-label="Mensagem"
                  className={cx(inputClass, 'h-auto min-h-10 max-h-32 py-2 resize-none field-sizing-content')}
                />
                <IconButton
                  type="submit"
                  label="Enviar"
                  disabled={!text.trim()}
                  className="w-10 h-10 shrink-0 bg-accent text-accent-fg hover:bg-accent-hover hover:text-accent-fg disabled:opacity-40"
                >
                  <SendHorizontal className="w-[18px] h-[18px]" />
                </IconButton>
              </form>
            )}
          </>
        ) : (
          <EmptyState
            className="m-auto"
            title="Nenhuma conversa aberta"
            text="Escolha uma conversa ao lado ou comece uma nova."
            action={<Button size="sm" onClick={() => setShowNew(true)}>Nova conversa</Button>}
          />
        )}
      </section>

      <Modal open={showNew} onClose={() => setShowNew(false)} title="Nova conversa" size="sm">
        <label className="relative block mb-3">
          <span className="sr-only">Buscar pessoas</span>
          <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            value={newSearch}
            onChange={e => setNewSearch(e.target.value)}
            placeholder="Nome, usuário ou campus"
            className={cx(inputClass, 'pl-9')}
          />
        </label>
        <ul className="-mx-5">
          {contacts.map(user => (
            <li key={user.id}>
              <button
                onClick={() => startWith(user.id)}
                className="w-full flex items-center gap-3 px-5 py-2.5 text-left hover:bg-subtle"
              >
                <UserAvatar user={user} size="md" />
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-ink truncate">{user.name}</span>
                  <span className="block text-xs text-muted truncate">@{user.username} · {user.campus}</span>
                </span>
              </button>
            </li>
          ))}
          {contacts.length === 0 && <li className="px-5 py-6 text-sm text-muted text-center">Ninguém encontrado.</li>}
        </ul>
      </Modal>
    </div>
  );
};

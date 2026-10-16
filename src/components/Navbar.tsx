import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from '../lib/router';
import { UserAvatar } from './UserAvatar';
import { Button, IconButton, Menu, MenuItem, cx } from './ui';
import {
  Sun, Moon, Bell, LogOut, Shield, Settings, User as UserIcon,
  Search, PenSquare, Repeat, Check
} from 'lucide-react';

interface NavbarProps {
  currentView: string;
  onNavigate: Navigate;
  onOpenCreatePost: () => void;
}

export const Logo: React.FC<{ className?: string }> = ({ className }) => (
  <span className={cx('inline-flex items-center gap-2', className)}>
    <svg viewBox="0 0 32 32" className="w-7 h-7 shrink-0" aria-hidden="true">
      <rect width="32" height="32" rx="6" className="fill-accent" />
      <rect x="10" y="8" width="3.5" height="16" className="fill-accent-fg" />
      <rect x="18.5" y="8" width="3.5" height="16" className="fill-accent-fg" />
    </svg>
    <span className="leading-none">
      <span className="block text-[15px] font-semibold tracking-tight text-ink">Fórum Paralelo</span>
      <span className="block text-[10.5px] font-mono uppercase tracking-[0.12em] text-muted mt-0.5">IFSP</span>
    </span>
  </span>
);

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate, onOpenCreatePost }) => {
  const {
    currentUser, theme, toggleTheme, logout,
    availableUsers, switchUser, unreadNotificationsCount
  } = useAuth();
  const [query, setQuery] = useState('');
  const [showAccounts, setShowAccounts] = useState(false);

  const isMod = currentUser?.role === 'admin' || currentUser?.role === 'moderator';

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigate('explore', query.trim() || undefined);
  };

  return (
    <header className="sticky top-0 z-30 h-[var(--header-h)] bg-bg/90 backdrop-blur-md border-b border-line pt-[env(safe-area-inset-top)] box-content">
      <div className="h-full max-w-[1280px] mx-auto px-3 sm:px-5 flex items-center gap-3">
        <a
          href="#/feed"
          onClick={e => {
            e.preventDefault();
            onNavigate('feed');
          }}
          className="shrink-0 rounded-md -ml-1 p-1"
          aria-label="Fórum Paralelo IFSP, ir para o início"
        >
          <Logo />
        </a>

        {/* Busca (tablet/desktop) */}
        <form onSubmit={submitSearch} className="hidden md:block flex-1 max-w-md mx-auto" role="search">
          <label className="relative block">
            <span className="sr-only">Buscar</span>
            <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Buscar pessoas, posts, #tags"
              className="w-full h-9 pl-9 pr-3 rounded-md bg-subtle border border-transparent text-sm text-ink placeholder:text-muted focus:outline-none focus:bg-surface focus:border-line-strong"
            />
          </label>
        </form>

        <div className="ml-auto md:ml-0 flex items-center gap-1">
          <IconButton
            label="Buscar"
            className="md:hidden"
            onClick={() => onNavigate('explore')}
          >
            <Search className="w-[18px] h-[18px]" />
          </IconButton>

          <IconButton label={theme === 'dark' ? 'Usar tema claro' : 'Usar tema escuro'} onClick={toggleTheme}>
            {theme === 'dark' ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
          </IconButton>

          {currentUser && (
            <IconButton
              label={unreadNotificationsCount ? `Notificações (${unreadNotificationsCount} novas)` : 'Notificações'}
              onClick={() => onNavigate('notifications')}
              className={cx('relative', currentView === 'notifications' && 'text-ink bg-subtle')}
            >
              <Bell className="w-[18px] h-[18px]" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-1 right-1 min-w-4 h-4 px-1 rounded-full bg-accent text-accent-fg text-[10px] font-semibold leading-4 text-center">
                  {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                </span>
              )}
            </IconButton>
          )}

          {currentUser && (
            <span className="hidden lg:block ml-1">
              <Button variant="primary" size="sm" onClick={onOpenCreatePost}>
                <PenSquare className="w-4 h-4" />
                Publicar
              </Button>
            </span>
          )}

          {currentUser ? (
            <Menu
              className="w-64"
              trigger={({ toggle, open }) => (
                <button
                  onClick={() => {
                    setShowAccounts(false);
                    toggle();
                  }}
                  aria-expanded={open}
                  aria-label="Menu da conta"
                  className="ml-1 rounded-full p-0.5 hover:ring-2 hover:ring-line-strong transition-shadow"
                >
                  <UserAvatar user={currentUser} size="sm" />
                </button>
              )}
            >
              {close => (
                <>
                  <div className="px-3 py-2.5 border-b border-line">
                    <p className="text-sm font-semibold text-ink truncate">{currentUser.name}</p>
                    <p className="text-xs text-muted truncate">@{currentUser.username} · {currentUser.campus}</p>
                  </div>

                  {showAccounts ? (
                    <div className="py-1 max-h-72 overflow-y-auto">
                      <p className="px-3 pt-1.5 pb-1 text-xs text-muted">
                        Contas de demonstração (os dados ficam neste navegador)
                      </p>
                      {availableUsers.map(user => (
                        <MenuItem
                          key={user.id}
                          className="h-auto py-2"
                          onClick={() => {
                            switchUser(user.id);
                            close();
                          }}
                        >
                          <UserAvatar user={user} size="xs" />
                          <span className="min-w-0 flex-1 truncate">{user.name}</span>
                          {user.id === currentUser.id && <Check className="w-4 h-4 text-accent" />}
                        </MenuItem>
                      ))}
                    </div>
                  ) : (
                    <div className="py-1">
                      <MenuItem onClick={() => { onNavigate('profile', currentUser.id); close(); }}>
                        <UserIcon className="w-4 h-4" /> Meu perfil
                      </MenuItem>
                      {isMod && (
                        <MenuItem onClick={() => { onNavigate('admin'); close(); }}>
                          <Shield className="w-4 h-4" /> Moderação
                        </MenuItem>
                      )}
                      <MenuItem onClick={() => { onNavigate('settings'); close(); }}>
                        <Settings className="w-4 h-4" /> Configurações
                      </MenuItem>
                      <MenuItem onClick={() => setShowAccounts(true)}>
                        <Repeat className="w-4 h-4" /> Trocar de conta
                      </MenuItem>
                      <div className="my-1 border-t border-line" />
                      <MenuItem danger onClick={() => { logout(); close(); onNavigate('feed'); }}>
                        <LogOut className="w-4 h-4" /> Sair
                      </MenuItem>
                    </div>
                  )}
                </>
              )}
            </Menu>
          ) : (
            <Button variant="primary" size="sm" className="ml-1" onClick={() => onNavigate('auth')}>
              Entrar
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

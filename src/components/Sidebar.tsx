import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, routeHref } from '../lib/router';
import { cx } from './ui';
import {
  Home, Compass, CalendarDays, MessageCircle, Bell, Bookmark,
  User as UserIcon, Shield, Settings, LucideIcon
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
  param?: string;
  requiresAuth?: boolean;
}

function useNavItems(): NavItem[] {
  const { currentUser, unreadNotificationsCount, unreadMessagesTotal } = useAuth();
  const isMod = currentUser?.role === 'admin' || currentUser?.role === 'moderator';

  const items: NavItem[] = [
    { id: 'feed', label: 'Início', icon: Home },
    { id: 'explore', label: 'Explorar', icon: Compass },
    { id: 'events', label: 'Eventos', icon: CalendarDays },
    { id: 'chat', label: 'Mensagens', icon: MessageCircle, badge: unreadMessagesTotal, requiresAuth: true },
    { id: 'notifications', label: 'Notificações', icon: Bell, badge: unreadNotificationsCount, requiresAuth: true },
    { id: 'saved', label: 'Salvos', icon: Bookmark, requiresAuth: true },
    { id: 'profile', label: 'Perfil', icon: UserIcon, param: currentUser?.id, requiresAuth: true }
  ];
  if (isMod) items.push({ id: 'admin', label: 'Moderação', icon: Shield });
  items.push({ id: 'settings', label: 'Configurações', icon: Settings });

  return items.filter(i => !i.requiresAuth || currentUser);
}

interface SidebarProps {
  currentView: string;
  currentParam?: string;
  onNavigate: Navigate;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, currentParam, onNavigate }) => {
  const { currentUser } = useAuth();
  const items = useNavItems();

  return (
    <aside className="hidden lg:block w-56 shrink-0">
      <nav className="sticky top-[calc(var(--header-h)+1.5rem)] space-y-0.5" aria-label="Navegação principal">
        {items.map(item => {
          const active =
            currentView === item.id &&
            (item.id !== 'profile' || !currentParam || currentParam === currentUser?.id);
          const Icon = item.icon;
          return (
            <a
              key={item.id}
              href={routeHref(item.id, item.param)}
              onClick={e => {
                e.preventDefault();
                onNavigate(item.id, item.param);
              }}
              aria-current={active ? 'page' : undefined}
              className={cx(
                'flex items-center gap-3 h-10 px-3 rounded-md text-[15px] transition-colors',
                active ? 'bg-surface text-ink font-semibold border border-line' : 'text-ink-2 hover:bg-subtle hover:text-ink border border-transparent'
              )}
            >
              <Icon className={cx('w-[18px] h-[18px]', active ? 'text-accent' : 'text-muted')} strokeWidth={active ? 2.2 : 1.8} />
              <span className="flex-1">{item.label}</span>
              {!!item.badge && (
                <span className="font-mono text-xs text-accent-ink bg-accent-soft rounded px-1.5 py-0.5">
                  {item.badge}
                </span>
              )}
            </a>
          );
        })}

      </nav>
    </aside>
  );
};

/** Barra inferior do celular/tablet. */
export const MobileTabBar: React.FC<{
  currentView: string;
  currentParam?: string;
  onNavigate: Navigate;
}> = ({ currentView, currentParam, onNavigate }) => {
  const { currentUser, unreadMessagesTotal } = useAuth();

  const tabs: NavItem[] = [
    { id: 'feed', label: 'Início', icon: Home },
    { id: 'explore', label: 'Explorar', icon: Compass },
    { id: 'events', label: 'Eventos', icon: CalendarDays },
    { id: 'chat', label: 'Mensagens', icon: MessageCircle, badge: unreadMessagesTotal },
    { id: 'profile', label: 'Perfil', icon: UserIcon, param: currentUser?.id }
  ];

  return (
    <nav
      aria-label="Navegação principal"
      className="lg:hidden fixed bottom-0 inset-x-0 z-30 h-[var(--tabbar-h)] pb-[env(safe-area-inset-bottom)] bg-surface/95 backdrop-blur-md border-t border-line"
    >
      <div className="h-full max-w-lg mx-auto grid grid-cols-5">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const needsAuth = (tab.id === 'chat' || tab.id === 'profile') && !currentUser;
          const active =
            currentView === tab.id &&
            (tab.id !== 'profile' || !currentParam || currentParam === currentUser?.id);
          return (
            <button
              key={tab.id}
              onClick={() => (needsAuth ? onNavigate('auth') : onNavigate(tab.id, tab.param))}
              aria-current={active ? 'page' : undefined}
              className={cx(
                'relative flex flex-col items-center justify-center gap-1 text-[11px] transition-colors',
                active ? 'text-ink font-semibold' : 'text-muted'
              )}
            >
              {active && <span className="absolute top-0 inset-x-5 h-0.5 bg-accent rounded-b" />}
              <span className="relative">
                <Icon className={cx('w-[22px] h-[22px]', active && 'text-accent')} strokeWidth={active ? 2.2 : 1.8} />
                {!!tab.badge && (
                  <span className="absolute -top-1 -right-2 min-w-4 h-4 px-1 rounded-full bg-accent text-accent-fg text-[10px] font-semibold leading-4 text-center">
                    {tab.badge > 9 ? '9+' : tab.badge}
                  </span>
                )}
              </span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

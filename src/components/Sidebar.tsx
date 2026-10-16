import React from 'react';
import { AnimatePresence } from 'motion/react';
import * as m from 'motion/react-m';
import { useAuth } from '../context/AuthContext';
import { Navigate, routeHref } from '../lib/router';
import { spring } from '../lib/motion';
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
                'group relative flex items-center gap-3 h-11 px-3 rounded-xl text-[15px] transition-colors',
                active ? 'text-ink font-semibold' : 'text-ink-2 hover:text-ink'
              )}
            >
              {active ? (
                <m.span
                  layoutId="sidebar-active"
                  transition={spring.snappy}
                  className="absolute inset-0 rounded-xl bg-surface border border-line shadow-[0_1px_2px_rgb(0_0_0/0.04),0_6px_16px_-8px_rgb(0_0_0/0.12)]"
                />
              ) : (
                <span className="absolute inset-0 rounded-xl bg-subtle opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
              <Icon
                className={cx(
                  'relative w-[19px] h-[19px] transition-transform duration-200 group-hover:scale-110',
                  active ? 'text-accent' : 'text-muted'
                )}
                strokeWidth={active ? 2.3 : 1.8}
              />
              <span className="relative flex-1">{item.label}</span>
              <AnimatePresence>
                {!!item.badge && (
                  <m.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={spring.bouncy}
                    className="relative font-mono text-[11px] font-medium text-accent-fg bg-accent rounded-full min-w-5 h-5 px-1.5 leading-5 text-center"
                  >
                    {item.badge}
                  </m.span>
                )}
              </AnimatePresence>
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
      className="lg:hidden fixed bottom-0 inset-x-0 z-30 h-[var(--tabbar-h)] pb-[env(safe-area-inset-bottom)] bg-surface/85 backdrop-blur-xl backdrop-saturate-150 border-t border-line"
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
                'relative flex flex-col items-center justify-center gap-0.5 text-[11px] active:!scale-100',
                active ? 'text-ink font-semibold' : 'text-muted'
              )}
            >
              <span className="relative flex items-center justify-center w-14 h-8">
                {active && (
                  <m.span
                    layoutId="tabbar-active"
                    transition={spring.snappy}
                    className="absolute inset-0 rounded-full bg-accent-soft"
                  />
                )}
                <m.span
                  className="relative"
                  whileTap={{ scale: 0.8 }}
                  animate={active ? { y: [0, -2.5, 0] } : { y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Icon className={cx('w-[22px] h-[22px]', active && 'text-accent-ink')} strokeWidth={active ? 2.2 : 1.8} />
                  {!!tab.badge && (
                    <span className="absolute -top-1 -right-2 min-w-4 h-4 px-1 rounded-full bg-accent text-accent-fg text-[10px] font-semibold leading-4 text-center ring-2 ring-surface">
                      {tab.badge > 9 ? '9+' : tab.badge}
                    </span>
                  )}
                </m.span>
              </span>
              <span className="relative">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

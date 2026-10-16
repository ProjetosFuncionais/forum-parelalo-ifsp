import { useCallback, useEffect, useState } from 'react';

export type ViewName =
  | 'feed'
  | 'explore'
  | 'events'
  | 'chat'
  | 'notifications'
  | 'saved'
  | 'profile'
  | 'post'
  | 'admin'
  | 'settings'
  | 'auth';

export type Navigate = (view: string, param?: string) => void;

const VIEWS: ViewName[] = [
  'feed', 'explore', 'events', 'chat', 'notifications', 'saved',
  'profile', 'post', 'admin', 'settings', 'auth'
];

export interface Route {
  view: ViewName;
  param?: string;
}

function parseHash(hash: string): Route {
  const [rawView, ...rest] = hash.replace(/^#\/?/, '').split('/');
  const view = (VIEWS as string[]).includes(rawView) ? (rawView as ViewName) : 'feed';
  const param = rest.length ? decodeURIComponent(rest.join('/')) : undefined;
  return { view, param: param || undefined };
}

export function routeHref(view: string, param?: string): string {
  return param ? `#/${view}/${encodeURIComponent(param)}` : `#/${view}`;
}

export function absoluteUrl(view: string, param?: string): string {
  return `${window.location.origin}${window.location.pathname}${routeHref(view, param)}`;
}

/** Roteamento por hash: permite usar o botão "voltar" e abrir links compartilhados. */
export function useHashRoute() {
  const [route, setRoute] = useState<Route>(() => parseHash(window.location.hash));

  useEffect(() => {
    const onChange = () => {
      setRoute(parseHash(window.location.hash));
      window.scrollTo({ top: 0 });
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  const navigate = useCallback<Navigate>((view, param) => {
    const next = routeHref(view, param);
    if (window.location.hash === next) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.location.hash = next;
    }
  }, []);

  /** Troca a rota sem criar entrada no histórico (ex.: depois do login). */
  const replace = useCallback<Navigate>((view, param) => {
    window.history.replaceState(null, '', routeHref(view, param));
    setRoute({ view: view as ViewName, param });
  }, []);

  return { route, navigate, replace };
}

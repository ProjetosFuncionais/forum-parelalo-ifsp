import React, { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, useDragControls, type PanInfo } from 'motion/react';
import * as m from 'motion/react-m';
import { X } from 'lucide-react';
import { ease, spring } from '../lib/motion';

export function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setMatches(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [query]);
  return matches;
}

/* ---------- Botões ---------- */

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'danger-ghost';
type ButtonSize = 'sm' | 'md';

const buttonVariants: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-accent-fg hover:bg-accent-hover shadow-[inset_0_1px_0_rgb(255_255_255/0.12),0_1px_2px_rgb(0_0_0/0.12)]',
  secondary: 'bg-surface text-ink border border-line-strong hover:bg-subtle hover:border-ink/25',
  ghost: 'text-ink-2 hover:bg-subtle hover:text-ink',
  danger: 'bg-danger text-white hover:opacity-90 dark:text-bg',
  'danger-ghost': 'text-danger hover:bg-danger-soft'
};

const buttonSizes: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-[13px] gap-1.5',
  md: 'h-10 px-4 text-sm gap-2'
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'secondary', size = 'md', className, type = 'button', ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cx(
        'inline-flex items-center justify-center rounded-lg font-medium whitespace-nowrap disabled:opacity-50 disabled:pointer-events-none',
        buttonVariants[variant],
        buttonSizes[size],
        className
      )}
      {...props}
    />
  )
);
Button.displayName = 'Button';

export const IconButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { label: string }> = ({
  label,
  className,
  type = 'button',
  ...props
}) => (
  <button
    type={type}
    aria-label={label}
    title={label}
    className={cx(
      'inline-flex items-center justify-center w-9 h-9 rounded-lg text-muted hover:text-ink hover:bg-subtle',
      className
    )}
    {...props}
  />
);

/* ---------- Número animado ---------- */

/** Contador cujos dígitos rolam para cima/baixo quando o valor muda. */
export const AnimatedNumber: React.FC<{ value: number; className?: string }> = ({ value, className }) => {
  const prev = useRef(value);
  const direction = value >= prev.current ? 1 : -1;
  useEffect(() => {
    prev.current = value;
  }, [value]);

  return (
    <span className={cx('relative inline-flex overflow-hidden tabular-nums', className)}>
      <AnimatePresence mode="popLayout" initial={false}>
        <m.span
          key={value}
          initial={{ y: `${direction * 100}%`, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: `${direction * -100}%`, opacity: 0 }}
          transition={spring.snappy}
          className="inline-block"
        >
          {value}
        </m.span>
      </AnimatePresence>
    </span>
  );
};

/* ---------- Formulários ---------- */

export const inputClass =
  'w-full h-10 px-3 rounded-lg border border-line-strong bg-surface text-ink text-sm placeholder:text-muted focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent/15 transition-[border,box-shadow]';

export const textareaClass = cx(inputClass, 'h-auto py-2.5 leading-relaxed resize-none');

export const Field: React.FC<{
  label: string;
  hint?: string;
  children: (id: string) => React.ReactNode;
  className?: string;
}> = ({ label, hint, children, className }) => {
  const id = useId();
  return (
    <div className={cx('space-y-1.5', className)}>
      <label htmlFor={id} className="block text-[13px] font-medium text-ink-2">
        {label}
      </label>
      {children(id)}
      {hint && <p className="text-xs text-muted">{hint}</p>}
    </div>
  );
};

/* ---------- Superfícies ---------- */

/** Painel que encosta nas bordas no celular e vira cartão a partir de sm. */
export const Panel: React.FC<React.HTMLAttributes<HTMLElement> & { as?: 'div' | 'section' | 'article' }> = ({
  as: Tag = 'section',
  className,
  ...props
}) => (
  <Tag
    className={cx(
      'bg-surface border-y sm:border border-line sm:rounded-2xl sm:shadow-[0_1px_2px_rgb(0_0_0/0.03),0_8px_24px_-12px_rgb(0_0_0/0.08)]',
      className
    )}
    {...props}
  />
);

export const PageHeader: React.FC<{
  title: string;
  description?: string;
  actions?: React.ReactNode;
}> = ({ title, description, actions }) => (
  <header className="flex items-end justify-between gap-4 px-4 sm:px-0 pt-1 pb-5">
    <div className="min-w-0">
      <h1 className="text-[1.75rem] sm:text-[2rem] font-bold leading-none">{title}</h1>
      {description && <p className="text-sm text-muted mt-2">{description}</p>}
    </div>
    {actions && <div className="shrink-0 flex items-center gap-2">{actions}</div>}
  </header>
);

export const EmptyState: React.FC<{
  title: string;
  text?: string;
  action?: React.ReactNode;
  className?: string;
}> = ({ title, text, action, className }) => (
  <m.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35, ease: ease.out }}
    className={cx('px-6 py-14 text-center', className)}
  >
    <p className="font-display text-lg font-semibold text-ink">{title}</p>
    {text && <p className="text-sm text-muted mt-1.5 max-w-sm mx-auto leading-relaxed">{text}</p>}
    {action && <div className="mt-5">{action}</div>}
  </m.div>
);

/* ---------- Abas (indicador deslizante) ---------- */

export interface TabItem<T extends string> {
  id: T;
  label: string;
  count?: number;
}

export function Tabs<T extends string>({
  items,
  value,
  onChange,
  className
}: {
  items: TabItem<T>[];
  value: T;
  onChange: (id: T) => void;
  className?: string;
}) {
  const layoutId = useId();
  return (
    <div
      role="tablist"
      className={cx('flex items-center gap-1 overflow-x-auto scrollbar-none border-b border-line px-2 sm:px-3', className)}
    >
      {items.map(item => {
        const active = item.id === value;
        return (
          <button
            key={item.id}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(item.id)}
            className={cx(
              'relative shrink-0 h-12 px-3 text-sm active:!scale-100',
              active ? 'text-ink font-semibold' : 'text-muted hover:text-ink'
            )}
          >
            <span className="relative z-10">
              {item.label}
              {item.count !== undefined && (
                <span className={cx('ml-1.5 font-mono text-xs', active ? 'text-accent-ink' : 'text-muted')}>
                  {item.count}
                </span>
              )}
            </span>
            {active && (
              <m.span
                layoutId={`tab-${layoutId}`}
                transition={spring.snappy}
                className="absolute left-2 right-2 -bottom-px h-[2.5px] rounded-full bg-accent"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

/* ---------- Modal (gaveta arrastável no celular) ---------- */

export const Modal: React.FC<{
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}> = ({ open, onClose, title, children, footer, size = 'md' }) => {
  const titleId = useId();
  const isMobile = useMediaQuery('(max-width: 639px)');
  const dragControls = useDragControls();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y > 110 || info.velocity.y > 600) onClose();
  };

  const width = { sm: 'sm:max-w-sm', md: 'sm:max-w-lg', lg: 'sm:max-w-2xl' }[size];

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-6">
          <m.div
            className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
            onClick={onClose}
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
          <m.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            initial={isMobile ? { y: '100%' } : { opacity: 0, y: 16, scale: 0.97 }}
            animate={isMobile ? { y: 0 } : { opacity: 1, y: 0, scale: 1 }}
            exit={isMobile ? { y: '100%' } : { opacity: 0, y: 8, scale: 0.98 }}
            transition={isMobile ? { type: 'spring', stiffness: 380, damping: 38 } : spring.snappy}
            drag={isMobile ? 'y' : false}
            dragControls={dragControls}
            dragListener={false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.7 }}
            onDragEnd={onDragEnd}
            className={cx(
              'relative w-full bg-surface border-t sm:border border-line rounded-t-3xl sm:rounded-2xl shadow-2xl',
              'max-h-[92dvh] flex flex-col',
              width
            )}
          >
            {/* Alça: arraste para baixo para fechar no celular */}
            <div
              className="sm:hidden flex justify-center pt-2.5 pb-1 touch-none cursor-grab"
              onPointerDown={e => dragControls.start(e)}
            >
              <span className="w-10 h-1.5 rounded-full bg-line-strong" />
            </div>
            <div
              className="flex items-center justify-between gap-3 pl-5 pr-2 h-12 sm:h-14 sm:border-b border-line shrink-0 touch-none sm:touch-auto"
              onPointerDown={e => isMobile && dragControls.start(e)}
            >
              <h2 id={titleId} className="text-lg font-bold truncate">
                {title}
              </h2>
              <IconButton label="Fechar" onClick={onClose}>
                <X className="w-5 h-5" />
              </IconButton>
            </div>
            <div className="overflow-y-auto px-5 py-4 flex-1 overscroll-contain">{children}</div>
            {footer && (
              <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-line shrink-0 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:pb-3">
                {footer}
              </div>
            )}
          </m.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

/* ---------- Menu suspenso ---------- */

function useClickOutside<T extends HTMLElement>(open: boolean, onClose: () => void) {
  const ref = useRef<T>(null);
  useEffect(() => {
    if (!open) return;
    const handle = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('pointerdown', handle);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', handle);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);
  return ref;
}

export const Menu: React.FC<{
  trigger: (props: { open: boolean; toggle: () => void }) => React.ReactNode;
  children: (close: () => void) => React.ReactNode;
  align?: 'left' | 'right';
  className?: string;
}> = ({ trigger, children, align = 'right', className }) => {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const ref = useClickOutside<HTMLDivElement>(open, close);

  return (
    <div ref={ref} className="relative">
      {trigger({ open, toggle: () => setOpen(o => !o) })}
      <AnimatePresence>
        {open && (
          <m.div
            role="menu"
            initial={{ opacity: 0, scale: 0.94, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -2, transition: { duration: 0.1 } }}
            transition={spring.snappy}
            style={{ transformOrigin: align === 'right' ? 'top right' : 'top left' }}
            className={cx(
              'absolute z-40 mt-1.5 min-w-52 p-1 bg-surface border border-line rounded-xl shadow-[0_12px_32px_-8px_rgb(0_0_0/0.18)]',
              align === 'right' ? 'right-0' : 'left-0',
              className
            )}
          >
            {children(close)}
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const MenuItem: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { danger?: boolean }> = ({
  danger,
  className,
  ...props
}) => (
  <button
    role="menuitem"
    type="button"
    className={cx(
      'w-full flex items-center gap-2.5 px-2.5 h-9 rounded-lg text-sm text-left active:!scale-100',
      danger ? 'text-danger hover:bg-danger-soft' : 'text-ink-2 hover:bg-subtle hover:text-ink',
      className
    )}
    {...props}
  />
);

/* ---------- Toast ---------- */

const TOAST_EVENT = 'forum_ifsp_toast';

export function toast(message: string) {
  window.dispatchEvent(new CustomEvent(TOAST_EVENT, { detail: message }));
}

export const Toaster: React.FC = () => {
  const [toastState, setToastState] = useState<{ id: number; message: string } | null>(null);

  useEffect(() => {
    let timer: number | undefined;
    const handle = (e: Event) => {
      setToastState({ id: Date.now(), message: (e as CustomEvent<string>).detail });
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setToastState(null), 2400);
    };
    window.addEventListener(TOAST_EVENT, handle);
    return () => {
      window.removeEventListener(TOAST_EVENT, handle);
      window.clearTimeout(timer);
    };
  }, []);

  return (
    <div className="fixed z-[60] inset-x-0 bottom-[calc(var(--tabbar-h)+1rem)] lg:bottom-6 flex justify-center pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toastState && (
          <m.div
            key={toastState.id}
            role="status"
            initial={{ opacity: 0, y: 24, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95, transition: { duration: 0.15 } }}
            transition={spring.bouncy}
            className="px-4 py-2.5 rounded-full bg-ink text-bg text-sm font-medium shadow-xl"
          >
            {toastState.message}
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
};

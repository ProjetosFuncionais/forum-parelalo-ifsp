import React, { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

/* ---------- Botões ---------- */

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'danger-ghost';
type ButtonSize = 'sm' | 'md';

const buttonVariants: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-accent-fg hover:bg-accent-hover',
  secondary: 'bg-surface text-ink border border-line-strong hover:bg-subtle',
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
        'inline-flex items-center justify-center rounded-md font-medium whitespace-nowrap transition-colors disabled:opacity-50 disabled:pointer-events-none',
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
      'inline-flex items-center justify-center w-9 h-9 rounded-md text-muted hover:text-ink hover:bg-subtle transition-colors',
      className
    )}
    {...props}
  />
);

/* ---------- Formulários ---------- */

export const inputClass =
  'w-full h-10 px-3 rounded-md border border-line-strong bg-surface text-ink text-sm placeholder:text-muted focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-[border,box-shadow]';

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
    className={cx('bg-surface border-y sm:border border-line sm:rounded-lg', className)}
    {...props}
  />
);

export const PageHeader: React.FC<{
  title: string;
  description?: string;
  actions?: React.ReactNode;
}> = ({ title, description, actions }) => (
  <header className="flex items-end justify-between gap-4 px-4 sm:px-0 pt-1 pb-4">
    <div className="min-w-0">
      <h1 className="text-xl sm:text-2xl font-semibold">{title}</h1>
      {description && <p className="text-sm text-muted mt-1">{description}</p>}
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
  <div className={cx('px-6 py-12 text-center', className)}>
    <p className="font-medium text-ink">{title}</p>
    {text && <p className="text-sm text-muted mt-1.5 max-w-sm mx-auto leading-relaxed">{text}</p>}
    {action && <div className="mt-5">{action}</div>}
  </div>
);

/* ---------- Abas ---------- */

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
              'relative shrink-0 h-11 px-3 text-sm transition-colors',
              active ? 'text-ink font-semibold' : 'text-muted hover:text-ink'
            )}
          >
            {item.label}
            {item.count !== undefined && (
              <span className="ml-1.5 font-mono text-xs text-muted">{item.count}</span>
            )}
            {active && <span className="absolute left-3 right-3 -bottom-px h-0.5 bg-accent" />}
          </button>
        );
      })}
    </div>
  );
}

/* ---------- Modal (bottom sheet no celular) ---------- */

export const Modal: React.FC<{
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}> = ({ open, onClose, title, children, footer, size = 'md' }) => {
  const titleId = useId();

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

  if (!open) return null;

  const width = { sm: 'sm:max-w-sm', md: 'sm:max-w-lg', lg: 'sm:max-w-2xl' }[size];

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-6">
      <div className="absolute inset-0 bg-black/45 animate-fade" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cx(
          'relative w-full bg-surface border-t sm:border border-line rounded-t-xl sm:rounded-lg shadow-xl animate-sheet',
          'max-h-[92dvh] flex flex-col',
          width
        )}
      >
        <div className="flex items-center justify-between gap-3 pl-5 pr-2 h-14 border-b border-line shrink-0">
          <h2 id={titleId} className="text-base font-semibold truncate">
            {title}
          </h2>
          <IconButton label="Fechar" onClick={onClose}>
            <X className="w-5 h-5" />
          </IconButton>
        </div>
        <div className="overflow-y-auto px-5 py-4 flex-1">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-line shrink-0 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:pb-3">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

/* ---------- Menu suspenso ---------- */

export function useClickOutside<T extends HTMLElement>(open: boolean, onClose: () => void) {
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
      {open && (
        <div
          role="menu"
          className={cx(
            'absolute z-40 mt-1 min-w-48 py-1 bg-surface border border-line rounded-md shadow-lg animate-fade',
            align === 'right' ? 'right-0' : 'left-0',
            className
          )}
        >
          {children(close)}
        </div>
      )}
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
      'w-full flex items-center gap-2.5 px-3 h-9 text-sm text-left transition-colors',
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
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let timer: number | undefined;
    const handle = (e: Event) => {
      setMessage((e as CustomEvent<string>).detail);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setMessage(null), 2400);
    };
    window.addEventListener(TOAST_EVENT, handle);
    return () => {
      window.removeEventListener(TOAST_EVENT, handle);
      window.clearTimeout(timer);
    };
  }, []);

  if (!message) return null;

  return (
    <div
      role="status"
      className="fixed z-[60] left-1/2 -translate-x-1/2 bottom-[calc(var(--tabbar-h)+1rem)] lg:bottom-6 px-4 py-2.5 rounded-md bg-ink text-bg text-sm shadow-lg animate-sheet"
    >
      {message}
    </div>
  );
};

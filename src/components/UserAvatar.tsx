import React, { useState } from 'react';
import { User } from '../types';
import { cx } from './ui';

interface UserAvatarProps {
  user?: Partial<User> | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-lg',
  xl: 'w-20 h-20 sm:w-24 sm:h-24 text-2xl'
};

// Tons discretos para avatares de iniciais, escolhidos pelo nome.
const TINTS = [
  'bg-[#dfe9e1] text-[#24543a] dark:bg-[#1f3328] dark:text-[#9bd3b0]',
  'bg-[#e6e2f1] text-[#433873] dark:bg-[#2a2640] dark:text-[#bdb2ec]',
  'bg-[#f1e4d6] text-[#7a4516] dark:bg-[#3a2a1b] dark:text-[#e9b98a]',
  'bg-[#dde7ef] text-[#28506e] dark:bg-[#1d2c38] dark:text-[#9cc3e2]',
  'bg-[#f0dfe0] text-[#7a2f36] dark:bg-[#3a2023] dark:text-[#eba7ad]'
];

function tintFor(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  return TINTS[Math.abs(hash) % TINTS.length];
}

export const UserAvatar: React.FC<UserAvatarProps> = ({ user, size = 'md', className }) => {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);

  const name = user?.name || 'Comunidade IFSP';
  const initials = name
    .replace(/^(Prof(a)?\.|Dr(a)?\.)\s+/i, '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0].toUpperCase())
    .join('');

  // Os avatares de desenho gerados (DiceBear) davam cara de "demo"; usamos iniciais no lugar.
  const avatarUrl = user?.avatarUrl && !user.avatarUrl.includes('dicebear.com') ? user.avatarUrl : undefined;
  const showImage = !!avatarUrl && failedUrl !== avatarUrl;

  return (
    <span
      className={cx(
        'relative inline-flex shrink-0 items-center justify-center rounded-full overflow-hidden font-display font-bold tracking-[-0.02em] select-none ring-1 ring-inset ring-black/5 dark:ring-white/5',
        sizeClasses[size],
        !showImage && tintFor(user?.id || name),
        showImage && 'bg-subtle',
        className
      )}
    >
      {showImage ? (
        <img
          src={avatarUrl}
          alt=""
          referrerPolicy="no-referrer"
          loading="lazy"
          onError={() => setFailedUrl(avatarUrl!)}
          className="w-full h-full object-cover"
        />
      ) : (
        <span aria-hidden="true">{initials || 'IF'}</span>
      )}
    </span>
  );
};

const ROLE_TAGS: Record<string, string> = {
  teacher: 'Docente',
  moderator: 'Mod',
  admin: 'Admin'
};

/** Marcação discreta de papel (docente, moderação), exibida ao lado do nome. */
export const RoleTag: React.FC<{ role?: string; className?: string }> = ({ role, className }) => {
  if (!role || !ROLE_TAGS[role]) return null;
  return (
    <span
      className={cx(
        'inline-flex items-center h-[18px] px-2 rounded-full bg-accent-soft text-[10.5px] font-semibold uppercase tracking-wide text-accent-ink',
        className
      )}
    >
      {ROLE_TAGS[role]}
    </span>
  );
};

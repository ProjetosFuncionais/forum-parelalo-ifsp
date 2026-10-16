import type { Transition, Variants } from 'motion/react';

/** Molas usadas no app inteiro, para todo movimento ter o mesmo "peso". */
export const spring = {
  snappy: { type: 'spring', stiffness: 520, damping: 38, mass: 0.8 } as Transition,
  soft: { type: 'spring', stiffness: 260, damping: 30 } as Transition,
  bouncy: { type: 'spring', stiffness: 600, damping: 15 } as Transition
};

export const ease = {
  out: [0.22, 1, 0.36, 1] as const,
  inOut: [0.65, 0, 0.35, 1] as const
};

/** Itens de lista que surgem ao entrar na tela. */
export const revealItem: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.42, ease: ease.out } }
};

export const listStagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.045, delayChildren: 0.04 } }
};

/** Altura automática para abrir/fechar blocos (comentários, campos extras). */
export const collapse = {
  initial: { height: 0, opacity: 0 },
  animate: { height: 'auto', opacity: 1, transition: { height: { duration: 0.28, ease: ease.out }, opacity: { duration: 0.2, delay: 0.05 } } },
  exit: { height: 0, opacity: 0, transition: { height: { duration: 0.22, ease: ease.inOut }, opacity: { duration: 0.12 } } }
};

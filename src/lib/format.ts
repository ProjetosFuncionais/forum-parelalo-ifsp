import { AcademicEvent, EventStatus } from '../types';

const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const WEEKDAYS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];

/** "há 5 min", "há 3 h", "ontem", "12 out", "12 out 2025" */
export function timeAgo(iso: string, now = new Date()): string {
  const date = new Date(iso);
  const diffMs = now.getTime() - date.getTime();
  const minutes = Math.floor(diffMs / 60_000);

  if (minutes < 1) return 'agora';
  if (minutes < 60) return `há ${minutes} min`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `há ${hours} h`;

  const days = Math.floor(hours / 24);
  if (days === 1) return 'ontem';
  if (days < 7) return `há ${days} dias`;

  const base = `${date.getDate()} ${MONTHS[date.getMonth()]}`;
  return date.getFullYear() === now.getFullYear() ? base : `${base} ${date.getFullYear()}`;
}

export function clockTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export function fullDateTime(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Datas de evento são guardadas como "AAAA-MM-DD". `new Date("2026-10-24")`
 * interpreta como UTC e, no fuso de Brasília, vira o dia anterior.
 */
export function parseLocalDate(ymd: string): Date {
  const [y, m, d] = ymd.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

export function todayYmd(now = new Date()): string {
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${m}-${d}`;
}

export function eventDateParts(ymd: string) {
  const date = parseLocalDate(ymd);
  return {
    day: String(date.getDate()).padStart(2, '0'),
    month: MONTHS[date.getMonth()],
    weekday: WEEKDAYS[date.getDay()],
    year: date.getFullYear()
  };
}

export function formatEventDate(ymd: string): string {
  const { day, month, weekday } = eventDateParts(ymd);
  return `${weekday}, ${Number(day)} ${month}`;
}

/** O status salvo nunca era atualizado; aqui ele é derivado da data. */
export function eventStatus(event: AcademicEvent, now = new Date()): EventStatus {
  const today = todayYmd(now);
  if (event.date > today) return 'upcoming';
  if (event.date === today) return 'ongoing';
  return 'concluded';
}

export function plural(n: number, one: string, many: string): string {
  return `${n} ${n === 1 ? one : many}`;
}

export function compactNumber(n: number): string {
  if (n < 1000) return String(n);
  return `${(n / 1000).toFixed(n < 10_000 ? 1 : 0).replace('.', ',')} mil`;
}

export const ROLE_LABELS: Record<string, string> = {
  student: 'Estudante',
  teacher: 'Docente',
  moderator: 'Moderação',
  admin: 'Admin'
};

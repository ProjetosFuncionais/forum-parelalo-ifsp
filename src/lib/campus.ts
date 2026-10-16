/** Cor de identificação de cada campus (ponto ao lado do nome). */
const CAMPUS_COLORS: Record<string, string> = {
  'IFSP Pirituba': '#1f8a57',
  'IFSP São Paulo (Canindé)': '#c2410c',
  'IFSP Campinas': '#2563eb',
  'IFSP Guarulhos': '#9333ea',
  'IFSP São Carlos': '#0891b2',
  'IFSP Salto': '#ca8a04',
  'IFSP Sertãozinho': '#be185d',
  'IFSP Suzano': '#4d7c0f',
  'IFSP Bragança Paulista': '#7c3aed'
};

export function campusColor(campus: string): string {
  return CAMPUS_COLORS[campus] ?? '#8a867d';
}

export function campusShort(campus: string): string {
  if (campus === 'Todos os Campi (Geral)') return 'Todos os campi';
  return campus.replace(/^IFSP\s+/, '');
}

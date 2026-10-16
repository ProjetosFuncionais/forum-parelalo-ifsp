export interface CampusInfo {
  id: string;
  name: string;
  city: string;
  courses: string[];
}

export const IFSP_CAMPUSES: CampusInfo[] = [
  {
    id: 'sao-paulo-pirituba',
    name: 'IFSP Pirituba',
    city: 'São Paulo',
    courses: [
      'Análise e Desenvolvimento de Sistemas',
      'Engenharia de Produção',
      'Tecnologia em Redes de Computadores',
      'Técnico em Informática Integrado',
      'Técnico em Redes de Computadores'
    ]
  },
  {
    id: 'sao-paulo-central',
    name: 'IFSP São Paulo (Canindé)',
    city: 'São Paulo',
    courses: [
      'Engenharia de Controle e Automação',
      'Engenharia Civil',
      'Sistemas para Internet',
      'Licenciatura em Matemática',
      'Licenciatura em Física',
      'Técnico em Eletrônica',
      'Técnico em Mecânica'
    ]
  },
  {
    id: 'campinas',
    name: 'IFSP Campinas',
    city: 'Campinas',
    courses: [
      'Engenharia de Computação',
      'Tecnologia em Análise e Desenvolvimento de Sistemas',
      'Licenciatura em Química',
      'Técnico em Eletrônica Integrado',
      'Técnico em Informática'
    ]
  },
  {
    id: 'guarulhos',
    name: 'IFSP Guarulhos',
    city: 'Guarulhos',
    courses: [
      'Análise e Desenvolvimento de Sistemas',
      'Engenharia de Controle e Automação',
      'Licenciatura em Matemática',
      'Técnico em Mecatrônica Integrado',
      'Técnico em Informática para Internet'
    ]
  },
  {
    id: 'sao-carlos',
    name: 'IFSP São Carlos',
    city: 'São Carlos',
    courses: [
      'Tecnologia em Análise e Desenvolvimento de Sistemas',
      'Tecnologia em Processos Gerenciais',
      'Engenharia Aeronáutica',
      'Técnico em Manutenção Aeronáutica'
    ]
  },
  {
    id: 'salto',
    name: 'IFSP Salto',
    city: 'Salto',
    courses: [
      'Ciência da Computação',
      'Engenharia de Bioprocessos e Biotecnologia',
      'Técnico em Informática Integrado',
      'Técnico em Automação Industrial'
    ]
  },
  {
    id: 'sertaozinho',
    name: 'IFSP Sertãozinho',
    city: 'Sertãozinho',
    courses: [
      'Engenharia Mecânica',
      'Engenharia Elétrica',
      'Tecnologia em Automação Industrial',
      'Licenciatura em Letras'
    ]
  },
  {
    id: 'suzano',
    name: 'IFSP Suzano',
    city: 'Suzano',
    courses: [
      'Tecnologia em Processos Químicos',
      'Tecnologia em Mecatrônica',
      'Técnico em Química Integrado',
      'Técnico em Administração'
    ]
  },
  {
    id: 'braganca-paulista',
    name: 'IFSP Bragança Paulista',
    city: 'Bragança Paulista',
    courses: [
      'Engenharia de Controle e Automação',
      'Tecnologia em Análise e Desenvolvimento de Sistemas',
      'Licenciatura em Matemática',
      'Técnico em Mecânica Integrado'
    ]
  }
];

export const EVENT_CATEGORIES = [
  { id: 'tecnologia', label: 'Tecnologia & Dev', color: 'emerald' },
  { id: 'palestra', label: 'Palestras & Debates', color: 'blue' },
  { id: 'workshop', label: 'Workshops & Minicurso', color: 'purple' },
  { id: 'hackathon', label: 'Hackathons & Maratona', color: 'amber' },
  { id: 'iniciacao_cientifica', label: 'Iniciação Científica', color: 'indigo' },
  { id: 'cultura', label: 'Cultura & Arte', color: 'rose' },
  { id: 'esporte', label: 'Jogos & Esportes', color: 'orange' },
  { id: 'estagio', label: 'Carreira & Estágio', color: 'teal' }
] as const;

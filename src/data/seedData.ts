import { User, Post, Comment, AcademicEvent, Follow } from '../types';

export const SEED_USERS: User[] = [
  {
    id: 'user_vitor',
    name: 'Vítor Souza',
    username: 'vitor.dev',
    email: 'vitor7pb@gmail.com',
    avatarUrl: '',
    bannerUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&auto=format&fit=crop&q=80',
    bio: 'Estudante de Análise e Desenvolvimento de Sistemas no IFSP Pirituba. Apaixonado por código aberto, TypeScript e robótica.',
    campus: 'IFSP Pirituba',
    course: 'Análise e Desenvolvimento de Sistemas',
    semester: 4,
    role: 'admin',
    interests: ['React', 'TypeScript', 'Sistemas Embarcados', 'Linux', 'Projetos Integradores'],
    followersCount: 42,
    followingCount: 28,
    createdAt: '2026-02-10T10:00:00.000Z'
  },
  {
    id: 'user_mariana',
    name: 'Profa. Mariana Antunes',
    username: 'mariana.antunes',
    email: 'm.antunes@ifsp.edu.br',
    avatarUrl: '',
    bannerUrl: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1200&auto=format&fit=crop&q=80',
    bio: 'Docente da área de Computação no IFSP São Paulo (Canindé). Coordenadora do Grupo de Pesquisa em IA Aplicada e Educação.',
    campus: 'IFSP São Paulo (Canindé)',
    course: 'Sistemas para Internet',
    semester: undefined,
    role: 'teacher',
    interests: ['Inteligência Artificial', 'Metodologias Ativas', 'Python', 'Iniciação Científica'],
    followersCount: 156,
    followingCount: 45,
    createdAt: '2026-01-15T14:30:00.000Z'
  },
  {
    id: 'user_lucas',
    name: 'Lucas Ferreira',
    username: 'lucas.eng',
    email: 'lucas.ferreira@aluno.ifsp.edu.br',
    avatarUrl: '',
    bio: 'Engenharia de Computação no IFSP Campinas. Integrante da equipe de Maratona de Programação e desenvolvedor backend em Go.',
    campus: 'IFSP Campinas',
    course: 'Engenharia de Computação',
    semester: 6,
    role: 'student',
    interests: ['Algoritmos', 'Go', 'Docker', 'Maratona SBC', 'Open Source'],
    followersCount: 89,
    followingCount: 63,
    createdAt: '2026-02-01T09:15:00.000Z'
  },
  {
    id: 'user_beatriz',
    name: 'Beatriz Lima',
    username: 'bialima.code',
    email: 'beatriz.lima@aluno.ifsp.edu.br',
    avatarUrl: '',
    bio: 'Técnico em Informática para Internet no IFSP Guarulhos. Gosto de UI/UX, design e acessibilidade na web.',
    campus: 'IFSP Guarulhos',
    course: 'Técnico em Informática para Internet',
    semester: 3,
    role: 'student',
    interests: ['Figma', 'CSS Moderno', 'Acessibilidade', 'Robótica Educacional'],
    followersCount: 74,
    followingCount: 51,
    createdAt: '2026-02-18T16:20:00.000Z'
  },
  {
    id: 'user_carlos',
    name: 'Carlos Mendes',
    username: 'carlos.mendes',
    email: 'carlos.mendes@ifsp.edu.br',
    avatarUrl: '',
    bio: 'Moderador da comunidade estudantil e graduando em Ciência da Computação no IFSP Salto.',
    campus: 'IFSP Salto',
    course: 'Ciência da Computação',
    semester: 5,
    role: 'moderator',
    interests: ['Segurança da Informação', 'Linux', 'DevOps', 'Redes'],
    followersCount: 62,
    followingCount: 39,
    createdAt: '2026-01-20T11:00:00.000Z'
  }
];

export const SEED_POSTS: Post[] = [
  {
    id: 'post_1',
    authorId: 'user_mariana',
    content: '📢 Edital Aberto para Iniciação Científica (PIBITI / PIBIC 2026)!\n\nEstamos selecionando 2 bolsistas para o projeto "Classificação Automática de Dúvidas em Fóruns Acadêmicos utilizando Modelos Leves de Linguagem".\n\nPré-requisitos: ter cursado Algoritmos e ter interesse em Python e Git. Estudantes de qualquer campus do IFSP podem se inscrever para colaboração remota.\n\nLink do formulário no mural da Coordenadoria de Pesquisa!',
    tags: ['IniciacaoCientifica', 'PIBIC', 'InteligenciaArtificial', 'Python'],
    campus: 'IFSP São Paulo (Canindé)',
    likesCount: 34,
    commentsCount: 6,
    savedCount: 19,
    sharesCount: 8,
    createdAt: '2026-10-15T14:30:00.000Z',
    isPinned: true
  },
  {
    id: 'post_2',
    authorId: 'user_vitor',
    content: 'Galera de ADS do IFSP Pirituba e de outros campi: criamos um repositório comunitário de resumos para Cálculo 1 e Estrutura de Dados!\n\nTudo feito em Markdown com diagramas Mermaid. Se alguém quiser contribuir com exercícios resolvidos ou correções, o PR é super bem-vindo. Compartilhar conhecimento fortalece nossa rede!',
    tags: ['ADS', 'IFSPPirituba', 'Calculo', 'EstruturaDeDados', 'OpenSource'],
    campus: 'IFSP Pirituba',
    likesCount: 48,
    commentsCount: 12,
    savedCount: 27,
    sharesCount: 14,
    createdAt: '2026-10-16T08:15:00.000Z'
  },
  {
    id: 'post_3',
    authorId: 'user_lucas',
    content: 'Ontem tivemos a primeira rodada preparatória da Maratona SBC de Programação no IFSP Campinas! 💻🔥\n\nResolvemos 7 de 10 problemas em equipe. Destaque para o problema de Grafos com Dijkstra modificado. Quem tiver interesse em treinar aos sábados pelo Beecrowd / Codeforces, mandem mensagem no chat que adicionamos no grupo de estudos.',
    tags: ['MaratonaSBC', 'ProgramacaoCompetitiva', 'IFSPCampinas', 'Algoritmos'],
    campus: 'IFSP Campinas',
    likesCount: 29,
    commentsCount: 4,
    savedCount: 9,
    sharesCount: 3,
    createdAt: '2026-10-14T19:00:00.000Z'
  },
  {
    id: 'post_4',
    authorId: 'user_beatriz',
    content: 'Dica rápida de acessibilidade para projetos web que forem apresentar na Semana da Tecnologia (Sematec):\n\n1. Nunca use apenas cor para indicar erro em formulários.\n2. Lembre-se do atributo alt descritivo nas imagens.\n3. Verifique a navegação por teclado (Tab e Shift+Tab).\n\nInterface bonita é interface que todo mundo consegue usar! ✨♿',
    tags: ['Acessibilidade', 'Design', 'Sematec', 'Frontend'],
    campus: 'IFSP Guarulhos',
    likesCount: 52,
    commentsCount: 8,
    savedCount: 31,
    sharesCount: 11,
    createdAt: '2026-10-13T17:45:00.000Z'
  }
];

export const SEED_COMMENTS: Comment[] = [
  {
    id: 'comment_1',
    postId: 'post_1',
    authorId: 'user_vitor',
    content: 'Professora Mariana, excelente iniciativa! Alunos do 4º semestre de ADS que já desenvolveram com PyTorch podem se candidatar?',
    likesCount: 4,
    createdAt: '2026-10-15T15:00:00.000Z'
  },
  {
    id: 'comment_2',
    postId: 'post_1',
    authorId: 'user_mariana',
    content: 'Com certeza, Vítor! Essa experiência prática prévia conta bastante na avaliação do plano de trabalho. Te aguardo no processo!',
    parentId: 'comment_1',
    likesCount: 6,
    createdAt: '2026-10-15T15:20:00.000Z'
  },
  {
    id: 'comment_3',
    postId: 'post_2',
    authorId: 'user_lucas',
    content: 'Muito bom! Vou abrir um Pull Request hoje à noite com os resumos de Árvores AVL e Grafos Bipartidos.',
    likesCount: 3,
    createdAt: '2026-10-16T08:45:00.000Z'
  },
  {
    id: 'comment_4',
    postId: 'post_2',
    authorId: 'user_beatriz',
    content: 'Salvo nos meus favoritos! Isso vai salvar a revisão para as provas da P2.',
    likesCount: 2,
    createdAt: '2026-10-16T09:10:00.000Z'
  }
];

export const SEED_EVENTS: AcademicEvent[] = [
  {
    id: 'event_1',
    organizerId: 'user_vitor',
    title: 'Semana de Ciência e Tecnologia (SNCT & Sematec 2026)',
    description: 'A maior celebração científica e acadêmica do IFSP! Palestras com profissionais da indústria de tecnologia, apresentação de Trabalhos de Conclusão de Curso (TCC), feira de robótica e campeonato de esportes eletrônicos.',
    category: 'tecnologia',
    date: '2026-10-24',
    time: '09:00 - 18:00',
    location: 'Auditório Principal e Laboratórios de Informática',
    isOnline: false,
    campus: 'IFSP Pirituba',
    attendeesCount: 142,
    interestedCount: 88,
    status: 'upcoming',
    createdAt: '2026-10-10T12:00:00.000Z'
  },
  {
    id: 'event_2',
    organizerId: 'user_mariana',
    title: 'Workshop: Criação de Aplicações com IA Generativa e TypeScript',
    description: 'Oficina prática abordando o uso de embeddings semânticos, APIs de modelos multimodais e arquitetura de microsserviços. Traga seu notebook com Node.js e Docker instalados.',
    category: 'workshop',
    date: '2026-10-28',
    time: '14:00 - 17:30',
    location: 'Transmissão Ao Vivo via Conferência Web RNP',
    isOnline: true,
    onlineLink: 'https://conferenciaweb.rnp.br/webconf/ifsp-ia',
    campus: 'IFSP São Paulo (Canindé)',
    attendeesCount: 95,
    interestedCount: 63,
    status: 'upcoming',
    createdAt: '2026-10-11T10:30:00.000Z'
  },
  {
    id: 'event_3',
    organizerId: 'user_lucas',
    title: 'Hackathon IFSP: Soluções Sustentáveis para Cidades Inteligentes',
    description: '48 horas de imersão desenvolvendo protótipos de IoT, aplicativos web e sistemas de dados para mobilidade e eficiência energética. Mentorias com professores e premiações em equipamentos.',
    category: 'hackathon',
    date: '2026-11-07',
    time: '08:00',
    location: 'Espaço Maker & Labs de Prototipagem',
    isOnline: false,
    campus: 'IFSP Campinas',
    attendeesCount: 78,
    interestedCount: 110,
    status: 'upcoming',
    createdAt: '2026-10-12T15:00:00.000Z'
  },
  {
    id: 'event_4',
    organizerId: 'user_carlos',
    title: 'Palestra: Carreira em Segurança Cibernética e Redes',
    description: 'Mesa redonda com ex-alunos do IFSP que hoje atuam como analistas de segurança defensiva (Blue Team) e engenheiros de infraestrutura cloud.',
    category: 'palestra',
    date: '2026-11-14',
    time: '19:30 - 21:00',
    location: 'Auditório 2 e Google Meet',
    isOnline: true,
    onlineLink: 'https://meet.google.com/ifsp-sec-carreira',
    campus: 'IFSP Salto',
    attendeesCount: 46,
    interestedCount: 39,
    status: 'upcoming',
    createdAt: '2026-10-14T11:00:00.000Z'
  }
];

export const SEED_FOLLOWS: Follow[] = [
  { id: 'f_1', followerId: 'user_vitor', followingId: 'user_mariana', createdAt: '2026-02-15T00:00:00.000Z' },
  { id: 'f_2', followerId: 'user_vitor', followingId: 'user_lucas', createdAt: '2026-02-16T00:00:00.000Z' },
  { id: 'f_3', followerId: 'user_lucas', followingId: 'user_vitor', createdAt: '2026-02-18T00:00:00.000Z' },
  { id: 'f_4', followerId: 'user_beatriz', followingId: 'user_vitor', createdAt: '2026-02-20T00:00:00.000Z' },
  { id: 'f_5', followerId: 'user_carlos', followingId: 'user_mariana', createdAt: '2026-02-21T00:00:00.000Z' }
];

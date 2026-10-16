# Fórum Paralelo IFSP — Plano de Implementação

Rede social acadêmica completa para a comunidade do Instituto Federal de São Paulo (IFSP), conectando estudantes, professores e egressos através de publicações acadêmicas, grupos de pesquisa, eventos dos campi, mensagens diretas e moderação comunitária.

## User Review & Critical Decisions

> [!IMPORTANT]
> Decisões confirmadas na Fase de Clarificação:
> - **Persistência de Dados**: Armazenamento reativo local com `localStorage` + `BroadcastChannel`, garantindo persistência imediata, suporte a múltiplos usuários/sessões e funcionamento sem bloqueios de credenciais externas.
> - **Identidade Visual**: Paleta institucional verde IFSP (`#059669` / `#065f46`), contrastes neutros refinados, tipografia moderna (`Plus Jakarta Sans` e `Public Sans`) e alternância completa entre modo claro e escuro.
> - **Dados Iniciais**: Inicialização automática com 8 campi reais do IFSP (São Paulo - Pirituba, Canindé, Campinas, Guarulhos, São Carlos, Salto, Sertãozinho e Suzano), perfis acadêmicos estruturados e postagens/eventos temáticos.

---

## 1. Overview & Core Concept

- **O que faz**: O Fórum Paralelo IFSP é uma plataforma colaborativa universitária descentralizada e segura onde a comunidade do IFSP compartilha oportunidades acadêmicas (iniciação científica, projetos integradores, estágios), debate tópicos de matérias, organiza eventos de tecnologia e cultura dos campi, conversa em tempo real por chat privado e constrói networking acadêmico.
- **Público-Alvo**: Estudantes de cursos técnicos, tecnólogos, bacharelados, licenciaturas, professores e pesquisadores de todos os campi do IFSP.
- **Diferencial**: Organização por campi e categorias acadêmicas, moderação transparente de conteúdos, sistema de eventos com confirmação de presença e experiência responsiva fluida no desktop e no celular.

---

## 2. User Experience & Visual Design

- **Jornada do Usuário**:
  1. *Acesso & Apresentação*: Hero acadêmico limpo com apresentação da proposta comunitária, lista de campi ativos e formulários dedicados de Login, Cadastro com confirmação de senha e Recuperação de acesso.
  2. *Feed Central*: Divisão em abas "Seguindo", "Descobrir Comunidade" e "Por Campus", com compositor de posts rico (texto formatado, hashtags, links de projetos, anexos de imagem e seleção de campus).
  3. *Engajamento & Discussão*: Curtidas com debounce e contadores sem duplicatas, comentários e respostas aninhadas com edição/exclusão de autoria própria, compartilhamento interno e salvamento em favoritos.
  4. *Rede & Perfis*: Perfil acadêmico público com foto de perfil e capa personalizáveis, biografia, curso, campus, semestre e interesses, além de contadores reais de seguidores/seguindo e botão de Seguir/Deixar de Seguir com atualização instantânea.
  5. *Eventos dos Campi*: Calendário e listagem de palestras, semanas da tecnologia (Sematec), hackathons, maratonas de programação e oficinas com filtro por data, categoria e campus, além de RSVP ("Tenho Interesse" / "Vou Participar").
  6. *Mensagens Privadas (Chat)*: Conversas privadas com busca de colegas, indicadores de mensagens não lidas, envio instantâneo e histórico preservado.
  7. *Notificações & Moderação*: Central unificada de avisos e painel de moderação restrito para gestão de denúncias e métricas da plataforma.

- **Identidade Visual e Design System**:
  - *Cores*: Verde Institucional IFSP (`emerald-600` / `#059669`, `emerald-700` / `#047857` e `emerald-900` / `#064e3b`), fundos neutros (`bg-slate-50` no claro e `bg-slate-950` no escuro), cartões em `bg-white` / `bg-slate-900` com bordas sutis `border-slate-200 dark:border-slate-800`.
  - *Tipografia*: `Plus Jakarta Sans` para títulos e cabeçalhos com `text-wrap: balance`; `Public Sans` para texto de posts e comentários; números tabulares (`font-mono tabular-nums`) para contadores de interações, datas e métricas.
  - *Sem "AI Slop"*: Sem pílulas estáticas redundantes em cascata, sem falsos indicadores de telemetria, sem botões de roleplay fictícios; botões funcionais com labels diretos ("Publicar", "Comentar", "Salvar", "Participar").

---

## 3. Key Product Decisions & Trade-Offs

- **Decisão 1: Mecanismo de Dados Reativo no Frontend com Arquitetura de Repositório**
  - *Abordagem*: Implementação de uma camada de serviço estruturada (`StorageService`) com tipagem rígida TypeScript, salvando entidades em `localStorage` com eventos de sincronização em tempo real (`BroadcastChannel`).
  - *Por que*: Oferece inicialização instantânea no ambiente do Google AI Studio sem depender de credenciais externas, garantindo que novos posts, comentários, mensagens de chat e seguidores fiquem salvos imediatamente ao recarregar a página ou abrir múltiplas abas.
  - *Alternativas*: Firebase direto exigiria provisionamento manual de credenciais de projeto antes de testar a interface. A arquitetura adotada isola a camada de dados em serviços, permitindo acoplar Firestore e Firebase Auth a qualquer momento.

- **Decisão 2: Simulação de Sessão Multi-Usuário para Testes Realistas**
  - *Abordagem*: O sistema permite não apenas cadastrar novas contas e logar com senha, mas também alternar rapidamente entre perfis acadêmicos demonstrativos ("Trocar para Perfil de Teste") para testar na prática:
    - O envio de mensagens de chat entre dois usuários diferentes.
    - O ato de seguir e receber a notificação correspondente.
    - O ato de comentar e curtir o post de outro estudante.
  - *Por que*: Elimina o isolamento de testes e permite validar todos os 16 critérios de aceitação do super prompt sem sair da interface.

- **Decisão 3: Moderação Comunitária & Painel Administrativo**
  - *Abordagem*: Qualquer publicação, comentário ou evento pode ser denunciado com motivo selecionável. Usuários com cargo `admin` ou `moderador` têm acesso à rota e visão do Painel Administrativo com remoção de conteúdo e suspensão de contas.

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        FÓRUM PARALELO IFSP                             │
├────────────────────────────────────────────────────────────────────────┤
│  Top Navigation (Brand Wordmark · Breadcrumb/Busca · Perfil / Tema)    │
├─────────────────────┬───────────────────────────┬──────────────────────┤
│  Sidebar Navegação  │  Viewport Central         │  Coluna Lateral      │
│  - Feed Principal   │  - Timeline de Posts      │  - Eventos Próximos  │
│  - Explorar & Busca │  - Detalhe de Publicação  │  - Sugestões p/      │
│  - Eventos Campi    │  - Conversas de Chat      │    Seguir            │
│  - Mensagens (Chat) │  - Perfil & Edição        │  - Campi em Destaque │
│  - Notificações     │  - Painel de Moderação    │  - Diretrizes IFSP   │
│  - Salvos           │  - Configurações          │                      │
├─────────────────────┴───────────────────────────┴──────────────────────┤
│  Data Store (Reactive Storage Engine / LocalStorage / BroadcastChannel)│
│  - Users · Posts · Comments · Likes · Follows · Events · Messages      │
└────────────────────────────────────────────────────────────────────────┘
```

### Entidades do Banco de Dados:
- `User`: `id`, `name`, `username`, `email`, `avatarUrl`, `bannerUrl`, `bio`, `campus`, `course`, `semester`, `role` (`student` | `teacher` | `moderator` | `admin`), `interests[]`, `followersCount`, `followingCount`, `createdAt`.
- `Post`: `id`, `authorId`, `content`, `images[]`, `tags[]`, `campus`, `likesCount`, `commentsCount`, `savedCount`, `sharesCount`, `createdAt`, `updatedAt`.
- `Comment`: `id`, `postId`, `authorId`, `content`, `parentId` (suporte a respostas aninhadas), `likesCount`, `createdAt`.
- `Like`: `id`, `userId`, `targetId`, `targetType` (`post` | `comment`), `createdAt`.
- `Follow`: `id`, `followerId`, `followingId`, `createdAt`.
- `Conversation`: `id`, `participants[]`, `lastMessage`, `lastMessageAt`, `unreadCount`.
- `Message`: `id`, `conversationId`, `senderId`, `content`, `createdAt`, `read`.
- `Event`: `id`, `organizerId`, `title`, `description`, `coverUrl`, `category`, `date`, `time`, `location`, `isOnline`, `campus`, `attendeesCount`, `interestedCount`, `status` (`upcoming` | `ongoing` | `concluded`), `createdAt`.
- `EventParticipant`: `id`, `eventId`, `userId`, `status` (`attending` | `interested`), `createdAt`.
- `Notification`: `id`, `userId`, `actorId`, `type` (`follow` | `like` | `comment` | `message` | `event`), `referenceId`, `content`, `read`, `createdAt`.
- `Report`: `id`, `reporterId`, `targetId`, `targetType` (`post` | `comment` | `event` | `user`), `reason`, `status` (`pending` | `resolved` | `dismissed`), `createdAt`.

---

## 5. Implementation Roadmap

1. **Camada de Dados & Tipos**: Modelagem rigorosa em TypeScript e motor de persistência reativa com sementes reais de campi e estudantes do IFSP.
2. **Contexto de Autenticação e Tema**: Autenticação com sessão persistente, perfil ativo, alternância de usuário de teste e tema claro/escuro.
3. **Navegação & Layout Responsivo**: Barra superior limpa com o contrato anti-slop, barra lateral expansível e gaveta móvel para celular.
4. **Módulo de Feed & Posts**: Criação de posts, upload/seleção de mídia, abas "Seguindo" / "Descobrir" / "Campi", curtidas sem duplicatas, salvamento e compartilhamento.
5. **Comentários & Discussão**: Respostas aninhadas, contadores precisos, edição e exclusão de itens de autoria própria.
6. **Módulo de Chat Privado**: Lista de conversas, busca de usuários do IFSP, janela de mensagens instantânea e histórico persistente.
7. **Módulo de Eventos Acadêmicos**: Grade de eventos com filtros por campus e categoria, criação de eventos e botão de participação/interesse.
8. **Módulo de Notificações, Busca & Moderação**: Filtro e marcação de lidas, pesquisa integrada com debounce e painel administrativo com controle de denúncias.
9. **Verificação & Refinamento**: Validação de responsividade, contraste WCAG AA e compilação limpa sem erros de TypeScript.

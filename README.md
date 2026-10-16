# Fórum Paralelo IFSP

Fórum independente para a comunidade do IFSP: publicações com hashtags e comentários,
eventos dos campi com confirmação de presença, mensagens diretas, notificações e
painel de moderação.

É um protótipo **sem servidor**: contas, publicações e mensagens ficam salvas no
`localStorage` do navegador. Por isso o login não confere senha e a recuperação de
senha não envia e-mail. Para testar interações entre pessoas, use
**Menu da conta → Trocar de conta**.

## Rodando

Requer Node.js 20+.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # gera dist/
npm run lint     # checagem de tipos (TypeScript strict)
```

## Estrutura

```
src/
  App.tsx               layout (3 colunas no desktop, barra inferior no celular) e rotas
  lib/router.ts         rotas por hash (#/profile/<id>, #/post/<id>…), botão voltar funciona
  lib/format.ts         datas relativas, datas de evento, status do evento
  components/ui.tsx     botões, campos, abas, modal (bottom sheet no celular), menu, toast
  components/           PostCard, EventCard, Navbar, Sidebar, modais
  views/                uma tela por rota
  services/storage.ts   camada de dados sobre o localStorage
  data/                 campi, categorias e dados de exemplo
```

As cores ficam em variáveis CSS em `src/index.css` (`--accent`, `--surface`, `--line`…);
o modo escuro só troca esses valores.

# Nexo

Não mostre apenas quem você é. Mostre o que você está se tornando.

Repositório: [https://github.com/ramara-1/nexo](https://github.com/ramara-1/nexo)

## Publicar (Vercel)

1. Abra [vercel.com/new](https://vercel.com/new) e entre com a **mesma conta do GitHub**.
2. Importe o projeto **ramara-1/nexo**.
3. Em Storage, crie um banco **Postgres** (Neon) e ligue ao projeto — isso preenche `DATABASE_URL`.
4. Em Environment Variables, crie também:
   - `AUTH_SECRET` = uma frase longa qualquer (exemplo: `nexo-segredo-mude-isto-123`)
5. Clique em **Deploy**.

Depois, crie sua conta no site publicado. As contas de demo só existem se você rodar o seed no banco da nuvem.

## Como rodar no computador

Precisa de Postgres (`DATABASE_URL`) e:

```bash
copy .env.example .env
npm install
npx prisma db push
npx prisma db seed
npm run dev
```

O site na internet usa o banco da Vercel. Neste computador, o `npm run dev` também precisa de um `DATABASE_URL` de Postgres (pode copiar o da Vercel depois do primeiro deploy).

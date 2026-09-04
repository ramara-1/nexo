import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const password = "nexo123";

async function main() {
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.report.deleteMany();
  await prisma.mute.deleteMany();
  await prisma.block.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.reaction.deleteMany();
  await prisma.post.deleteMany();
  await prisma.project.deleteMany();
  await prisma.follow.deleteMany();
  await prisma.user.deleteMany();

  const hash = await bcrypt.hash(password, 10);

  const marina = await prisma.user.create({
    data: {
      handle: "marina",
      name: "Marina Alves",
      email: "marina@nexo.social",
      passwordHash: hash,
      bio: "Construo ferramentas pequenas para o comércio de rua.",
      thinking: "Como um lojista anota manutenção sem virar planilha infinita.",
      doing: "Um aplicativo de manutenção para oficinas.",
      learning: "Banco de dados e o hábito de pedir ajuda cedo.",
      helpOffering: "Posso revisar textos de produto e fluxos de cadastro.",
      helpSeeking: "Alguém que já tenha publicado app na loja.",
      avatarHue: 18,
      onboardingDone: true,
      spacePrivacy: JSON.stringify({
        bio: "public",
        thinking: "public",
        doing: "public",
        learning: "public",
        projects: "public",
        achievements: "public",
        ideas: "public",
        helpOffering: "public",
        helpSeeking: "followers",
      }),
    },
  });

  const leo = await prisma.user.create({
    data: {
      handle: "leo",
      name: "Léo Navarro",
      email: "leo@nexo.social",
      passwordHash: hash,
      bio: "Cozinha e código. Às vezes no mesmo dia.",
      thinking: "Receitas também são sistemas: entrada, espera, resultado.",
      doing: "Um caderno aberto de erros que já cometi no fogão e no terminal.",
      learning: "Como explicar um bug sem vergonha.",
      helpOffering: "SQL, receitas de aproveitamento e calma na hora do erro.",
      helpSeeking: "Alguém para testar textos de dicas.",
      avatarHue: 162,
      onboardingDone: true,
    },
  });

  const ana = await prisma.user.create({
    data: {
      handle: "ana",
      name: "Ana Okada",
      email: "ana@nexo.social",
      passwordHash: hash,
      bio: "Arquitetura de interiores e cerâmica.",
      thinking: "Espaços que ensinam a pessoa a ficar.",
      doing: "Um ateliê compartilhado no bairro.",
      learning: "Gestão de um espaço coletivo sem virar escritório.",
      helpOffering: "Posso desenhar a jornada de um produto no papel.",
      helpSeeking: "Ajuda com contratos simples entre sócios.",
      avatarHue: 210,
      onboardingDone: true,
    },
  });

  const rafa = await prisma.user.create({
    data: {
      handle: "rafa",
      name: "Rafael Moura",
      email: "rafa@nexo.social",
      passwordHash: hash,
      bio: "Corro de manhã. Ensino o que aprendi de tarde.",
      thinking: "Disciplina sem punição.",
      doing: "Um grupo de corrida para iniciantes da periferia.",
      learning: "Como acolher quem chega cansado de se comparar.",
      helpOffering: "Treinos leves e constância.",
      helpSeeking: "Um lugar coberto para os dias de chuva.",
      avatarHue: 42,
      onboardingDone: true,
    },
  });

  const caio = await prisma.user.create({
    data: {
      handle: "caio",
      name: "Caio Benedetti",
      email: "caio@nexo.social",
      passwordHash: hash,
      bio: "Som, vinil e o silêncio entre as faixas.",
      thinking: "Como uma playlist pode ser um diário.",
      doing: "Um clube de escuta mensal.",
      learning: "Captação simples com o celular.",
      helpOffering: "Posso indicar discos e ajudar a gravar um áudio limpo.",
      helpSeeking: "Alguém com sala para 20 pessoas.",
      avatarHue: 280,
      onboardingDone: true,
    },
  });

  const app = await prisma.project.create({
    data: {
      title: "Aplicativo de manutenção",
      status: "progress",
      authorId: marina.id,
    },
  });

  const atelie = await prisma.project.create({
    data: {
      title: "Ateliê compartilhado",
      status: "building",
      authorId: ana.id,
    },
  });

  const p1 = await prisma.post.create({
    data: {
      authorId: marina.id,
      projectId: app.id,
      kind: "idea",
      body: "Vou criar um aplicativo para oficinas anotarem manutenção sem virar caderno perdido. Ainda é só a ideia — e está tudo bem.",
    },
  });
  const p2 = await prisma.post.create({
    data: {
      authorId: marina.id,
      projectId: app.id,
      kind: "building",
      body: "Comecei a desenvolver. Primeira tela: um botão enorme escrito “nova ordem”. Sem menu, sem vaidade.",
      mediaUrl:
        "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80",
      mediaKind: "image",
    },
  });
  await prisma.post.create({
    data: {
      authorId: marina.id,
      projectId: app.id,
      kind: "learning",
      body: "Aprendizado: a oficina não quer dashboard. Quer saber o que está atrasado hoje.",
    },
  });
  const help = await prisma.post.create({
    data: {
      authorId: marina.id,
      projectId: app.id,
      kind: "help",
      body: "Estou tentando criar meu aplicativo, mas a lista de ordens some quando o celular gira. Alguém já viu isso?",
      location: "São Paulo",
    },
  });
  await prisma.post.create({
    data: {
      authorId: leo.id,
      kind: "tip",
      body: "Dica: quando o erro parecer pessoal, descreva só o que a tela fez. A vergonha some e a ajuda chega.",
    },
  });
  await prisma.post.create({
    data: {
      authorId: ana.id,
      projectId: atelie.id,
      kind: "building",
      body: "O ateliê ainda é um galpão com três mesas. Mas já tem gente perguntando se pode chegar no sábado.",
      mediaUrl:
        "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&w=1200&q=80",
      mediaKind: "image",
    },
  });
  await prisma.post.create({
    data: {
      authorId: rafa.id,
      kind: "achievement",
      body: "O grupo de corrida completou a primeira semana sem ninguém desistir. Não é recorde. É começo.",
    },
  });
  await prisma.post.create({
    data: {
      authorId: caio.id,
      kind: "talk",
      body: "Toquei um disco de 1974 inteiro sem pular faixa. A terceira música parece ter sido feita para a janela aberta.",
    },
  });

  await prisma.follow.createMany({
    data: [
      { followerId: marina.id, followingId: leo.id },
      { followerId: marina.id, followingId: ana.id },
      { followerId: marina.id, followingId: caio.id },
      { followerId: leo.id, followingId: marina.id },
      { followerId: leo.id, followingId: rafa.id },
      { followerId: ana.id, followingId: marina.id },
      { followerId: ana.id, followingId: caio.id },
      { followerId: rafa.id, followingId: leo.id },
      { followerId: rafa.id, followingId: marina.id },
      { followerId: caio.id, followingId: ana.id },
      { followerId: caio.id, followingId: marina.id },
    ],
  });

  await prisma.reaction.createMany({
    data: [
      { userId: leo.id, postId: p1.id, kind: "idea" },
      { userId: ana.id, postId: p1.id, kind: "inspiring" },
      { userId: rafa.id, postId: p2.id, kind: "congrats" },
      { userId: marina.id, postId: help.id, kind: "like" },
    ],
  });

  const comment = await prisma.comment.create({
    data: {
      userId: leo.id,
      postId: help.id,
      body: "Se a lista some na rotação, o estado está só na memória da tela. Guarda as ordens fora do componente — eu te mando um exemplo se quiser.",
      markedHelpful: true,
      helpedUserId: leo.id,
    },
  });

  await prisma.post.update({
    where: { id: help.id },
    data: { helpResolved: true },
  });

  await prisma.notification.createMany({
    data: [
      { userId: marina.id, actorId: leo.id, type: "helped", postId: help.id },
      { userId: leo.id, actorId: marina.id, type: "recognized", postId: help.id },
      { userId: marina.id, actorId: ana.id, type: "follow" },
      { userId: marina.id, actorId: leo.id, type: "react_idea", postId: p1.id },
    ],
  });

  void comment;

  const idsML = marina.id < leo.id ? { userAId: marina.id, userBId: leo.id } : { userAId: leo.id, userBId: marina.id };
  const idsMA = marina.id < ana.id ? { userAId: marina.id, userBId: ana.id } : { userAId: ana.id, userBId: marina.id };
  const chatLeo = await prisma.conversation.create({ data: idsML });
  const chatAna = await prisma.conversation.create({ data: idsMA });
  await prisma.message.createMany({
    data: [
      {
        conversationId: chatLeo.id,
        senderId: leo.id,
        body: "Marina, vi seu pedido de ajuda. Posso te mostrar como guardar a lista fora da tela.",
      },
      {
        conversationId: chatLeo.id,
        senderId: marina.id,
        body: "Aceito! Quero terminar o app de manutenção essa semana.",
      },
      {
        conversationId: chatLeo.id,
        senderId: leo.id,
        body: "Combinado. Depois te mando o exemplo e um arquivo com o fluxo.",
      },
      {
        conversationId: chatAna.id,
        senderId: ana.id,
        body: "Seu app e o ateliê têm a mesma pergunta: o que a pessoa precisa resolver hoje?",
      },
      {
        conversationId: chatAna.id,
        senderId: marina.id,
        body: "Verdade. Quero desenhar isso no papel com você.",
      },
    ],
  });

  console.log("Nexo semeado. Senha: nexo123");
  console.log("marina@nexo.social  leo@nexo.social  ana@nexo.social");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
